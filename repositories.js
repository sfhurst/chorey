const ChoreyRepositories = (() => {
  const profileRepository = Object.freeze({
    async getActivePersonId() { return ChoreyStorage.getActivePersonId(); },
    async setActivePersonId(personId) { ChoreyStorage.setActivePersonId(personId); },
    async clearActivePerson() { ChoreyStorage.clearActivePerson(); },
  });

  const taskRepository = Object.freeze({
    async getAll() { return ChoreyStorage.getTasks(); },
    async add(task) { return ChoreyStorage.addTask(task); },
    async delete(taskId) { return ChoreyStorage.deleteTask(taskId); },
  });

  const occurrenceRepository = Object.freeze({
    async getAll() { return ChoreyStorage.getOccurrenceStates(); },
    async saveAll(states) { ChoreyStorage.saveOccurrenceStates(states); },
    async getLegacyDailyStates() { return ChoreyStorage.getLegacyDailyTaskStates(); },
    async clearLegacyDailyStates() { ChoreyStorage.clearLegacyDailyTaskStates(); },
  });

  const dailyRepository = Object.freeze({
    async prepare(dateKey) { ChoreyStorage.prepareDate(dateKey); },
    async getCongratulationsShown() { return ChoreyStorage.getCongratulationsShown(); },
    async setCongratulationsShown(value) { ChoreyStorage.setCongratulationsShown(value); },
  });

  return Object.freeze({ profileRepository, taskRepository, occurrenceRepository, dailyRepository });
})();
