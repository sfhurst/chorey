// ==========================================
// 1. MASTER CHORE SCHEDULE CONFIGURATION
// ==========================================
const choreSchedule = {
  days: {
    Monday: [
      "Kitchen: Wipe microwave",
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Meal prep",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Wipe toilet seats",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
    ],
    Tuesday: [
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Take out garbage",
      "Kitchen: Meal prep",
      "Bathroom: Wipe mirrors",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Clean toilets",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
    ],
    Wednesday: [
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Take out recycling",
      "Kitchen: Vacuum floor",
      "Kitchen: Meal prep",
      "Bathroom: Wipe mirrors",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Clean toilets",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
    ],
    Thursday: [
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Meal prep",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Wipe toilet seats",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
      "Bedrooms: Change the bed sheets",
      "Bedrooms: Wash bed sheets",
      "Bedrooms: Bedroom declutter",
      "Pool: Shock the pool",
    ],
    Friday: [
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Meal prep",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Wipe toilet seats",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
      "Whole House: Clean glass doors",
    ],
    Saturday: [
      "Kitchen: Clean refrigerator",
      "Kitchen: Wash dishes",
      "Kitchen: Rinse sink",
      "Kitchen: Wipe counters and stovetop",
      "Kitchen: Mop floor",
      "Kitchen: Meal plan and order groceries",
      "Bathroom: Wipe counters",
      "Bathroom: Rinse sink",
      "Bathroom: Clean toilets",
      "Bathroom: Mop floors",
      "Bathroom: Take a shower",
      "Basement: Empty dehumidifier",
      "Basement: Clear steps",
      "Basement: Cycle laundry",
      "Whole House: Declutter",
      "Whole House: Dust",
      "Whole House: Vacuum",
    ],
    Sunday: ["Groom", "Finish laundry", "Prepare for the work week", "Catch anything that needs attention"],
  },
  monthlyRotation: {
    dayOfWeek: "Saturday",
    weeks: {
      1: ["Monthly Week 1: Clean showers", "Monthly Week 1: Test smoke detectors", "Monthly Week 1: Groom dogs"],
      2: ["Monthly Week 2: Sweep & declutter garage", "Monthly Week 2: Declutter basement"],
      3: ["Monthly Week 3: Clean upstairs bedrooms and bathrooms"],
      4: ["Monthly Week 4: Organize pantry, drawers, and cabinets"],
      5: ["Monthly Week 5: Clean windows", "Monthly Week 5: Clean baseboards and door frames", "Monthly Week 5: Clean under the couch"],
    },
  },
  yearly: {
    January: ["Periodic: Clean washing machine pump"],
    February: ["Periodic: Clean under the stove and refrigerator"],
    March: ["Periodic: Change/clean furnace filters", "Periodic: Apply pest control"],
    April: ["Periodic: Change water filters"],
    May: [],
    June: ["Periodic: Change/clean furnace filters"],
    July: ["Periodic: Make soap"],
    August: [],
    September: ["Periodic: Change/clean furnace filters"],
    October: ["Periodic: Clean oven"],
    November: ["Periodic: Check windows and doors for drafts"],
    December: ["Periodic: Change/clean furnace filters"],
  },
};
// ==========================================
// 2. LOGIC ENGINE
// ==========================================
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function getWeekOfMonth(date) {
  return Math.ceil(date.getDate() / 7);
}
function generateTodaysList() {
  const today = new Date();
  const currentDayName = daysOfWeek[today.getDay()];
  const currentMonthName = monthsOfYear[today.getMonth()];
  const currentDayOfMonth = today.getDate();
  const todaysChores = [];
  if (choreSchedule.days && choreSchedule.days[currentDayName]) {
    choreSchedule.days[currentDayName].forEach(task => todaysChores.push({ task, type: "Chore" }));
  }
  if (choreSchedule.monthlyRotation && currentDayName === choreSchedule.monthlyRotation.dayOfWeek) {
    const weekNum = getWeekOfMonth(today);
    const rotationTasks = choreSchedule.monthlyRotation.weeks[weekNum];
    if (rotationTasks) {
      rotationTasks.forEach(task => todaysChores.push({ task, type: "Monthly" }));
    }
  }
  if (choreSchedule.yearly && choreSchedule.yearly[currentMonthName] && (currentDayName === "Saturday" || currentDayName === "Sunday")) {
    choreSchedule.yearly[currentMonthName].forEach(task => todaysChores.push({ task, type: "Yearly" }));
  }
  return {
    dateKey: `${today.getFullYear()}-${today.getMonth()}-${currentDayOfMonth}`,
    monthKey: `${today.getFullYear()}-${today.getMonth()}`,
    displayDate: today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    chores: todaysChores,
  };
}
function getCategorySlug(taskText) {
  const lower = taskText.toLowerCase();
  if (lower.startsWith("kitchen:")) return "kitchen";
  if (lower.startsWith("bathroom:")) return "bathroom";
  if (lower.startsWith("basement:")) return "basement";
  if (lower.startsWith("bedrooms:")) return "bedrooms";
  return "default";
}
// ==========================================
// 3. STORAGE & RENDER ACTIONS
// ==========================================
let activeDayData = null;
let congratsTriggeredForToday = false;
function initApp() {
  activeDayData = generateTodaysList();
  document.getElementById("date-subheading").textContent = activeDayData.displayDate;
  const cachedDate = localStorage.getItem("chore_date_key");
  if (cachedDate !== activeDayData.dateKey) {
    // Clear daily ticks, but preserve yearly history
    localStorage.removeItem("completed_chores");
    localStorage.setItem("chore_date_key", activeDayData.dateKey);
    localStorage.removeItem("congrats_triggered");
  }
  congratsTriggeredForToday = localStorage.getItem("congrats_triggered") === "true";
  renderView();
}
function renderView() {
  const viewport = document.getElementById("app-viewport");
  if (activeDayData.chores.length === 0) {
    viewport.innerHTML = `<ul class="chore-list"><li class="empty-state">All clear! No chores scheduled today.</li></ul>`;
    return;
  }
  let completedIds = JSON.parse(localStorage.getItem("completed_chores")) || [];
  let yearlyDoneLog = JSON.parse(localStorage.getItem("yearly_done_log")) || {};
  // Look up current month stamp log to see if any yearly targets are locked down
  let currentMonthYearlyDone = yearlyDoneLog[activeDayData.monthKey] || [];
  const processedList = activeDayData.chores.map(chore => {
    const id = `${chore.type}_${chore.task.replace(/\s+/g, "_")}`;
    // An item is done if its id is checked today, OR if it's a Yearly item done this month
    let isDone = completedIds.includes(id);
    if (chore.type === "Yearly" && currentMonthYearlyDone.includes(id)) {
      isDone = true;
    }
    return {
      ...chore,
      id: id,
      isDone: isDone,
    };
  });
  // Fire temporary congrats popup if list just hit completion and hasn't run yet
  const totalDone = processedList.filter(item => item.isDone).length;
  if (totalDone === processedList.length && !congratsTriggeredForToday) {
    triggerTemporaryCongrats();
  }
  processedList.sort((a, b) => a.isDone - b.isDone);
  let listHTML = `<ul id="chore-container" class="chore-list">`;
  processedList.forEach(item => {
    const categorySlug = getCategorySlug(item.task);
    listHTML += `
<li class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${item.id}" data-type="${item.type}" data-cat="${categorySlug}">
<input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1">
<span class="chore-title">${item.task}</span>
</li>
     `;
  });
  listHTML += `</ul>`;
  viewport.innerHTML = listHTML;
  document.querySelectorAll(".chore-item").forEach(row => {
    row.addEventListener("click", e => {
      if (e.target.tagName === "INPUT") return;
      const checkbox = row.querySelector("input");
      checkbox.checked = !checkbox.checked;
      toggleChoreState(row.dataset.id, row.dataset.type, checkbox.checked);
    });
    row.querySelector("input").addEventListener("change", e => {
      toggleChoreState(row.dataset.id, row.dataset.type, e.target.checked);
    });
  });
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
function toggleChoreState(choreId, choreType, isChecked) {
  let completedIds = JSON.parse(localStorage.getItem("completed_chores")) || [];
  let yearlyDoneLog = JSON.parse(localStorage.getItem("yearly_done_log")) || {};
  if (!yearlyDoneLog[activeDayData.monthKey]) {
    yearlyDoneLog[activeDayData.monthKey] = [];
  }
  if (isChecked) {
    // Save daily list state
    if (!completedIds.includes(choreId)) completedIds.push(choreId);
    // If it's a Yearly item, lock it down for the whole month
    if (choreType === "Yearly") {
      if (!yearlyDoneLog[activeDayData.monthKey].includes(choreId)) {
        yearlyDoneLog[activeDayData.monthKey].push(choreId);
      }
    }
  } else {
    completedIds = completedIds.filter(id => id !== choreId);
    // If unchecking a Yearly item, release it from the monthly lock
    if (choreType === "Yearly") {
      yearlyDoneLog[activeDayData.monthKey] = yearlyDoneLog[activeDayData.monthKey].filter(id => id !== choreId);
    }
    congratsTriggeredForToday = false;
    localStorage.removeItem("congrats_triggered");
  }
  localStorage.setItem("completed_chores", JSON.stringify(completedIds));
  localStorage.setItem("yearly_done_log", JSON.stringify(yearlyDoneLog));
  renderView();
}
// Fire engine
initApp();
