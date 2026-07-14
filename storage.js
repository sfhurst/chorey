// ==========================================
// CHOREY STORAGE SERVICE — SCHEMA VERSION 3
// ==========================================
// This is the only file that may access localStorage.
const ChoreyStorage = (() => {
  const CURRENT_SCHEMA_VERSION = 3;
  const ROOT_STORAGE_KEY = "chorey_app_state";
  const LEGACY_KEYS = {
    activePerson: ["chorey_active_person", "family_active_user"],
    boardState: "chore_board_state",
    dateKey: "chore_date_key",
    congrats: "congrats_triggered",
  };

  const clone = value => JSON.parse(JSON.stringify(value));

  function createDefaultState() {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activePersonId: null,
      tasks: clone(defaultTasks),
      occurrenceStates: {},
      daily: { dateKey: null, congratulationsShown: false },
      legacyDailyTaskStates: {},
    };
  }

  function readJson(key, fallbackValue) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? clone(fallbackValue) : JSON.parse(raw);
    } catch (error) {
      console.warn(`Chorey could not read "${key}".`, error);
      return clone(fallbackValue);
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Chorey could not save "${key}".`, error);
      return false;
    }
  }

  function findPersonId(reference) {
    if (!reference) return null;
    const normalized = String(reference).trim().toLowerCase();
    const match = people.find(person => person.id.toLowerCase() === normalized || person.name.toLowerCase() === normalized || (person.legacyIds || []).some(id => String(id).toLowerCase() === normalized));
    return match?.id || null;
  }

  function normalizeSchedule(schedule) {
    const allowedTypes = ["once", "days", "weekends", "months"];
    const type = allowedTypes.includes(schedule?.type) ? schedule.type : "days";
    return {
      type,
      date: typeof schedule?.date === "string" ? schedule.date : null,
      days: Array.isArray(schedule?.days) ? [...new Set(schedule.days.map(Number).filter(day => day >= 0 && day <= 6))].sort((a, b) => a - b) : [],
      weekend: schedule?.weekend === "last" ? "last" : ([1, 2, 3, 4, 5].includes(Number(schedule?.weekend)) ? Number(schedule.weekend) : null),
      months: Array.isArray(schedule?.months) ? [...new Set(schedule.months.map(Number).filter(month => month >= 1 && month <= 12))].sort((a, b) => a - b) : [],
    };
  }

  function normalizeTask(task) {
    if (!task || typeof task !== "object") return null;
    const name = String(task.name || "").trim();
    if (!name) return null;
    return {
      id: String(task.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name,
      category: String(task.category || "General").trim() || "General",
      schedule: normalizeSchedule(task.schedule),
      visibility: {
        type: task.visibility?.type === "private" ? "private" : "household",
        visibleToIds: Array.isArray(task.visibility?.visibleToIds) ? task.visibility.visibleToIds.map(findPersonId).filter(Boolean) : [],
      },
      createdById: findPersonId(task.createdById),
      createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
      active: task.active !== false,
    };
  }

  function normalizeTaskState(taskState) {
    if (!taskState || typeof taskState !== "object") return null;
    return {
      assignedToId: findPersonId(taskState.assignedToId ?? taskState.assignedTo),
      isDone: Boolean(taskState.isDone),
      completedById: findPersonId(taskState.completedById ?? taskState.worker),
      assignedByAdmin: Boolean(taskState.assignedByAdmin),
      assignedById: findPersonId(taskState.assignedById),
      assignedByCompletion: Boolean(taskState.assignedByCompletion),
      completedAt: typeof taskState.completedAt === "string" ? taskState.completedAt : null,
    };
  }

  function normalizeTaskStates(states) {
    if (!states || typeof states !== "object" || Array.isArray(states)) return {};
    return Object.fromEntries(Object.entries(states).map(([key, value]) => [key, normalizeTaskState(value)]).filter(([, value]) => value));
  }

  function normalizeState(candidate) {
    const fallback = createDefaultState();
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return fallback;
    const tasks = Array.isArray(candidate.tasks) ? candidate.tasks.map(normalizeTask).filter(Boolean) : clone(defaultTasks);
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activePersonId: findPersonId(candidate.activePersonId),
      tasks,
      occurrenceStates: normalizeTaskStates(candidate.occurrenceStates),
      daily: {
        dateKey: typeof candidate.daily?.dateKey === "string" ? candidate.daily.dateKey : null,
        congratulationsShown: Boolean(candidate.daily?.congratulationsShown),
      },
      legacyDailyTaskStates: normalizeTaskStates(candidate.legacyDailyTaskStates),
    };
  }

  function migrateVersion1(state) {
    return normalizeState({
      schemaVersion: 2,
      activePersonId: state.activePersonId,
      tasks: clone(defaultTasks),
      occurrenceStates: {},
      daily: { dateKey: state.daily?.dateKey || null, congratulationsShown: Boolean(state.daily?.congratulationsShown) },
      legacyDailyTaskStates: state.daily?.taskStates || {},
    });
  }

  function migrateLegacyStorage() {
    const migrated = createDefaultState();
    const legacyPerson = LEGACY_KEYS.activePerson.map(key => localStorage.getItem(key)).find(value => value !== null);
    migrated.activePersonId = findPersonId(legacyPerson);
    migrated.daily.dateKey = localStorage.getItem(LEGACY_KEYS.dateKey);
    migrated.daily.congratulationsShown = localStorage.getItem(LEGACY_KEYS.congrats) === "true";
    migrated.legacyDailyTaskStates = normalizeTaskStates(readJson(LEGACY_KEYS.boardState, {}));
    writeJson(ROOT_STORAGE_KEY, migrated);
    Object.values(LEGACY_KEYS).flat().forEach(key => localStorage.removeItem(key));
    return migrated;
  }

  function loadState() {
    const root = readJson(ROOT_STORAGE_KEY, null);
    if (root === null) {
      const hasLegacy = Object.values(LEGACY_KEYS).flat().some(key => localStorage.getItem(key) !== null);
      return hasLegacy ? migrateLegacyStorage() : createDefaultState();
    }
    const version = Number(root.schemaVersion) || 0;
    const migrated = version === 1 ? migrateVersion1(root) : normalizeState(root);
    writeJson(ROOT_STORAGE_KEY, migrated);
    return migrated;
  }

  let state = loadState();
  function saveState() { state = normalizeState(state); writeJson(ROOT_STORAGE_KEY, state); }

  function prepareDate(dateKey) {
    if (state.daily.dateKey === dateKey) return;
    state.daily = { dateKey, congratulationsShown: false };
    state.legacyDailyTaskStates = {};
    saveState();
  }

  return Object.freeze({
    getState: () => clone(state),
    getActivePersonId: () => state.activePersonId,
    setActivePersonId(personId) { state.activePersonId = findPersonId(personId); saveState(); },
    clearActivePerson() { state.activePersonId = null; saveState(); },
    prepareDate,
    getTasks: () => clone(state.tasks),
    addTask(task) { const normalized = normalizeTask(task); if (!normalized) return null; state.tasks.push(normalized); saveState(); return clone(normalized); },
    updateTask(task) {
      const normalized = normalizeTask(task);
      if (!normalized) return null;
      const index = state.tasks.findIndex(item => item.id === normalized.id);
      if (index < 0) return null;
      state.tasks[index] = normalized;
      saveState();
      return clone(normalized);
    },
    deleteTask(taskId) {
      const id = String(taskId || "");
      const originalLength = state.tasks.length;
      state.tasks = state.tasks.filter(task => task.id !== id);
      if (state.tasks.length === originalLength) return false;
      Object.keys(state.occurrenceStates).forEach(key => {
        if (key.startsWith(`${id}@`)) delete state.occurrenceStates[key];
      });
      saveState();
      return true;
    },
    getOccurrenceStates: () => clone(state.occurrenceStates),
    saveOccurrenceStates(states) { state.occurrenceStates = normalizeTaskStates(states); saveState(); },
    getLegacyDailyTaskStates: () => clone(state.legacyDailyTaskStates),
    clearLegacyDailyTaskStates() { state.legacyDailyTaskStates = {}; saveState(); },
    getCongratulationsShown: () => state.daily.congratulationsShown,
    setCongratulationsShown(value) { state.daily.congratulationsShown = Boolean(value); saveState(); },
  });
})();
