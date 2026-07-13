const ChoreyScheduler = (() => {
  const { dateKey } = ChoreyUtils;

  function getWeekendInfo(date) {
    if (![0, 6].includes(date.getDay())) return null;
    const saturday = new Date(date);
    if (date.getDay() === 0) saturday.setDate(date.getDate() - 1);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    const weekendNumber = Math.floor((saturday.getDate() - 1) / 7) + 1;
    const nextSaturday = new Date(saturday);
    nextSaturday.setDate(saturday.getDate() + 7);
    const isLast = nextSaturday.getMonth() !== saturday.getMonth();
    return { saturday, sunday, weekendNumber, isLast };
  }

  function isVisibleTo(task, person) {
    if (task.visibility?.type !== "private") return true;
    return Boolean(person && (task.createdById === person.id || task.visibility.visibleToIds?.includes(person.id)));
  }

  function getOccurrence(task, date) {
    if (!task.active) return null;
    const month = date.getMonth() + 1;
    const schedule = task.schedule;
    if (["days", "weekends"].includes(schedule.type) && schedule.months.length && !schedule.months.includes(month)) return null;

    if (schedule.type === "once") {
      if (schedule.date !== dateKey(date)) return null;
      return { key: `${task.id}@${schedule.date}`, group: "once", opensOn: schedule.date, closesOn: schedule.date };
    }

    if (schedule.type === "days") {
      if (!schedule.days.includes(date.getDay())) return null;
      const key = dateKey(date);
      return { key: `${task.id}@${key}`, group: "days", opensOn: key, closesOn: key };
    }

    if (schedule.type === "weekends") {
      const info = getWeekendInfo(date);
      if (!info) return null;
      const matches = schedule.weekend === "last" ? info.isLast : schedule.weekend === info.weekendNumber;
      if (!matches) return null;
      return { key: `${task.id}@${dateKey(info.saturday)}`, group: "weekends", opensOn: dateKey(info.saturday), closesOn: dateKey(info.sunday) };
    }

    if (schedule.type === "months") {
      if (!schedule.months.includes(month)) return null;
      const monthKey = `${date.getFullYear()}-${String(month).padStart(2, "0")}`;
      const lastDay = new Date(date.getFullYear(), month, 0);
      return { key: `${task.id}@${monthKey}`, group: "months", opensOn: `${monthKey}-01`, closesOn: dateKey(lastDay) };
    }

    return null;
  }

  function legacyStateId(task, occurrence) {
    const raw = `${task.category}: ${task.name}`;
    if (occurrence.group === "days") return `Chore_${raw.replace(/\s+/g, "_")}`;
    if (occurrence.group === "weekends") return `Monthly_${task.name.replace(/\s+/g, "_")}`;
    if (occurrence.group === "months") return `Yearly_${task.name.replace(/\s+/g, "_")}`;
    return null;
  }

  function buildDayData(tasks, activePerson, date = new Date()) {
    const occurrences = tasks
      .filter(task => isVisibleTo(task, activePerson))
      .map(task => ({ task, occurrence: getOccurrence(task, date) }))
      .filter(item => item.occurrence)
      .map((item, index) => ({
        ...item,
        originalIndex: index,
        id: item.occurrence.key,
        displayTask: `${item.task.category}: ${item.task.name}`,
      }));

    return {
      dateKey: dateKey(date),
      displayDate: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      occurrences,
    };
  }

  return Object.freeze({ buildDayData, legacyStateId });
})();
