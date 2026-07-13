const ChoreyApp = (() => {
  const { getPerson, escapeHTML } = ChoreyUtils;
  const { profileRepository, taskRepository, occurrenceRepository, dailyRepository } = ChoreyRepositories;

  let activeDayData = null;
  let congratsTriggeredForToday = false;

  async function getActivePerson() {
    return getPerson(await profileRepository.getActivePersonId());
  }

  async function initApp() {
    const activePerson = await getActivePerson();
    const tasks = await taskRepository.getAll();
    activeDayData = ChoreyScheduler.buildDayData(tasks, activePerson);

    document.getElementById("date-subheading").textContent = activeDayData.displayDate;
    await dailyRepository.prepare(activeDayData.dateKey);
    congratsTriggeredForToday = await dailyRepository.getCongratulationsShown();

    ChoreyUI.updateHeader(activePerson, async () => {
      await ChoreyTaskCreator.open(await getActivePerson(), initApp);
    });

    if (!activePerson) {
      await profileRepository.clearActivePerson();
      renderLoginScreen();
      return;
    }

    await renderView();
  }

  function renderLoginScreen() {
    ChoreyUI.renderLoginScreen(async personId => {
      const person = getPerson(personId);
      const passcode = prompt(`Enter passcode for ${person.name}:`);
      if (passcode === person.passcode) {
        await profileRepository.setActivePersonId(person.id);
        await initApp();
      } else if (passcode !== null) {
        alert("Incorrect profile passcode.");
      }
    });
  }

  async function mergeLegacyStates(states) {
    const legacy = await occurrenceRepository.getLegacyDailyStates();
    let changed = false;

    activeDayData.occurrences.forEach(item => {
      if (states[item.id]) return;
      const oldId = ChoreyScheduler.legacyStateId(item.task, item.occurrence);
      if (oldId && legacy[oldId]) {
        states[item.id] = legacy[oldId];
        changed = true;
      }
    });

    if (changed) {
      await occurrenceRepository.saveAll(states);
      await occurrenceRepository.clearLegacyDailyStates();
    }

    return states;
  }

  async function renderView() {
    const viewport = document.getElementById("app-viewport");
    const activePerson = await getActivePerson();
    if (!activePerson) return renderLoginScreen();
    if (!activeDayData.occurrences.length) return ChoreyUI.renderEmptyDay();

    const states = await mergeLegacyStates(await occurrenceRepository.getAll());
    const sections = new Map([["unassigned", []], ...people.map(person => [person.id, []])]);

    activeDayData.occurrences.forEach(item => {
      const state = states[item.id] || {
        assignedToId: null,
        isDone: false,
        completedById: null,
        assignedByAdmin: false,
        assignedByCompletion: false,
      };
      const configured = { ...item, ...state };
      const sectionId = getPerson(configured.assignedToId) ? configured.assignedToId : "unassigned";
      sections.get(sectionId).push(configured);
    });

    const completed = activeDayData.occurrences.filter(item => states[item.id]?.isDone).length;
    if (completed === activeDayData.occurrences.length && !congratsTriggeredForToday) {
      await triggerTemporaryCongrats();
    }

    ChoreySwipe.resetOpenRow();
    viewport.innerHTML = ChoreyUI.renderBoard(activePerson, activeDayData, sections);

    viewport.querySelectorAll(".chore-item[data-id]").forEach(row => {
      row.querySelector(".chore-text-target")?.addEventListener("click", async event => {
        event.stopPropagation();
        await handleTaskTextTap(row.dataset.id);
      });

      const checkbox = row.querySelector(".chore-checkbox");
      checkbox?.addEventListener("click", event => event.stopPropagation());
      checkbox?.addEventListener("change", async event => {
        if (!await toggleCompletion(row.dataset.id, event.target.checked)) {
          event.target.checked = !event.target.checked;
        }
      });
    });

    viewport.querySelectorAll(".swipe-row.can-delete").forEach(wrapper => {
      ChoreySwipe.enableDelete(wrapper, {
        getTask: async taskId => (await taskRepository.getAll()).find(task => task.id === taskId),
        getActivePerson,
        deleteTask: taskId => taskRepository.delete(taskId),
        refresh: initApp,
      });
    });
  }

  async function handleTaskTextTap(id) {
    const active = await getActivePerson();
    const states = await occurrenceRepository.getAll();
    const current = states[id] || { assignedToId: null, isDone: false, assignedByAdmin: false, assignedByCompletion: false };
    if (current.isDone) return;
    if (active.isOwner || active.isAdmin) return openAssignmentModal(id, active);

    if (current.assignedToId === null) {
      states[id] = { assignedToId: active.id, isDone: false, completedById: null, assignedByAdmin: false, assignedByCompletion: false };
    } else if (current.assignedToId === active.id && !current.assignedByAdmin) {
      delete states[id];
    } else {
      return;
    }

    await occurrenceRepository.saveAll(states);
    await renderView();
  }

  function openAssignmentModal(id, active) {
    const assignable = people.filter(person => active.isOwner || !person.isAdmin || person.id === active.id);
    const overlay = document.createElement("div");
    overlay.className = "assignment-overlay";
    overlay.innerHTML = `<div class="assignment-modal-card"><div class="assignment-modal-title">Assign Task</div><ul class="chore-list">${assignable.map(person => `<li class="chore-item profile-card" data-assign="${person.id}" style="--person-accent:${person.accent}"><span class="chore-title">${escapeHTML(person.name)}</span></li>`).join("")}<li class="chore-item unassigned-option" data-assign=""><span class="chore-title">Unassigned</span></li></ul><button class="modal-cancel">Cancel</button></div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll("[data-assign]").forEach(row => row.addEventListener("click", async () => {
      const states = await occurrenceRepository.getAll();
      const current = states[id] || {};
      const target = row.dataset.assign || null;
      if (target) {
        states[id] = {
          ...current,
          assignedToId: target,
          isDone: false,
          completedById: null,
          assignedByAdmin: target !== active.id,
          assignedByCompletion: false,
        };
      } else {
        delete states[id];
      }
      await occurrenceRepository.saveAll(states);
      overlay.remove();
      await renderView();
    }));

    overlay.querySelector(".modal-cancel").addEventListener("click", () => overlay.remove());
  }

  async function toggleCompletion(id, checked) {
    const active = await getActivePerson();
    const states = await occurrenceRepository.getAll();
    const current = states[id] || {
      assignedToId: null,
      isDone: false,
      completedById: null,
      assignedByAdmin: false,
      assignedByCompletion: false,
    };

    if (active.isOwner && checked) {
      states[id] = {
        ...current,
        assignedToId: current.assignedToId || active.id,
        assignedByCompletion: current.assignedToId === null,
        isDone: true,
        completedById: active.id,
        completedAt: new Date().toISOString(),
      };
    } else if (checked) {
      const assignee = getPerson(current.assignedToId);
      if (!(current.assignedToId === null || current.assignedToId === active.id || (active.isAdmin && assignee && !assignee.isAdmin))) return false;
      states[id] = {
        ...current,
        assignedToId: current.assignedToId || active.id,
        assignedByCompletion: current.assignedToId === null,
        isDone: true,
        completedById: active.id,
        completedAt: new Date().toISOString(),
      };
    } else {
      const worker = getPerson(current.completedById);
      if (!(current.completedById === active.id || active.isOwner || (active.isAdmin && (!worker || !worker.isAdmin)))) return false;
      if (current.assignedByCompletion) {
        delete states[id];
      } else {
        states[id] = { ...current, isDone: false, completedById: null, completedAt: null };
      }
    }

    if (!checked) {
      congratsTriggeredForToday = false;
      await dailyRepository.setCongratulationsShown(false);
    }

    await occurrenceRepository.saveAll(states);
    await renderView();
    return true;
  }

  async function triggerTemporaryCongrats() {
    congratsTriggeredForToday = true;
    await dailyRepository.setCongratulationsShown(true);
    ChoreyUI.showCongratulations();
  }

  document.getElementById("date-subheading").addEventListener("click", async () => {
    await profileRepository.clearActivePerson();
    await initApp();
  });

  return Object.freeze({ init: initApp });
})();

ChoreyApp.init().catch(error => {
  console.error("Chorey could not start.", error);
  alert("Chorey could not start. Reload the page and try again.");
});
