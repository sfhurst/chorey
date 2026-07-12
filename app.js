// ==========================================
// 1. LOGIC ENGINE
// ==========================================
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const familyRoster = {
  // Steve is now the Owner
  Steve: { code: "0612", themeCat: "kitchen", isAdmin: true, isOwner: true },
  Sandy: { code: "1018", themeCat: "basement", isAdmin: true, isOwner: false },
  Jace: { code: "0302", themeCat: "upstairs-bedrooms", isAdmin: false, isOwner: false },
  Phin: { code: "0228", themeCat: "upstairs-bathroom", isAdmin: false, isOwner: false },
};

function getWeekOfMonth(date) {
  return Math.ceil(date.getDate() / 7);
}

function getSaturdayAnchorDate(today) {
  const currentDayIndex = today.getDay();
  const anchor = new Date(today);

  if (currentDayIndex === 0) {
    anchor.setDate(today.getDate() - 1);
  }
  return anchor;
}

function generateTodaysList() {
  const today = new Date();
  const currentDayName = daysOfWeek[today.getDay()];
  const currentMonthName = monthsOfYear[today.getMonth()];
  const currentDayOfMonth = today.getDate();
  const todaysChores = [];

  if (choreSchedule.days && choreSchedule.days[currentDayName]) {
    choreSchedule.days[currentDayName].forEach(task => {
      todaysChores.push({ rawTask: task, displayTask: task, type: "Chore" });
    });
  }

  if (currentDayName === "Saturday" || currentDayName === "Sunday") {
    const satAnchor = getSaturdayAnchorDate(today);
    const weekNum = getWeekOfMonth(satAnchor);
    const rotationTasks = choreSchedule.monthlyRotation.weeks[weekNum];

    if (rotationTasks) {
      rotationTasks.forEach(task => {
        todaysChores.push({
          rawTask: task,
          displayTask: `Weekend: ${task}`,
          type: "Monthly",
        });
      });
    }
  }

  if (choreSchedule.yearly && choreSchedule.yearly[currentMonthName]) {
    choreSchedule.yearly[currentMonthName].forEach(task => {
      todaysChores.push({
        rawTask: task,
        displayTask: `${currentMonthName}: ${task}`,
        type: "Yearly",
      });
    });
  }

  const arrangedChores = todaysChores.map((item, index) => ({
    ...item,
    originalIndex: index,
  }));

  return {
    dateKey: `${today.getFullYear()}-${today.getMonth() + 1}-${currentDayOfMonth}`,
    monthKey: `${today.getFullYear()}-${today.getMonth() + 1}`,
    weekendKey: (() => {
      const sat = getSaturdayAnchorDate(today);
      return `${sat.getFullYear()}-${sat.getMonth() + 1}-${sat.getDate()}`;
    })(),
    displayDate: today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    chores: arrangedChores,
  };
}

function getCategorySlug(chore) {
  if (chore.type === "Monthly") return "weekend";
  if (chore.type === "Yearly") return "yearly";

  const lower = chore.rawTask.toLowerCase();
  if (lower.startsWith("kitchen:")) return "kitchen";
  if (lower.startsWith("basement:")) return "basement";
  if (lower.startsWith("main bathrooms:")) return "main-bathrooms";
  if (lower.startsWith("upstairs bathroom:")) return "upstairs-bathroom";
  if (lower.startsWith("master bedroom:")) return "master-bedroom";
  if (lower.startsWith("upstairs bedrooms:")) return "upstairs-bedrooms";
  return "default";
}

// ==========================================
// 2. AUTHENTICATION ENGINE
// ==========================================
let activeDayData = null;
let congratsTriggeredForToday = false;

