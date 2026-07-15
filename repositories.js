/* Repository methods are intentionally small and occurrence-level so the local
 * implementation can later be replaced by Supabase without changing app rules. */
const ChoreyRepositories = (() => {
  const profileRepository = Object.freeze({ async getActivePersonId(){return ChoreyStorage.getActivePersonId();}, async setActivePersonId(id){return ChoreyStorage.setActivePersonId(id);}, async clearActivePerson(){return ChoreyStorage.clearActivePerson();} });
  const taskRepository = Object.freeze({ async getAll(){return ChoreyStorage.getTasks();}, async add(task){return ChoreyStorage.addTask(task);}, async update(task){return ChoreyStorage.updateTask(task);}, async delete(id){return ChoreyStorage.deleteTask(id);} });
  const occurrenceRepository = Object.freeze({ async getAll(){return ChoreyStorage.getOccurrenceStates();}, async set(id,state){return ChoreyStorage.setOccurrenceState(id,state);}, async delete(id){return ChoreyStorage.deleteOccurrenceState(id);}, async prune(validIds){return ChoreyStorage.pruneOccurrenceStates(validIds);}, async getLegacyDailyStates(){return ChoreyStorage.getLegacyDailyTaskStates();}, async clearLegacyDailyStates(){return ChoreyStorage.clearLegacyDailyTaskStates();} });
  const dailyRepository = Object.freeze({ async prepare(key){return ChoreyStorage.prepareDate(key);}, async getCongratulationsShown(){return ChoreyStorage.getCongratulationsShown();}, async setCongratulationsShown(value){return ChoreyStorage.setCongratulationsShown(value);} });
  return Object.freeze({ profileRepository, taskRepository, occurrenceRepository, dailyRepository });
})();
