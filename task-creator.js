const ChoreyTaskCreator = (() => {
  const { daysOfWeek, monthsOfYear, escapeHTML, dateKey } = ChoreyUtils;
  const { taskRepository } = ChoreyRepositories;

  const clone = value => JSON.parse(JSON.stringify(value));

  async function open(owner, onSaved, existingTask = null) {
    if (!owner?.isOwner) return;

    const editing = Boolean(existingTask);
    const original = existingTask ? clone(existingTask) : null;
    const draft = existingTask ? {
      name: existingTask.name,
      category: existingTask.category,
      type: existingTask.schedule.type,
      days: [...(existingTask.schedule.days || [])],
      week: existingTask.schedule.week ?? null,
      months: [...(existingTask.schedule.months || [])],
      date: existingTask.schedule.date || null,
      seasonal: ["days", "weeks"].includes(existingTask.schedule.type) && Boolean(existingTask.schedule.months?.length),
    } : {
      name: "",
      category: "General",
      type: null,
      days: [],
      week: null,
      months: [],
      date: null,
      seasonal: false,
    };

    const overlay = document.createElement("div");
    overlay.className = "assignment-overlay";
    document.body.appendChild(overlay);

    const show = html => {
      overlay.innerHTML = `<div class="assignment-modal-card task-creator">${html}</div>`;
    };
    const cancelButton = () => '<button class="modal-cancel" data-cancel>Cancel</button>';
    const bindCancel = () => overlay.querySelector("[data-cancel]")?.addEventListener("click", () => overlay.remove());
    const selectedClass = selected => selected ? " current-selection" : "";

    function askName() {
      show(`<div class="assignment-modal-title">${editing ? "Edit Task" : "New Task"}</div><label class="field-label">Name<input class="text-input" id="task-name" maxlength="80" value="${escapeHTML(draft.name)}" autofocus></label><button class="primary-button" id="continue">Continue</button>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelector("#continue").addEventListener("click", () => {
        draft.name = overlay.querySelector("#task-name").value.trim();
        if (!draft.name) return alert("Enter a task name.");
        chooseCategory();
      });
    }

    async function getExistingCategories() {
      const categories = new Map();
      const addCategory = value => {
        const category = String(value || "").trim();
        if (!category) return;
        const key = category.toLocaleLowerCase();
        if (!categories.has(key)) categories.set(key, category);
      };

      defaultTasks.forEach(task => addCategory(task.category));
      (await taskRepository.getAll())
        .filter(task => task.active !== false)
        .forEach(task => addCategory(task.category));
      return [...categories.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    }

    async function chooseCategory() {
      const categories = await getExistingCategories();
      show(`<div class="assignment-modal-title">Choose a category</div><ul class="chore-list category-selector-list">${categories.map(category => `<li class="chore-item selector-row${selectedClass(category === draft.category)}" data-category="${escapeHTML(category)}"><span class="chore-title">${escapeHTML(category)}</span></li>`).join("")}<li class="chore-item selector-row" data-new-category><span class="chore-title">Add new category</span></li></ul>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelectorAll("[data-category]").forEach(row => row.addEventListener("click", () => {
        draft.category = row.dataset.category;
        chooseType();
      }));
      overlay.querySelector("[data-new-category]").addEventListener("click", askNewCategory);
    }

    function askNewCategory() {
      show(`<div class="assignment-modal-title">New category</div><label class="field-label">Category name<input class="text-input" id="new-category" maxlength="40" autofocus></label><button class="primary-button" id="accept-category">Accept</button>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelector("#accept-category").addEventListener("click", async () => {
        const category = overlay.querySelector("#new-category").value.trim();
        if (!category) return alert("Enter a category name.");
        const existing = (await getExistingCategories()).find(item => item.localeCompare(category, undefined, { sensitivity: "base" }) === 0);
        draft.category = existing || category;
        chooseType();
      });
    }

    function chooseType() {
      const choices = [["once", "Once"], ["days", "Days"], ["weeks", "Weeks"], ["months", "Months"]];
      show(`<div class="assignment-modal-title">How often?</div><ul class="chore-list">${choices.map(([value, label]) => `<li class="chore-item selector-row${selectedClass(draft.type === value)}" data-type="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelectorAll("[data-type]").forEach(row => row.addEventListener("click", () => {
        draft.type = row.dataset.type;
        if (draft.type === "once") chooseDate();
        else if (draft.type === "days") chooseDays();
        else if (draft.type === "weeks") chooseWeek();
        else chooseMonths(false);
      }));
    }

    function chooseDate() {
      const today = new Date();
      const options = [];
      for (let offset = 0; offset < 8; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        const value = dateKey(date);
        const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : offset === 7 ? `Next ${daysOfWeek[date.getDay()]}` : daysOfWeek[date.getDay()];
        options.push({ label, value });
      }
      if (draft.date && !options.some(option => option.value === draft.date)) options.unshift({ label: draft.date, value: draft.date });
      show(`<div class="assignment-modal-title">Choose a day</div><ul class="chore-list">${options.map(option => `<li class="chore-item selector-row${selectedClass(option.value === draft.date)}" data-date="${option.value}"><span class="chore-title">${escapeHTML(option.label)}</span></li>`).join("")}</ul>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelectorAll("[data-date]").forEach(row => row.addEventListener("click", () => {
        draft.date = row.dataset.date;
        draft.days = [];
        draft.week = null;
        draft.months = [];
        saveTask();
      }));
    }

    function chooseDays() {
      show(`<div class="assignment-modal-title">Choose days</div><div class="selector-list">${daysOfWeek.map((day, index) => `<label class="selector-check${selectedClass(draft.days.includes(index))}"><input type="checkbox" value="${index}" ${draft.days.includes(index) ? "checked" : ""}><span>${day}</span></label>`).join("")}<label class="selector-check seasonal-check${selectedClass(draft.seasonal)}"><input type="checkbox" id="seasonal" ${draft.seasonal ? "checked" : ""}><span>Seasonal</span></label></div><button class="primary-button" id="accept">Accept</button>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelector("#accept").addEventListener("click", () => {
        draft.days = [...overlay.querySelectorAll('.selector-check input[type="checkbox"]:checked')]
          .filter(input => input.id !== "seasonal")
          .map(input => Number(input.value));
        draft.seasonal = overlay.querySelector("#seasonal").checked;
        draft.week = null;
        draft.date = null;
        if (!draft.days.length) return alert("Choose at least one day.");
        if (!draft.seasonal) draft.months = [];
        draft.seasonal ? chooseMonths(true) : saveTask();
      });
    }

    function chooseWeek() {
      const options = [[1, "First week"], [2, "Second week"], [3, "Third week"], [4, "Fourth week"], [5, "Fifth week"], ["last", "Last week"]];
      show(`<div class="assignment-modal-title">Choose a week</div><ul class="chore-list">${options.map(([value, label]) => `<li class="chore-item selector-row${selectedClass(String(draft.week) === String(value))}" data-week="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul><label class="selector-check seasonal-check${selectedClass(draft.seasonal)}"><input type="checkbox" id="seasonal" ${draft.seasonal ? "checked" : ""}><span>Seasonal</span></label>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelectorAll("[data-week]").forEach(row => row.addEventListener("click", () => {
        draft.week = row.dataset.week === "last" ? "last" : Number(row.dataset.week);
        draft.seasonal = overlay.querySelector("#seasonal").checked;
        draft.days = [];
        draft.date = null;
        if (!draft.seasonal) draft.months = [];
        draft.seasonal ? chooseMonths(true) : saveTask();
      }));
    }

    function chooseMonths(isSeasonal) {
      show(`<div class="assignment-modal-title">${isSeasonal ? "Choose active months" : "Choose months"}</div><div class="selector-list">${monthsOfYear.map((month, index) => `<label class="selector-check${selectedClass(draft.months.includes(index + 1))}"><input type="checkbox" value="${index + 1}" ${draft.months.includes(index + 1) ? "checked" : ""}><span>${month}</span></label>`).join("")}</div><button class="primary-button" id="accept">Accept</button>${cancelButton()}${editing ? deleteControl() : ""}`);
      bindCancel();
      bindDelete();
      overlay.querySelector("#accept").addEventListener("click", () => {
        draft.months = [...overlay.querySelectorAll('.selector-check input:checked')].map(input => Number(input.value));
        if (!draft.months.length) return alert("Choose at least one month.");
        if (!isSeasonal) {
          draft.days = [];
          draft.week = null;
          draft.date = null;
        }
        saveTask();
      });
    }

    function deleteControl() {
      return '<button class="hold-delete-button" type="button" data-hold-delete><span class="hold-delete-progress"></span><span class="hold-delete-label">Hold to Permanently Delete</span></button>';
    }

    function bindDelete() {
      const button = overlay.querySelector("[data-hold-delete]");
      if (!button || !editing) return;
      let timer = null;
      let completed = false;
      const cancelHold = () => {
        if (timer !== null) window.clearTimeout(timer);
        timer = null;
        if (!completed) button.classList.remove("holding");
      };
      const beginHold = event => {
        if (event.button !== undefined && event.button !== 0) return;
        completed = false;
        button.classList.add("holding");
        timer = window.setTimeout(async () => {
          completed = true;
          timer = null;
          await taskRepository.delete(original.id);
          overlay.remove();
          await onSaved({ deleted: true, taskId: original.id });
        }, 2000);
      };
      button.addEventListener("pointerdown", beginHold);
      button.addEventListener("pointerup", cancelHold);
      button.addEventListener("pointerleave", cancelHold);
      button.addEventListener("pointercancel", cancelHold);
      button.addEventListener("contextmenu", event => event.preventDefault());
    }

    async function saveTask() {
      const task = {
        id: editing ? original.id : (globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        name: draft.name,
        category: draft.category,
        schedule: {
          type: draft.type,
          date: draft.type === "once" ? draft.date : null,
          days: draft.type === "days" ? draft.days : [],
          week: draft.type === "weeks" ? draft.week : null,
          months: ["months"].includes(draft.type) || draft.seasonal ? draft.months : [],
        },
        defaultAssigneeId: original?.defaultAssigneeId || null,
        visibility: original?.visibility || { type: "household", visibleToIds: [] },
        createdById: original?.createdById || owner.id,
        createdAt: original?.createdAt || new Date().toISOString(),
        active: original?.active !== false,
      };
      editing ? await taskRepository.update(task) : await taskRepository.add(task);
      overlay.remove();
      await onSaved({ deleted: false, taskId: task.id });
    }

    askName();
  }

  return Object.freeze({ open });
})();