function initApp() {
  activeDayData = generateTodaysList();
  document.getElementById("date-subheading").textContent = activeDayData.displayDate;

  const cachedDate = localStorage.getItem("chore_date_key");
  if (cachedDate !== activeDayData.dateKey) {
    localStorage.setItem("chore_board_state", JSON.stringify({}));
    localStorage.setItem("chore_date_key", activeDayData.dateKey);
    localStorage.removeItem("congrats_triggered");
  }

  congratsTriggeredForToday = localStorage.getItem("congrats_triggered") === "true";

  const activeUser = localStorage.getItem("family_active_user");
  if (!activeUser) {
    document.getElementById("day-heading").textContent = "Select Profile";
    renderLoginScreen();
  } else {
    document.getElementById("day-heading").textContent = "Household Chores";
    renderView();
  }
}

document.getElementById("date-subheading").addEventListener("click", () => {
  localStorage.removeItem("family_active_user");
  initApp();
});

function renderLoginScreen() {
  const viewport = document.getElementById("app-viewport");
  let loginHTML = `<ul class="chore-list">`;

  Object.keys(familyRoster).forEach(name => {
    const categoryColor = familyRoster[name].themeCat;
    loginHTML += `
      <li class="chore-item" data-user="${name}" data-cat="${categoryColor}">
        <span class="chore-title" style="font-weight: 600;">${name}</span>
      </li>
    `;
  });

  loginHTML += `</ul>`;
  viewport.innerHTML = loginHTML;

  document.querySelectorAll(".chore-item").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.user;
      const passPrompt = prompt(`Enter passcode for ${name}:`);

      if (passPrompt === familyRoster[name].code) {
        localStorage.setItem("family_active_user", name);
        initApp();
      } else if (passPrompt !== null) {
        alert("Incorrect profile passcode.");
      }
    });
  });
}

// ==========================================
// 3. COLLABORATIVE SECTIONS RENDER ENGINE
// ==========================================
function renderView() {
  const viewport = document.getElementById("app-viewport");
  const activeUser = localStorage.getItem("family_active_user");

  if (!activeUser) {
    renderLoginScreen();
    return;
  }

  if (!activeDayData || activeDayData.chores.length === 0) {
    viewport.innerHTML = `<ul class="chore-list"><li class="empty-state">All clear! No chores scheduled today.</li></ul>`;
    return;
  }

  let boardState = {};
  try {
    const rawData = localStorage.getItem("chore_board_state");
    if (rawData) boardState = JSON.parse(rawData) || {};
  } catch (e) {
    boardState = {};
  }

  const sections = { unassigned: [], Steve: [], Sandy: [], Jace: [], Phin: [] };

  activeDayData.chores.forEach(chore => {
    const id = `${chore.type}_${chore.rawTask.replace(/\s+/g, "_")}`;
    const taskState = boardState[id] || { assignedTo: null, isDone: false, worker: null, assignedByAdmin: false };

    const configuredItem = {
      ...chore,
      id: id,
      isDone: taskState.isDone,
      assignedTo: taskState.assignedTo,
      assignedByAdmin: !!taskState.assignedByAdmin,
    };

    if (configuredItem.assignedTo && sections[configuredItem.assignedTo]) {
      sections[configuredItem.assignedTo].push(configuredItem);
    } else {
      sections["unassigned"].push(configuredItem);
    }
  });

  const totalTasks = activeDayData.chores.length;
  const completedTasks = Object.values(boardState).filter(item => item.isDone).length;
  if (totalTasks > 0 && completedTasks === totalTasks && !congratsTriggeredForToday) {
    triggerTemporaryCongrats();
  }

  const allUsers = Object.keys(familyRoster);
  const otherUsers = allUsers.filter(u => u !== activeUser);
  const executionOrder = ["unassigned", activeUser, ...otherUsers];

  let completeViewHTML = "";

  executionOrder.forEach(sectionKey => {
    const sectionItems = sections[sectionKey] || [];

    const activeItems = sectionItems.filter(item => !item.isDone).sort((a, b) => a.originalIndex - b.originalIndex);
    const completedItems = sectionItems.filter(item => item.isDone).sort((a, b) => a.originalIndex - b.originalIndex);
    const combinedSortedItems = [...activeItems, ...completedItems];

    let sectionTitle = sectionKey === "unassigned" ? "Unassigned Chores" : `${sectionKey}'s Contributions`;

    completeViewHTML += `
      <div class="section-header" data-user-theme="${sectionKey !== "unassigned" ? sectionKey : ""}">
        <span>${sectionTitle}</span>
        <span style="font-size: 0.75rem; opacity: 0.6;">${sectionItems.length} items</span>
      </div>
      <ul class="chore-list" data-section="${sectionKey}">
    `;

    if (combinedSortedItems.length === 0) {
      completeViewHTML += `<li class="empty-state" style="padding: 12px;">No tasks here.</li>`;
    } else {
      combinedSortedItems.forEach(item => {
        const categorySlug = getCategorySlug(item);
        completeViewHTML += `
          <li class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${item.id}" data-type="${item.type}" data-cat="${categorySlug}">
            <input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1">
            <div class="chore-text-target">
              <span class="chore-title">${item.displayTask}</span>
            </div>
          </li>
        `;
      });
    }
    completeViewHTML += `</ul>`;
  });

  viewport.innerHTML = completeViewHTML;

  document.querySelectorAll(".chore-item").forEach(row => {
    row.querySelector(".chore-text-target").addEventListener("click", e => {
      e.stopPropagation();
      handleTaskTextTap(row.dataset.id, row.dataset.type);
    });

    const boxInput = row.querySelector(".chore-checkbox");
    if (boxInput) {
      boxInput.addEventListener("click", e => {
        e.stopPropagation();
      });
      boxInput.addEventListener("change", e => {
        const success = toggleChoreCompletion(row.dataset.id, row.dataset.type, e.target.checked);
        if (!success) {
          e.target.checked = !e.target.checked;
        }
      });
    }
  });
}

