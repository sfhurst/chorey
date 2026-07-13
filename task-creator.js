const ChoreyTaskCreator = (() => {
  const { daysOfWeek, monthsOfYear, escapeHTML, dateKey } = ChoreyUtils;
  const { taskRepository } = ChoreyRepositories;

  async function open(owner, onSaved) {
    if (!owner?.isOwner) return;

    const draft = {
      name: "",
      category: "General",
      type: null,
      days: [],
      weekend: null,
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

    function askName() {
      show(`<div class="assignment-modal-title">New Task</div><label class="field-label">Name<input class="text-input" id="task-name" maxlength="80" autofocus></label><button class="primary-button" id="continue">Continue</button>${cancelButton()}`);
      bindCancel();
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

      Object.values(legacyChoreSchedule.days).flat().forEach(label => {
        addCategory(splitTaskLabel(label).category);
      });

      const tasks = await taskRepository.getAll();
      tasks
        .filter(task => task.active !== false && !/^task-(days|weekends|months)-/.test(String(task.id || "")))
        .forEach(task => addCategory(task.category));

      return [...categories.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    }

    async function chooseCategory() {
      const categories = await getExistingCategories();
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
      overlay.querySelector("#accept-category").addEventListener("click", async () => {
        const category = overlay.querySelector("#new-category").value.trim();
        if (!category) return alert("Enter a category name.");
        const existing = (await getExistingCategories()).find(item => item.localeCompare(category, undefined, { sensitivity: "base" }) === 0);
        draft.category = existing || category;
        chooseType();
      });
    }

    function chooseType() {
      show(`<div class="assignment-modal-title">How often?</div><ul class="chore-list">${[["once", "Once"], ["days", "Days"], ["weekends", "Weekends"], ["months", "Months"]].map(([value, label]) => `<li class="chore-item selector-row" data-type="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul>${cancelButton()}`);
      bindCancel();
      overlay.querySelectorAll("[data-type]").forEach(row => row.addEventListener("click", () => {
        draft.type = row.dataset.type;
        if (draft.type === "once") chooseDate();
        else if (draft.type === "days") chooseDays();
        else if (draft.type === "weekends") chooseWeekend();
        else chooseMonths(false);
      }));
    }

    function chooseDate() {
      const today = new Date();
      const options = [];
      for (let offset = 0; offset < 8; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        const label = offset === 0
          ? "Today"
          : offset === 1
            ? "Tomorrow"
            : offset === 7
              ? `Next ${daysOfWeek[date.getDay()]}`
              : daysOfWeek[date.getDay()];
        options.push({ label, value: dateKey(date) });
      }
      show(`<div class="assignment-modal-title">Choose a day</div><ul class="chore-list">${options.map(option => `<li class="chore-item selector-row" data-date="${option.value}"><span class="chore-title">${option.label}</span></li>`).join("")}</ul>${cancelButton()}`);
      bindCancel();
      overlay.querySelectorAll("[data-date]").forEach(row => row.addEventListener("click", () => {
        draft.date = row.dataset.date;
        saveTask();
      }));
    }

    function chooseDays() {
      show(`<div class="assignment-modal-title">Choose days</div><div class="selector-list">${daysOfWeek.map((day, index) => `<label class="selector-check"><input type="checkbox" value="${index}"><span>${day}</span></label>`).join("")}<label class="selector-check seasonal-check"><input type="checkbox" id="seasonal"><span>Seasonal</span></label></div><button class="primary-button" id="accept">Accept</button>${cancelButton()}`);
      bindCancel();
      overlay.querySelector("#accept").addEventListener("click", () => {
        draft.days = [...overlay.querySelectorAll('.selector-check input[type="checkbox"]:checked')]
          .filter(input => input.id !== "seasonal")
          .map(input => Number(input.value));
        draft.seasonal = overlay.querySelector("#seasonal").checked;
        if (!draft.days.length) return alert("Choose at least one day.");
        draft.seasonal ? chooseMonths(true) : saveTask();
      });
    }

    function chooseWeekend() {
      const options = [[1, "First weekend"], [2, "Second weekend"], [3, "Third weekend"], [4, "Fourth weekend"], [5, "Fifth weekend"], ["last", "Last weekend"]];
      show(`<div class="assignment-modal-title">Choose a weekend</div><ul class="chore-list">${options.map(([value, label]) => `<li class="chore-item selector-row" data-weekend="${value}"><span class="chore-title">${label}</span></li>`).join("")}</ul><label class="selector-check seasonal-check"><input type="checkbox" id="seasonal"><span>Seasonal</span></label>${cancelButton()}`);
      bindCancel();
      overlay.querySelectorAll("[data-weekend]").forEach(row => row.addEventListener("click", () => {
        draft.weekend = row.dataset.weekend === "last" ? "last" : Number(row.dataset.weekend);
        draft.seasonal = overlay.querySelector("#seasonal").checked;
        draft.seasonal ? chooseMonths(true) : saveTask();
      }));
    }

    function chooseMonths(isSeasonal) {
      show(`<div class="assignment-modal-title">${isSeasonal ? "Choose active months" : "Choose months"}</div><div class="selector-list">${monthsOfYear.map((month, index) => `<label class="selector-check"><input type="checkbox" value="${index + 1}"><span>${month}</span></label>`).join("")}</div><button class="primary-button" id="accept">Accept</button>${cancelButton()}`);
      bindCancel();
      overlay.querySelector("#accept").addEventListener("click", () => {
        draft.months = [...overlay.querySelectorAll('.selector-check input:checked')].map(input => Number(input.value));
        if (!draft.months.length) return alert("Choose at least one month.");
        saveTask();
      });
    }

    async function saveTask() {
      const id = globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await taskRepository.add({
        id,
        name: draft.name,
        category: draft.category,
        schedule: {
          type: draft.type,
          date: draft.date,
          days: draft.days,
          weekend: draft.weekend,
          months: draft.months,
        },
        visibility: { type: "household", visibleToIds: [] },
        createdById: owner.id,
        createdAt: new Date().toISOString(),
        active: true,
      });
      overlay.remove();
      await onSaved();
    }

    askName();
  }

  return Object.freeze({ open });
})();
