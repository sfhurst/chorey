const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const peopleById = new Map(people.map(person => [person.id, person]));

const getPerson = personId => peopleById.get(personId) || null;
const getActivePerson = () => getPerson(ChoreyStorage.getActivePersonId());
const escapeHTML = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function getWeekendInfo(date) {
  if (![0, 6].includes(date.getDay())) return null;
  const saturday = new Date(date);
  if (date.getDay() === 0) saturday.setDate(date.getDate() - 1);
  const sunday = new Date(saturday); sunday.setDate(saturday.getDate() + 1);
  const weekendNumber = Math.floor((saturday.getDate() - 1) / 7) + 1;
  const nextSaturday = new Date(saturday); nextSaturday.setDate(saturday.getDate() + 7);
  const isLast = nextSaturday.getMonth() !== saturday.getMonth();
  return { saturday, sunday, weekendNumber, isLast };
}

function isVisibleTo(task, person) {
  if (task.visibility?.type !== "private") return true;
  return Boolean(person && (task.createdById === person.id || task.visibility.visibleToIds?.includes(person.id)));
}

function getOccurrence(task, date) {
  if (!task.active) return null;
  const month = date.getMonth() + 1;
  const schedule = task.schedule;
  if (["days", "weekends"].includes(schedule.type) && schedule.months.length && !schedule.months.includes(month)) return null;

  if (schedule.type === "once") {
    if (schedule.date !== dateKey(date)) return null;
    return { key: `${task.id}@${schedule.date}`, group: "once", opensOn: schedule.date, closesOn: schedule.date };
  }

  if (schedule.type === "days") {
    if (!schedule.days.includes(date.getDay())) return null;
    const key = dateKey(date);
    return { key: `${task.id}@${key}`, group: "days", opensOn: key, closesOn: key };
  }

  if (schedule.type === "weekends") {
    const info = getWeekendInfo(date);
    if (!info) return null;
    const matches = schedule.weekend === "last" ? info.isLast : schedule.weekend === info.weekendNumber;
    if (!matches) return null;
    return { key: `${task.id}@${dateKey(info.saturday)}`, group: "weekends", opensOn: dateKey(info.saturday), closesOn: dateKey(info.sunday) };
  }

  if (schedule.type === "months") {
    if (!schedule.months.includes(month)) return null;
    const monthKey = `${date.getFullYear()}-${String(month).padStart(2, "0")}`;
    const lastDay = new Date(date.getFullYear(), month, 0);
    return { key: `${task.id}@${monthKey}`, group: "months", opensOn: `${monthKey}-01`, closesOn: dateKey(lastDay) };
  }
  return null;
}

function legacyStateId(task, occurrence) {
  const raw = `${task.category}: ${task.name}`;
  if (occurrence.group === "days") return `Chore_${raw.replace(/\s+/g, "_")}`;
  if (occurrence.group === "weekends") return `Monthly_${task.name.replace(/\s+/g, "_")}`;
  if (occurrence.group === "months") return `Yearly_${task.name.replace(/\s+/g, "_")}`;
  return null;
}

function buildDayData() {
  const today = new Date();
  const activePerson = getActivePerson();
  const occurrences = ChoreyStorage.getTasks()
    .filter(task => isVisibleTo(task, activePerson))
    .map(task => ({ task, occurrence: getOccurrence(task, today) }))
    .filter(item => item.occurrence)
    .map((item, index) => ({ ...item, originalIndex: index, id: item.occurrence.key, displayTask: `${item.task.category}: ${item.task.name}` }));

  return {
    dateKey: dateKey(today),
    displayDate: today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    occurrences,
  };
}

let activeDayData = null;
let congratsTriggeredForToday = false;

function initApp() {
  activeDayData = buildDayData();
  document.getElementById("date-subheading").textContent = activeDayData.displayDate;
  ChoreyStorage.prepareDate(activeDayData.dateKey);
  congratsTriggeredForToday = ChoreyStorage.getCongratulationsShown();
  const person = getActivePerson();
  updateHeader(person);
  if (!person) { ChoreyStorage.clearActivePerson(); renderLoginScreen(); return; }
  renderView();
}