// ==========================================
// 4. ASSIGNMENT ENGINE & PERMISSIONS
// ==========================================
function handleTaskTextTap(choreId, choreType) {
  const activeUser = localStorage.getItem("family_active_user");
  const userProfile = familyRoster[activeUser];

  // Master Key: Owner bypass
  if (userProfile.isOwner) {
    openAssignmentModal(choreId, choreType, null, activeUser);
    return;
  }

  let boardState = JSON.parse(localStorage.getItem("chore_board_state")) || {};
  const currentTask = boardState[choreId] || { assignedTo: null, isDone: false, assignedByAdmin: false };

  if (currentTask.isDone) return;

  if (userProfile.isAdmin && currentTask.assignedTo !== null) {
    const ownerProfile = familyRoster[currentTask.assignedTo];
    if (ownerProfile && ownerProfile.isAdmin && currentTask.assignedTo !== activeUser) {
      return;
    }
  }

  if (!userProfile.isAdmin) {
    if (currentTask.assignedTo === null) {
      boardState[choreId] = { assignedTo: activeUser, isDone: false, worker: null, assignedByAdmin: false };
    } else if (currentTask.assignedTo === activeUser) {
      if (currentTask.assignedByAdmin) return;
      delete boardState[choreId];
    } else {
      return;
    }
    localStorage.setItem("chore_board_state", JSON.stringify(boardState));
    renderView();
    return;
  }

  openAssignmentModal(choreId, choreType, currentTask, activeUser);
}

