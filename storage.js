// ==========================================
// CHOREY STORAGE SERVICE — SCHEMA VERSION 6
// ==========================================
// This is the only file that may access localStorage. Chorey stores only
// current-cycle state. Yesterday, last week, and last month are allowed to go.
const ChoreyStorage = (() => {
  const CURRENT_SCHEMA_VERSION = 6;
  const ROOT_STORAGE_KEY = "chorey_app_state";
  const LEGACY_KEYS = {
    activePerson: ["chorey_active_person", "family_active_user"],
    boardState: "chore_board_state",
    dateKey: "chore_date_key",
    congrats: "congrats_triggered",
  };
  const clone = value => JSON.parse(JSON.stringify(value));

  function createDefaultState() {
    return { schemaVersion: CURRENT_SCHEMA_VERSION, activePersonId: null, tasks: clone(defaultTasks), occurrenceStates: {}, daily: { dateKey: null, congratulationsShown: false }, developer: { dateOverride: null }, legacyDailyTaskStates: {} };
  }
  function readJson(key, fallbackValue) {
    try { const raw = localStorage.getItem(key); return raw === null ? clone(fallbackValue) : JSON.parse(raw); }
    catch (error) { console.warn(`Chorey could not read "${key}".`, error); return clone(fallbackValue); }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { console.error(`Chorey could not save "${key}".`, error); throw new Error("Chorey could not save your changes.", { cause: error }); }
  }
  function findPersonId(reference) {
    if (!reference) return null;
    const normalized = String(reference).trim().toLowerCase();
    const match = people.find(person => person.id.toLowerCase() === normalized || person.name.toLowerCase() === normalized || (person.legacyIds || []).some(id => String(id).toLowerCase() === normalized));
    return match?.id || null;
  }
  function normalizeSchedule(schedule) {
    const rawType = schedule?.type === "weekends" ? "weeks" : schedule?.type;
    const type = ["once", "days", "weeks", "months"].includes(rawType) ? rawType : "days";
    return { type, date: typeof schedule?.date === "string" ? schedule.date : null, days: Array.isArray(schedule?.days) ? [...new Set(schedule.days.map(Number).filter(day => day >= 0 && day <= 6))].sort((a,b)=>a-b) : [], week: (schedule?.week ?? schedule?.weekend) === "last" ? "last" : ([1,2,3,4,5].includes(Number(schedule?.week ?? schedule?.weekend)) ? Number(schedule.week ?? schedule.weekend) : null), months: Array.isArray(schedule?.months) ? [...new Set(schedule.months.map(Number).filter(month => month >= 1 && month <= 12))].sort((a,b)=>a-b) : [] };
  }
  function normalizeTask(task) {
    if (!task || typeof task !== "object") return null;
    const name = String(task.name || "").trim(); if (!name) return null;
    return { id: String(task.id || `task-${Date.now()}-${Math.random().toString(36).slice(2,8)}`), name, category: String(task.category || "General").trim() || "General", schedule: normalizeSchedule(task.schedule), defaultAssigneeId: findPersonId(task.defaultAssigneeId), visibility: { type: task.visibility?.type === "private" ? "private" : "household", visibleToIds: Array.isArray(task.visibility?.visibleToIds) ? task.visibility.visibleToIds.map(findPersonId).filter(Boolean) : [] }, createdById: findPersonId(task.createdById), createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(), active: task.active !== false };
  }
  function normalizeTaskState(value) {
    if (!value || typeof value !== "object") return null;
    return { assignedToId: findPersonId(value.assignedToId ?? value.assignedTo), isDone: Boolean(value.isDone), completedById: findPersonId(value.completedById ?? value.worker), assignedByAdmin: Boolean(value.assignedByAdmin), assignedById: findPersonId(value.assignedById), assignedByCompletion: Boolean(value.assignedByCompletion), completedAt: typeof value.completedAt === "string" ? value.completedAt : null };
  }
  function normalizeTaskStates(states) { return (!states || typeof states !== "object" || Array.isArray(states)) ? {} : Object.fromEntries(Object.entries(states).map(([k,v])=>[k,normalizeTaskState(v)]).filter(([,v])=>v)); }
  function normalizeState(candidate) {
    const fallback = createDefaultState(); if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return fallback;
    return { schemaVersion: CURRENT_SCHEMA_VERSION, activePersonId: findPersonId(candidate.activePersonId), tasks: Array.isArray(candidate.tasks) ? candidate.tasks.map(normalizeTask).filter(Boolean) : clone(defaultTasks).map(normalizeTask), occurrenceStates: normalizeTaskStates(candidate.occurrenceStates), daily: { dateKey: typeof candidate.daily?.dateKey === "string" ? candidate.daily.dateKey : null, congratulationsShown: Boolean(candidate.daily?.congratulationsShown) }, developer: { dateOverride: /^\d{4}-\d{2}-\d{2}$/.test(candidate.developer?.dateOverride || "") ? candidate.developer.dateOverride : null }, legacyDailyTaskStates: normalizeTaskStates(candidate.legacyDailyTaskStates) };
  }
  const migrations = {
    1: state => ({ schemaVersion: 2, activePersonId: state.activePersonId, tasks: clone(defaultTasks), occurrenceStates: {}, daily: { dateKey: state.daily?.dateKey || null, congratulationsShown: Boolean(state.daily?.congratulationsShown) }, legacyDailyTaskStates: state.daily?.taskStates || {} }),
    2: state => ({ ...state, schemaVersion: 3 }),
    3: state => ({ ...state, schemaVersion: 4 }),
    4: state => ({ ...state, schemaVersion: 5, tasks: Array.isArray(state.tasks) ? state.tasks.map(task => ({ ...task, defaultAssigneeId: task.defaultAssigneeId ?? null })) : clone(defaultTasks) }),
    5: state => ({ ...state, schemaVersion: 6, developer: { dateOverride: null } }),
  };
  function migrateLegacyStorage() {
    const migrated = createDefaultState();
    migrated.activePersonId = findPersonId(LEGACY_KEYS.activePerson.map(key => localStorage.getItem(key)).find(value => value !== null));
    migrated.daily.dateKey = localStorage.getItem(LEGACY_KEYS.dateKey);
    migrated.daily.congratulationsShown = localStorage.getItem(LEGACY_KEYS.congrats) === "true";
    migrated.legacyDailyTaskStates = normalizeTaskStates(readJson(LEGACY_KEYS.boardState, {}));
    writeJson(ROOT_STORAGE_KEY, migrated); Object.values(LEGACY_KEYS).flat().forEach(key => localStorage.removeItem(key)); return migrated;
  }
  function loadState() {
    const root = readJson(ROOT_STORAGE_KEY, null);
    if (root === null) return Object.values(LEGACY_KEYS).flat().some(key => localStorage.getItem(key) !== null) ? migrateLegacyStorage() : createDefaultState();
    let migrated = root; let version = Number(migrated.schemaVersion) || 1;
    while (version < CURRENT_SCHEMA_VERSION) { migrated = migrations[version](migrated); version = Number(migrated.schemaVersion); }
    migrated = normalizeState(migrated); writeJson(ROOT_STORAGE_KEY, migrated); return migrated;
  }
  let state = loadState();
  function saveState() { state = normalizeState(state); writeJson(ROOT_STORAGE_KEY, state); return true; }
  function prepareDate(dateKey) { if (state.daily.dateKey === dateKey) return true; state.daily = { dateKey, congratulationsShown: false }; state.legacyDailyTaskStates = {}; return saveState(); }

  return Object.freeze({
    getState: () => clone(state), getActivePersonId: () => state.activePersonId,
    setActivePersonId(id) { state.activePersonId = findPersonId(id); return saveState(); }, clearActivePerson() { state.activePersonId = null; return saveState(); }, prepareDate,
    getTasks: () => clone(state.tasks),
    addTask(task) { const normalized = normalizeTask(task); if (!normalized) return null; state.tasks.push(normalized); saveState(); return clone(normalized); },
    updateTask(task) { const normalized = normalizeTask(task); if (!normalized) return null; const i = state.tasks.findIndex(item => item.id === normalized.id); if (i < 0) return null; state.tasks[i] = normalized; saveState(); return clone(normalized); },
    deleteTask(taskId) { const id=String(taskId||""); const before=state.tasks.length; state.tasks=state.tasks.filter(task=>task.id!==id); if(state.tasks.length===before)return false; Object.keys(state.occurrenceStates).forEach(key=>{if(key.startsWith(`${id}@`))delete state.occurrenceStates[key];}); saveState(); return true; },
    getOccurrenceStates: () => clone(state.occurrenceStates),
    setOccurrenceState(id, value) { const normalized=normalizeTaskState(value); if(!normalized) return false; state.occurrenceStates[String(id)] = normalized; return saveState(); },
    deleteOccurrenceState(id) { delete state.occurrenceStates[String(id)]; return saveState(); },
    pruneOccurrenceStates(validIds) { const valid=new Set(validIds); let changed=false; Object.keys(state.occurrenceStates).forEach(id=>{ if(!valid.has(id)){ delete state.occurrenceStates[id]; changed=true; } }); if(changed) saveState(); return changed; },
    getLegacyDailyTaskStates: () => clone(state.legacyDailyTaskStates), clearLegacyDailyTaskStates() { state.legacyDailyTaskStates={}; return saveState(); },
    getCongratulationsShown: () => state.daily.congratulationsShown, setCongratulationsShown(value) { state.daily.congratulationsShown=Boolean(value); return saveState(); },
    getDeveloperDateOverride: () => state.developer?.dateOverride || null,
    setDeveloperDateOverride(value) {
      state.developer = { dateOverride: /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : null };
      return saveState();
    },
    clearDeveloperDateOverride() { state.developer = { dateOverride: null }; return saveState(); },
    resetAllData() {
      localStorage.removeItem(ROOT_STORAGE_KEY);
      Object.values(LEGACY_KEYS).flat().forEach(key => localStorage.removeItem(key));
      state = createDefaultState();
      return true;
    },
  });
})();