function updateHeader(person) {
  const heading = document.getElementById("day-heading");
  const actions = document.getElementById("header-actions");
  heading.textContent = person ? "Today's Tasks" : "Select Profile";
  actions.innerHTML = person?.isOwner ? '<button class="icon-button" id="add-task-button" aria-label="Add task">+</button>' : "";
  document.getElementById("add-task-button")?.addEventListener("click", openTaskCreator);
}

document.getElementById("date-subheading").addEventListener("click", () => { ChoreyStorage.clearActivePerson(); initApp(); });

function renderLoginScreen() {
  document.getElementById("app-viewport").innerHTML = `<ul class="chore-list">${people.map(person => `<li class="chore-item profile-card" data-person-id="${escapeHTML(person.id)}" style="--person-accent:${escapeHTML(person.accent)}"><span class="chore-title profile-name">${escapeHTML(person.name)}</span></li>`).join("")}</ul>`;
  document.querySelectorAll("[data-person-id]").forEach(card => card.addEventListener("click", () => {
    const person = getPerson(card.dataset.personId);
    const passcode = prompt(`Enter passcode for ${person.name}:`);
    if (passcode === person.passcode) { ChoreyStorage.setActivePersonId(person.id); initApp(); }
    else if (passcode !== null) alert("Incorrect profile passcode.");
  }));
}

function mergeLegacyStates(states) {
  const legacy = ChoreyStorage.getLegacyDailyTaskStates();
  let changed = false;
  activeDayData.occurrences.forEach(item => {
    if (states[item.id]) return;
    const oldId = legacyStateId(item.task, item.occurrence);
    if (oldId && legacy[oldId]) { states[item.id] = legacy[oldId]; changed = true; }
  });
  if (changed) { ChoreyStorage.saveOccurrenceStates(states); ChoreyStorage.clearLegacyDailyTaskStates(); }
  return states;
}

function renderView() {
  const viewport = document.getElementById("app-viewport");
  const activePerson = getActivePerson();
  if (!activePerson) return renderLoginScreen();
  if (!activeDayData.occurrences.length) { viewport.innerHTML = '<ul class="chore-list"><li class="empty-state">All clear. No tasks are scheduled today.</li></ul>'; return; }

  const states = mergeLegacyStates(ChoreyStorage.getOccurrenceStates());
  const sections = new Map([["unassigned", []], ...people.map(person => [person.id, []])]);
  activeDayData.occurrences.forEach(item => {
    const state = states[item.id] || { assignedToId: null, isDone: false, completedById: null, assignedByAdmin: false };
    const configured = { ...item, ...state };
    const sectionId = getPerson(configured.assignedToId) ? configured.assignedToId : "unassigned";
    sections.get(sectionId).push(configured);
  });

  const completed = activeDayData.occurrences.filter(item => states[item.id]?.isDone).length;
  if (completed === activeDayData.occurrences.length && !congratsTriggeredForToday) triggerTemporaryCongrats();

  const order = ["unassigned", activePerson.id, ...people.filter(person => person.id !== activePerson.id).map(person => person.id)];
  viewport.innerHTML = order.map(id => renderSection(id, sections.get(id) || [])).join("");
  viewport.querySelectorAll(".chore-item[data-id]").forEach(row => {
    row.querySelector(".chore-text-target")?.addEventListener("click", event => { event.stopPropagation(); handleTaskTextTap(row.dataset.id); });
    const checkbox = row.querySelector(".chore-checkbox");
    checkbox?.addEventListener("click", event => event.stopPropagation());
    checkbox?.addEventListener("change", event => { if (!toggleCompletion(row.dataset.id, event.target.checked)) event.target.checked = !event.target.checked; });
  });
  viewport.querySelectorAll(".swipe-row.can-delete").forEach(enableSwipeDelete);
}

