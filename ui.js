const ChoreyUI = (() => {
  const { monthsOfYear, getPerson, escapeHTML } = ChoreyUtils;

  function updateHeader(person, onAddTask) {
    const heading = document.getElementById("day-heading");
    const actions = document.getElementById("header-actions");
    heading.textContent = person ? "Today's Tasks" : "Select Profile";
    actions.innerHTML = person?.isOwner ? '<button class="icon-button" id="add-task-button" aria-label="Add task">+</button>' : "";
    document.getElementById("add-task-button")?.addEventListener("click", onAddTask);
  }

  function renderLoginScreen(onSelectProfile) {
    const viewport = document.getElementById("app-viewport");
    viewport.innerHTML = `<ul class="chore-list">${people.map(person => `<li class="chore-item profile-card" data-person-id="${escapeHTML(person.id)}" style="--person-accent:${escapeHTML(person.accent)}"><span class="chore-title profile-name">${escapeHTML(person.name)}</span></li>`).join("")}</ul>`;
    viewport.querySelectorAll("[data-person-id]").forEach(card => {
      card.addEventListener("click", () => onSelectProfile(card.dataset.personId));
    });
  }

  function renderTaskRow(item, activePerson) {
    const slug = item.task.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const canDelete = Boolean(activePerson && !item.isDone && (activePerson.isOwner || item.task.createdById === activePerson.id));
    const taskCard = `<div class="chore-item ${item.isDone ? "completed-row" : ""}" data-id="${escapeHTML(item.id)}" data-cat="${escapeHTML(slug)}"><input type="checkbox" class="chore-checkbox" ${item.isDone ? "checked" : ""} tabindex="-1"><div class="chore-text-target"><span class="chore-title">${escapeHTML(item.displayTask)}</span></div></div>`;
    if (!canDelete) return `<li class="swipe-row">${taskCard}</li>`;
    return `<li class="swipe-row can-delete" data-task-id="${escapeHTML(item.task.id)}"><button class="swipe-delete-button" type="button" aria-label="Delete ${escapeHTML(item.displayTask)}">Delete</button>${taskCard}</li>`;
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
    return order.map(id => renderSection(id, sections.get(id) || [], activePerson, activeDayData)).join("");
  }

  function renderEmptyDay() {
    document.getElementById("app-viewport").innerHTML = '<ul class="chore-list"><li class="empty-state">All clear. No tasks are scheduled today.</li></ul>';
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

  return Object.freeze({ updateHeader, renderLoginScreen, renderBoard, renderEmptyDay, showCongratulations });
})();