function openAssignmentModal(choreId, choreType, currentTask, activeUser) {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "assignment-overlay";

  let modalHTML = `
    <div class="assignment-modal-card" id="modal-card-container">
      <div class="assignment-modal-title">Assign Task</div>
      <ul class="chore-list">
  `;

  const userProfile = familyRoster[activeUser];

  Object.keys(familyRoster).forEach(name => {
    // Standard rule: Admin cannot reassign other Admins
    if (!userProfile.isOwner && familyRoster[name].isAdmin && name !== activeUser) return;

    const categoryColor = familyRoster[name].themeCat;
    modalHTML += `
      <li class="chore-item" data-assign-target="${name}" data-cat="${categoryColor}">
        <span class="chore-title" style="font-weight: 600;">${name}</span>
      </li>
    `;
  });

  modalHTML += `
      <li class="chore-item" data-assign-target="unassigned" data-cat="default" style="margin-top: 4px;">
        <span class="chore-title" style="font-weight: 600; color: var(--text-muted);">Unassigned</span>
      </li>
    </ul>
  </div>
  `;

  modalOverlay.innerHTML = modalHTML;
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener("click", e => {
    if (!document.getElementById("modal-card-container").contains(e.target)) {
      modalOverlay.remove();
    }
  });

  modalOverlay.querySelectorAll(".chore-item").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const target = btn.dataset.assignTarget;
      modalOverlay.remove();

      let boardState = JSON.parse(localStorage.getItem("chore_board_state")) || {};

      if (target === "unassigned") {
        delete boardState[choreId];
      } else {
        boardState[choreId] = {
          assignedTo: target,
          isDone: false,
          worker: null,
          assignedByAdmin: true,
        };
      }
      localStorage.setItem("chore_board_state", JSON.stringify(boardState));
      renderView();
    });
  });
}

// ==========================================
// 5. COMPLETION & SECURITY CHECK UTILITIES
// ==========================================
function toggleChoreCompletion(choreId, choreType, isChecked) {
  const activeUser = localStorage.getItem("family_active_user");
  const activeProfile = familyRoster[activeUser];

  // Master Key: Owner bypass
  if (activeProfile.isOwner) {
    let state = JSON.parse(localStorage.getItem("chore_board_state")) || {};
    let current = state[choreId] || { assignedTo: activeUser, isDone: false };
    state[choreId] = { ...current, assignedTo: current.assignedTo || activeUser, isDone: isChecked, worker: activeUser };
    localStorage.setItem("chore_board_state", JSON.stringify(state));
    renderView();
    return true;
  }

  let boardState = JSON.parse(localStorage.getItem("chore_board_state")) || {};
  let currentTask = boardState[choreId] || { assignedTo: null, isDone: false, worker: null, assignedByAdmin: false };

  if (isChecked) {
    if (currentTask.assignedTo !== null) {
      if (activeUser === currentTask.assignedTo) {
        // Access Allowed
      } else if (activeProfile.isAdmin && !familyRoster[currentTask.assignedTo].isAdmin) {
        // Access Allowed
      } else {
        return false;
      }
    }

    const owner = currentTask.assignedTo ? currentTask.assignedTo : activeUser;
    boardState[choreId] = {
      assignedTo: owner,
      isDone: true,
      worker: activeUser,
      assignedByAdmin: currentTask.assignedByAdmin,
    };
  } else {
    const workerProfile = currentTask.worker;

    if (activeUser === workerProfile) {
      reopenOrClearTask(boardState, choreId, currentTask);
    } else if (activeProfile.isAdmin && (!familyRoster[workerProfile] || !familyRoster[workerProfile].isAdmin)) {
      reopenOrClearTask(boardState, choreId, currentTask);
    } else {
      return false;
    }
    congratsTriggeredForToday = false;
    localStorage.removeItem("congrats_triggered");
  }

  localStorage.setItem("chore_board_state", JSON.stringify(boardState));
  renderView();
  return true;
}

function reopenOrClearTask(boardState, id, task) {
  if (task.assignedByAdmin) {
    boardState[id] = {
      assignedTo: task.assignedTo,
      isDone: false,
      worker: null,
      assignedByAdmin: true,
    };
  } else {
    delete boardState[id];
  }
}

function triggerTemporaryCongrats() {
  congratsTriggeredForToday = true;
  localStorage.setItem("congrats_triggered", "true");
  const overlay = document.createElement("div");
  overlay.className = "congrats-overlay";
  overlay.innerHTML = `
    <h2>All Chores Done! 🎉</h2>
    <p>Everything is checked off. Enjoy your day!</p>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.remove(), 400);
  }, 4600);
}

initApp();