function renderSection(sectionId, items) {
  const person = getPerson(sectionId);
  const title = person ? `${person.name}'s Contributions` : "Unassigned Tasks";
  const sortItems = group => items
    .filter(item => item.occurrence.group === group)
    .sort((a, b) => Number(a.isDone) - Number(b.isDone) || a.originalIndex - b.originalIndex);

  const ordinaryItems = [...sortItems("once"), ...sortItems("days")];
  const weekendItems = sortItems("weekends");
  const monthItems = sortItems("months");
  const monthName = monthsOfYear[Number(activeDayData.dateKey.slice(5, 7)) - 1];

  const content = [
    ordinaryItems.map(renderTaskRow).join(""),
    weekendItems.length ? `<li class="task-group-label">Weekend</li>${weekendItems.map(renderTaskRow).join("")}` : "",
    monthItems.length ? `<li class="task-group-label">${escapeHTML(monthName)}</li>${monthItems.map(renderTaskRow).join("")}` : "",
  ].join("") || '<li class="empty-state compact-empty">No tasks here.</li>';

  return `<div class="section-header ${person ? "person-section" : ""}" ${person ? `style="--person-accent:${escapeHTML(person.accent)}"` : ""}><span>${escapeHTML(title)}</span><span class="section-count">${items.length} ${items.length === 1 ? "item" : "items"}</span></div><ul class="chore-list">${content}</ul>`;
}

function renderTaskRow(item) {
  const slug = item.task.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const active = getActivePerson();
  const canDelete = Boolean(active && !item.isDone && (active.isOwner || item.task.createdById === active.id));
  const taskCard = `<div class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${escapeHTML(item.id)}" data-cat="${escapeHTML(slug)}"><input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1"><div class="chore-text-target"><span class="chore-title">${escapeHTML(item.displayTask)}</span></div></div>`;
  if (!canDelete) return `<li class="swipe-row">${taskCard}</li>`;
  return `<li class="swipe-row can-delete" data-task-id="${escapeHTML(item.task.id)}"><button class="swipe-delete-button" type="button" aria-label="Delete ${escapeHTML(item.displayTask)}">Delete</button>${taskCard}</li>`;
}

function enableSwipeDelete(wrapper) {
  const card = wrapper.querySelector(".chore-item");
  const deleteButton = wrapper.querySelector(".swipe-delete-button");
  if (!card || !deleteButton) return;

  const revealWidth = 88;
  let startX = 0;
  let startY = 0;
  let startingOffset = 0;
  let currentOffset = 0;
  let tracking = false;
  let horizontal = false;

  const setOffset = value => {
    currentOffset = Math.max(-revealWidth, Math.min(0, value));
    card.style.transform = `translateX(${currentOffset}px)`;
    wrapper.classList.toggle("swipe-open", currentOffset <= -revealWidth / 2);
  };

  const close = () => setOffset(0);
  const open = () => setOffset(-revealWidth);

  card.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    tracking = true;
    horizontal = false;
    startX = event.clientX;
    startY = event.clientY;
    startingOffset = wrapper.classList.contains("swipe-open") ? -revealWidth : 0;
    card.setPointerCapture?.(event.pointerId);
    card.classList.add("swiping");
  });

  card.addEventListener("pointermove", event => {
    if (!tracking) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!horizontal && Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
    if (!horizontal) {
      if (Math.abs(dy) > Math.abs(dx)) { tracking = false; card.classList.remove("swiping"); return; }
      horizontal = true;
    }
    event.preventDefault();
    setOffset(startingOffset + dx);
  });

  let suppressClick = false;
  card.addEventListener("click", event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);

  const finish = event => {
    if (!tracking) return;
    tracking = false;
    card.classList.remove("swiping");
    if (horizontal) {
      suppressClick = true;
      event.preventDefault();
      event.stopPropagation();
      currentOffset <= -revealWidth / 2 ? open() : close();
      window.setTimeout(() => { suppressClick = false; }, 350);
    }
  };

  card.addEventListener("pointerup", finish);
  card.addEventListener("pointercancel", () => { tracking = false; card.classList.remove("swiping"); currentOffset <= -revealWidth / 2 ? open() : close(); });

  deleteButton.addEventListener("click", event => {
    event.stopPropagation();
    const task = ChoreyStorage.getTasks().find(candidate => candidate.id === wrapper.dataset.taskId);
    if (!task) return renderView();
    const active = getActivePerson();
    if (!(active && (active.isOwner || task.createdById === active.id))) return close();
    const label = `${task.category}: ${task.name}`;
    if (task.schedule.type === "once") {
      if (!confirm(`Delete “${label}”?`)) return close();
    } else {
      if (!confirm(`Permanently delete recurring task “${label}”?\n\nIt will be removed from storage and will not appear again in future schedules.`)) return close();
      if (!confirm(`This also removes its saved assignment and completion records. This cannot be undone.\n\nDelete “${label}” permanently?`)) return close();
    }
    ChoreyStorage.deleteTask(task.id);
    activeDayData = buildDayData();
    renderView();
  });
}

