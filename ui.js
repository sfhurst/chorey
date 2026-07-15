/*
 * Chorey's interface should help without hurting. Show what matters now,
 * keep longer work visible without making it feel urgent, and avoid adding
 * guilt, clutter, or extra decisions.
 */
const ChoreyUI = (() => {
  const { getPerson, escapeHTML } = ChoreyUtils;

  const CATEGORY_COLORS = Object.freeze([
    "#3a9ad9", "#8a63d2", "#2bbbb0", "#66cdaa", "#e67e22",
    "#d4af37", "#cc6677", "#6f9f4f", "#5b8fd1", "#b07cc6",
    "#3aa6a0", "#79b88a", "#d99058", "#c4a24d", "#b85f6f",
    "#7894c8", "#9278bd", "#4f9b94", "#78a96c", "#c98252",
  ]);

  function categoryColor(category) {
    const normalized = String(category || "General").trim().toLocaleLowerCase();
    let hash = 0;
    for (const character of normalized) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
  }

  function updateHeader(person, onAddTask, options = {}) {
    const heading = document.getElementById("day-heading");
    const actions = document.getElementById("header-actions");
    heading.textContent = options.title || (person ? "Today's Tasks" : "Select Profile");
    actions.innerHTML = person?.isOwner ? '<button class="icon-button" id="add-task-button" aria-label="Add task">+</button>' : "";
    document.getElementById("add-task-button")?.addEventListener("click", onAddTask);
  }

  function renderLoginScreen(onSelectProfile) {
    const viewport = document.getElementById("app-viewport");
    viewport.innerHTML = `<ul class="chore-list">${people.map(person => `<li class="chore-item profile-card" data-person-id="${escapeHTML(person.id)}" style="--person-accent:${escapeHTML(person.accent)}"><span class="chore-title profile-name">${escapeHTML(person.name)}</span></li>`).join("")}</ul>`;
    viewport.querySelectorAll("[data-person-id]").forEach(card => card.addEventListener("click", () => onSelectProfile(card.dataset.personId)));
  }

  function assignmentControl(item, activePerson) {
    if (!activePerson) return "";
    const assignee = getPerson(item.assignedToId);
    const assigner = getPerson(item.assignedById);
    let canManage = false;

    if (activePerson.isOwner) {
      canManage = true;
    } else if (activePerson.isAdmin) {
      const ownerControlled = assignee?.isOwner || assigner?.isOwner || (item.assignedByAdmin && !item.assignedById && item.assignedToId !== activePerson.id);
      canManage = !ownerControlled && (item.assignedToId === null || item.assignedById === activePerson.id || (item.assignedToId === activePerson.id && !item.assignedByAdmin));
    } else {
      if (item.isDone) return "";
      canManage = item.assignedToId === null || (item.assignedToId === activePerson.id && !item.assignedByAdmin && (!assigner || assigner.id === activePerson.id));
    }

    if (!canManage) return "";

    const label = assignee ? `Change assignment. Assigned to ${assignee.name}` : "Assign task";
    const accentStyle = assignee ? ` style="--assignee-accent:${escapeHTML(assignee.accent)}"` : "";
    const assignedClass = assignee ? " is-assigned" : "";
    const personIcon = '<svg class="assignment-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.25"></circle><path d="M5.75 19c.45-3.45 2.55-5.25 6.25-5.25s5.8 1.8 6.25 5.25"></path></svg>';
    return `<button class="assignment-button${assignedClass}" type="button" aria-label="${escapeHTML(label)}"${accentStyle}>${personIcon}</button>`;
  }

  function renderTaskRow(item, activePerson) {
    const canEdit = Boolean(activePerson?.isOwner);
    const accent = categoryColor(item.task.category);
    const taskCard = `<div class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${escapeHTML(item.id)}" style="--category-accent:${accent}"><input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1"><div class="chore-text-target"><span class="chore-title">${escapeHTML(item.displayTask)}</span></div>${assignmentControl(item, activePerson)}</div>`;
    if (!canEdit) return `<li class="swipe-row">${taskCard}</li>`;
    return `<li class="swipe-row can-edit" data-task-id="${escapeHTML(item.task.id)}"><button class="swipe-action-button" type="button" aria-label="Edit ${escapeHTML(item.displayTask)}">Edit</button>${taskCard}</li>`;
  }

  function compareByCategory(a, b) {
    return a.task.category.localeCompare(b.task.category, undefined, { sensitivity: "base" })
      || Number(a.isDone) - Number(b.isDone)
      || a.originalIndex - b.originalIndex;
  }

  function daysRemaining(currentDateKey, closesOn) {
    const current = new Date(`${currentDateKey}T12:00:00`);
    const closes = new Date(`${closesOn}T12:00:00`);
    return Math.max(0, Math.round((closes - current) / 86400000));
  }

  function dueLabel(currentDateKey, closesOn) {
    const remaining = daysRemaining(currentDateKey, closesOn);
    if (remaining === 0) return "Due: Today";
    if (remaining === 1) return "Due: Tomorrow";
    return `Due: ${remaining} days`;
  }

  function renderSection(sectionId, items, activePerson, currentDateKey) {
    const person = getPerson(sectionId);
    const title = person ? `${person.name}'s Contributions` : "Unassigned Tasks";
    const durationItems = duration => items.filter(item => item.occurrence.duration === duration).sort(compareByCategory);
    const dayItems = durationItems("day");
    const weekItems = durationItems("week");
    const monthItems = durationItems("month");
    const group = (label, due, groupItems) => groupItems.length ? `${label ? `<li class="task-group-label"><span>${label}</span><span class="task-group-due">${due}</span></li>` : ""}${groupItems.map(item => renderTaskRow(item, activePerson)).join("")}` : "";
    const weekDue = weekItems.length ? dueLabel(currentDateKey, weekItems[0].occurrence.closesOn) : "";
    const monthDue = monthItems.length ? dueLabel(currentDateKey, monthItems[0].occurrence.closesOn) : "";
    const content = [
      group("", "", dayItems),
      group("This Week", weekDue, weekItems),
      group("This Month", monthDue, monthItems),
    ].join("") || '<li class="empty-state compact-empty">No tasks here.</li>';

    return `<div class="section-header ${person ? "person-section" : ""}" ${person ? `style="--person-accent:${escapeHTML(person.accent)}"` : ""}><span>${escapeHTML(title)}</span><span class="section-count">${items.length} ${items.length === 1 ? "item" : "items"}</span></div><ul class="chore-list">${content}</ul>`;
  }

  function renderBoard(activePerson, activeDayData, sections) {
    const order = ["unassigned", activePerson.id, ...people.filter(person => person.id !== activePerson.id).map(person => person.id)];
    const board = order.map(id => renderSection(id, sections.get(id) || [], activePerson, activeDayData.dateKey)).join("");
    return activePerson.isOwner ? `${board}<div class="owner-page-actions"><button class="secondary-button" id="view-all-tasks">View All Tasks</button></div>` : board;
  }

  function taskGroup(task) {
    if (task.schedule.type === "months" || (["days", "weeks"].includes(task.schedule.type) && task.schedule.months?.length)) return "yearly";
    if (task.schedule.type === "weeks") return "monthly";
    return "daily";
  }

  function renderAllTasks(tasks) {
    const groups = { daily: [], monthly: [], yearly: [] };
    tasks.filter(task => task.active !== false).forEach((task, index) => groups[taskGroup(task)].push({ task, index }));
    Object.values(groups).forEach(group => group.sort((a, b) => a.task.category.localeCompare(b.task.category, undefined, { sensitivity: "base" }) || a.index - b.index));

    const section = (key, title) => `<div class="section-header"><span>${title}</span><span class="section-count">${groups[key].length} ${groups[key].length === 1 ? "item" : "items"}</span></div><ul class="chore-list all-task-list">${groups[key].length ? groups[key].map(({ task }) => `<li class="swipe-row can-edit" data-task-id="${escapeHTML(task.id)}"><button class="swipe-action-button" type="button" aria-label="Edit ${escapeHTML(task.name)}">Edit</button><div class="chore-item all-task-row" style="--category-accent:${categoryColor(task.category)}"><div class="chore-text-target"><span class="chore-title">${escapeHTML(task.category)}: ${escapeHTML(task.name)}</span></div></div></li>`).join("") : '<li class="empty-state compact-empty">No tasks here.</li>'}</ul>`;
    return `${section("daily", "Daily")}${section("monthly", "Monthly")}${section("yearly", "Yearly")}<div class="owner-page-actions"><button class="secondary-button" id="back-to-today">Back to Today</button></div>`;
  }

  function renderEmptyDay(activePerson) {
    document.getElementById("app-viewport").innerHTML = `<ul class="chore-list"><li class="empty-state">All clear. No tasks are scheduled today.</li></ul>${activePerson?.isOwner ? '<div class="owner-page-actions"><button class="secondary-button" id="view-all-tasks">View All Tasks</button></div>' : ""}`;
  }

  function showCongratulations() {
    const overlay = document.createElement("div");
    overlay.className = "congrats-overlay";
    overlay.innerHTML = "<h2>Today's Tasks Done</h2><p>Everything due today is checked off. Enjoy your day.</p>";
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 400);
    }, 4600);
  }

  return Object.freeze({ updateHeader, renderLoginScreen, renderBoard, renderAllTasks, renderEmptyDay, showCongratulations });
})();
