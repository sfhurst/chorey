const ChoreyUI = (() => {
  const { monthsOfYear, getPerson, escapeHTML } = ChoreyUtils;

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
    let symbol = "+";

    if (activePerson.isOwner) {
      canManage = true;
    } else if (activePerson.isAdmin) {
      const ownerControlled = assignee?.isOwner || assigner?.isOwner || (item.assignedByAdmin && !item.assignedById && item.assignedToId !== activePerson.id);
      canManage = !ownerControlled && (item.assignedToId === null || item.assignedById === activePerson.id || (item.assignedToId === activePerson.id && !item.assignedByAdmin));
    } else {
      if (item.isDone) return "";
      canManage = item.assignedToId === null || (item.assignedToId === activePerson.id && !item.assignedByAdmin && (!assigner || assigner.id === activePerson.id));
      if (item.assignedToId === activePerson.id) symbol = "−";
    }

    if (!canManage) return "";
    return `<button class="assignment-button" type="button" aria-label="${item.assignedToId ? "Change assignment" : "Assign task"}">${symbol}</button>`;
  }

  function renderTaskRow(item, activePerson) {
    const slug = item.task.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const canEdit = Boolean(activePerson?.isOwner);
    const taskCard = `<div class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${escapeHTML(item.id)}" data-cat="${escapeHTML(slug)}"><input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1"><div class="chore-text-target"><span class="chore-title">${escapeHTML(item.displayTask)}</span></div>${assignmentControl(item, activePerson)}</div>`;
    if (!canEdit) return `<li class="swipe-row">${taskCard}</li>`;
    return `<li class="swipe-row can-edit" data-task-id="${escapeHTML(item.task.id)}"><button class="swipe-action-button" type="button" aria-label="Edit ${escapeHTML(item.displayTask)}">Edit</button>${taskCard}</li>`;
  }

  function renderSection(sectionId, items, activePerson, activeDayData) {
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
      ordinaryItems.map(item => renderTaskRow(item, activePerson)).join(""),
      weekendItems.length ? `<li class="task-group-label">Weekend</li>${weekendItems.map(item => renderTaskRow(item, activePerson)).join("")}` : "",
      monthItems.length ? `<li class="task-group-label">${escapeHTML(monthName)}</li>${monthItems.map(item => renderTaskRow(item, activePerson)).join("")}` : "",
    ].join("") || '<li class="empty-state compact-empty">No tasks here.</li>';

    return `<div class="section-header ${person ? "person-section" : ""}" ${person ? `style="--person-accent:${escapeHTML(person.accent)}"` : ""}><span>${escapeHTML(title)}</span><span class="section-count">${items.length} ${items.length === 1 ? "item" : "items"}</span></div><ul class="chore-list">${content}</ul>`;
  }

  function renderBoard(activePerson, activeDayData, sections) {
    const order = ["unassigned", activePerson.id, ...people.filter(person => person.id !== activePerson.id).map(person => person.id)];
    const board = order.map(id => renderSection(id, sections.get(id) || [], activePerson, activeDayData)).join("");
    return activePerson.isOwner ? `${board}<div class="owner-page-actions"><button class="secondary-button" id="view-all-tasks">View All Tasks</button></div>` : board;
  }

  function taskGroup(task) {
    if (task.schedule.type === "months" || (["days", "weekends"].includes(task.schedule.type) && task.schedule.months?.length)) return "yearly";
    if (task.schedule.type === "weekends") return "monthly";
    return "daily";
  }

  function renderAllTasks(tasks) {
    const groups = { daily: [], monthly: [], yearly: [] };
    tasks.filter(task => task.active !== false).forEach(task => groups[taskGroup(task)].push(task));
    Object.values(groups).forEach(group => group.sort((a, b) => `${a.category}: ${a.name}`.localeCompare(`${b.category}: ${b.name}`, undefined, { sensitivity: "base" })));

    const section = (key, title) => `<div class="section-header"><span>${title}</span><span class="section-count">${groups[key].length} ${groups[key].length === 1 ? "item" : "items"}</span></div><ul class="chore-list all-task-list">${groups[key].length ? groups[key].map(task => `<li class="swipe-row can-edit" data-task-id="${escapeHTML(task.id)}"><button class="swipe-action-button" type="button" aria-label="Edit ${escapeHTML(task.name)}">Edit</button><div class="chore-item all-task-row"><div class="chore-text-target"><span class="chore-title">${escapeHTML(task.category)}: ${escapeHTML(task.name)}</span></div></div></li>`).join("") : '<li class="empty-state compact-empty">No tasks here.</li>'}</ul>`;
    return `${section("daily", "Daily")}${section("monthly", "Monthly")}${section("yearly", "Yearly")}<div class="owner-page-actions"><button class="secondary-button" id="back-to-today">Back to Today</button></div>`;
  }

  function renderEmptyDay(activePerson) {
    document.getElementById("app-viewport").innerHTML = `<ul class="chore-list"><li class="empty-state">All clear. No tasks are scheduled today.</li></ul>${activePerson?.isOwner ? '<div class="owner-page-actions"><button class="secondary-button" id="view-all-tasks">View All Tasks</button></div>' : ""}`;
  }

  function showCongratulations() {
    const overlay = document.createElement("div");
    overlay.className = "congrats-overlay";
    overlay.innerHTML = "<h2>All Tasks Done</h2><p>Everything is checked off. Enjoy your day.</p>";
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 400);
    }, 4600);
  }

  return Object.freeze({ updateHeader, renderLoginScreen, renderBoard, renderAllTasks, renderEmptyDay, showCongratulations });
})();