function handleTaskTextTap(id) {
  const active = getActivePerson();
  const states = ChoreyStorage.getOccurrenceStates();
  const current = states[id] || { assignedToId: null, isDone: false, assignedByAdmin: false };
  if (current.isDone) return;
  if (active.isOwner || active.isAdmin) return openAssignmentModal(id, active);
  if (current.assignedToId === null) states[id] = { assignedToId: active.id, isDone: false, completedById: null, assignedByAdmin: false };
  else if (current.assignedToId === active.id && !current.assignedByAdmin) delete states[id];
  else return;
  ChoreyStorage.saveOccurrenceStates(states); renderView();
}

function openAssignmentModal(id, active) {
  const assignable = people.filter(person => active.isOwner || !person.isAdmin || person.id === active.id);
  const overlay = document.createElement("div"); overlay.className = "assignment-overlay";
  overlay.innerHTML = `<div class="assignment-modal-card"><div class="assignment-modal-title">Assign Task</div><ul class="chore-list">${assignable.map(person => `<li class="chore-item profile-card" data-assign="${person.id}" style="--person-accent:${person.accent}"><span class="chore-title">${escapeHTML(person.name)}</span></li>`).join("")}<li class="chore-item unassigned-option" data-assign=""><span class="chore-title">Unassigned</span></li></ul><button class="modal-cancel">Cancel</button></div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll("[data-assign]").forEach(row => row.addEventListener("click", () => {
    const states = ChoreyStorage.getOccurrenceStates(); const current = states[id] || {};
    const target = row.dataset.assign || null;
    if (target) states[id] = { ...current, assignedToId: target, isDone: false, completedById: null, assignedByAdmin: target !== active.id };
    else delete states[id];
    ChoreyStorage.saveOccurrenceStates(states); overlay.remove(); renderView();
  }));
  overlay.querySelector(".modal-cancel").addEventListener("click", () => overlay.remove());
}

function toggleCompletion(id, checked) {
  const active = getActivePerson();
  const states = ChoreyStorage.getOccurrenceStates();
  const current = states[id] || { assignedToId: null, isDone: false, completedById: null, assignedByAdmin: false };
  if (active.isOwner) {
    states[id] = { ...current, assignedToId: current.assignedToId || active.id, isDone: checked, completedById: checked ? active.id : null, completedAt: checked ? new Date().toISOString() : null };
  } else if (checked) {
    const assignee = getPerson(current.assignedToId);
    if (!(current.assignedToId === null || current.assignedToId === active.id || (active.isAdmin && assignee && !assignee.isAdmin))) return false;
    states[id] = { ...current, assignedToId: current.assignedToId || active.id, isDone: true, completedById: active.id, completedAt: new Date().toISOString() };
  } else {
    const worker = getPerson(current.completedById);
    if (!(current.completedById === active.id || (active.isAdmin && (!worker || !worker.isAdmin)))) return false;
    if (current.assignedByAdmin) states[id] = { ...current, isDone: false, completedById: null, completedAt: null };
    else delete states[id];
  }
  if (!checked) { congratsTriggeredForToday = false; ChoreyStorage.setCongratulationsShown(false); }
  ChoreyStorage.saveOccurrenceStates(states); renderView(); return true;
}

function triggerTemporaryCongrats() {
  congratsTriggeredForToday = true; ChoreyStorage.setCongratulationsShown(true);
  const overlay = document.createElement("div"); overlay.className = "congrats-overlay"; overlay.innerHTML = "<h2>All Tasks Done</h2><p>Everything is checked off. Enjoy your day.</p>"; document.body.appendChild(overlay);
  setTimeout(() => { overlay.classList.add("fade-out"); setTimeout(() => overlay.remove(), 400); }, 4600);
}

function openTaskCreator() {
  const owner = getActivePerson();
  if (!owner?.isOwner) return;
  const draft = { name: "", category: "General", type: null, days: [], weekend: null, months: [], date: null, seasonal: false };
  const overlay = document.createElement("div"); overlay.className = "assignment-overlay"; document.body.appendChild(overlay);

  const show = html => { overlay.innerHTML = `<div class="assignment-modal-card task-creator">${html}</div>`; };
  const cancelButton = () => '<button class="modal-cancel" data-cancel>Cancel</button>';
  const bindCancel = () => overlay.querySelector("[data-cancel]")?.addEventListener("click", () => overlay.remove());

  function askName() {
    show(`<div class="assignment-modal-title">New Task</div><label class="field-label">Name<input class="text-input" id="task-name" maxlength="80" autofocus></label><button class="primary-button" id="continue">Continue</button>${cancelButton()}`);
    bindCancel(); overlay.querySelector("#continue").addEventListener("click", () => {
      draft.name = overlay.querySelector("#task-name").value.trim();
      if (!draft.name) return alert("Enter a task name.");
      chooseCategory();
    });
  }

  function getExistingCategories() {
    const categories = new Map();
    const addCategory = value => {
      const category = String(value || "").trim();
      if (!category) return;
      const key = category.toLocaleLowerCase();
      if (!categories.has(key)) categories.set(key, category);
    };

    // The original day schedule is the authoritative seed category list.
    // Weekend and month tasks previously received inferred categories during
    // migration; those inferred values must not populate this selector.
    Object.values(legacyChoreSchedule.days).flat().forEach(label => {
      addCategory(splitTaskLabel(label).category);
    });

    // Keep categories deliberately created by the owner after Milestone 2.
    ChoreyStorage.getTasks()
      .filter(task => task.active !== false && !/^task-(days|weekends|months)-/.test(String(task.id || "")))
      .forEach(task => addCategory(task.category));

    return [...categories.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function chooseCategory() {
    const categories = getExistingCategories();
    show(`<div class="assignment-modal-title">Choose a category</div><ul class="chore-list category-selector-list">${categories.map(category => `<li class="chore-item selector-row" data-category="${escapeHTML(category)}"><span class="chore-title">${escapeHTML(category)}</span></li>`).join("")}<li class="chore-item selector-row" data-new-category><span class="chore-title">Add new category</span></li></ul>${cancelButton()}`);
    bindCancel();
    overlay.querySelectorAll("[data-category]").forEach(row => row.addEventListener("click", () => {
      draft.category = row.dataset.category;
      chooseType();
    }));
    overlay.querySelector("[data-new-category]").addEventListener("click", askNewCategory);
  }

  function askNewCategory() {
    show(`<div class="assignment-modal-title">New category</div><label class="field-label">Category name<input class="text-input" id="new-category" maxlength="40" autofocus></label><button class="primary-button" id="accept-category">Accept</button>${cancelButton()}`);
    bindCancel();
    overlay.querySelector("#accept-category").addEventListener("click", () => {
      const category = overlay.querySelector("#new-category").value.trim();
      if (!category) return alert("Enter a category name.");
      const existing = getExistingCategories().find(item => item.localeCompare(category, undefined, { sensitivity: "base" }) === 0);
      draft.category = existing || category;
      chooseType();
    });
  }

  function chooseType() {
    show(`<div class="assignment-modal-title">How often?</div><ul class="chore-list">${[["once","Once"],["days","Days"],["weekends","Weekends"],["months","Months"]].map(([value,label]) => `<li class="chore-item selector-row" data-type="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul>${cancelButton()}`);
    bindCancel(); overlay.querySelectorAll("[data-type]").forEach(row => row.addEventListener("click", () => { draft.type = row.dataset.type; if (draft.type === "once") chooseDate(); else if (draft.type === "days") chooseDays(); else if (draft.type === "weekends") chooseWeekend(); else chooseMonths(false); }));
  }

  function chooseDate() {
    const today = new Date(); const options = [];
    for (let offset = 0; offset < 8; offset++) { const date = new Date(today); date.setDate(today.getDate() + offset); const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : offset === 7 ? `Next ${daysOfWeek[date.getDay()]}` : daysOfWeek[date.getDay()]; options.push({ label, value: dateKey(date) }); }
    show(`<div class="assignment-modal-title">Choose a day</div><ul class="chore-list">${options.map(option => `<li class="chore-item selector-row" data-date="${option.value}"><span class="chore-title">${option.label}</span></li>`).join("")}</ul>${cancelButton()}`); bindCancel();
    overlay.querySelectorAll("[data-date]").forEach(row => row.addEventListener("click", () => { draft.date = row.dataset.date; saveTask(); }));
  }

  function chooseDays() {
    show(`<div class="assignment-modal-title">Choose days</div><div class="selector-list">${daysOfWeek.map((day, index) => `<label class="selector-check"><input type="checkbox" value="${index}"><span>${day}</span></label>`).join("")}<label class="selector-check seasonal-check"><input type="checkbox" id="seasonal"><span>Seasonal</span></label></div><button class="primary-button" id="accept">Accept</button>${cancelButton()}`); bindCancel();
    overlay.querySelector("#accept").addEventListener("click", () => { draft.days = [...overlay.querySelectorAll('.selector-check input[type="checkbox"]:checked')].filter(input => input.id !== "seasonal").map(input => Number(input.value)); draft.seasonal = overlay.querySelector("#seasonal").checked; if (!draft.days.length) return alert("Choose at least one day."); draft.seasonal ? chooseMonths(true) : saveTask(); });
  }

  function chooseWeekend() {
    const options = [[1,"First weekend"],[2,"Second weekend"],[3,"Third weekend"],[4,"Fourth weekend"],[5,"Fifth weekend"],["last","Last weekend"]];
    show(`<div class="assignment-modal-title">Choose a weekend</div><ul class="chore-list">${options.map(([value,label]) => `<li class="chore-item selector-row" data-weekend="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul><label class="selector-check seasonal-check"><input type="checkbox" id="seasonal"><span>Seasonal</span></label>${cancelButton()}`); bindCancel();
    overlay.querySelectorAll("[data-weekend]").forEach(row => row.addEventListener("click", () => { draft.weekend = row.dataset.weekend === "last" ? "last" : Number(row.dataset.weekend); draft.seasonal = overlay.querySelector("#seasonal").checked; draft.seasonal ? chooseMonths(true) : saveTask(); }));
  }

  function chooseMonths(isSeasonal) {
    show(`<div class="assignment-modal-title">${isSeasonal ? "Choose active months" : "Choose months"}</div><div class="selector-list">${monthsOfYear.map((month, index) => `<label class="selector-check"><input type="checkbox" value="${index + 1}"><span>${month}</span></label>`).join("")}</div><button class="primary-button" id="accept">Accept</button>${cancelButton()}`); bindCancel();
    overlay.querySelector("#accept").addEventListener("click", () => { draft.months = [...overlay.querySelectorAll('.selector-check input:checked')].map(input => Number(input.value)); if (!draft.months.length) return alert("Choose at least one month."); saveTask(); });
  }

  function saveTask() {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    ChoreyStorage.addTask({ id, name: draft.name, category: draft.category, schedule: { type: draft.type, date: draft.date, days: draft.days, weekend: draft.weekend, months: draft.months }, visibility: { type: "household", visibleToIds: [] }, createdById: owner.id, createdAt: new Date().toISOString(), active: true });
    overlay.remove(); initApp();
  }
  askName();
}

initApp();
