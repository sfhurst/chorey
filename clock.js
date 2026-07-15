/* Centralized application clock. Normally this is the real local date.
 * The hidden developer menu may temporarily override the date so recurrence
 * and rollover behavior can be tested without changing the device clock. */
const ChoreyClock = (() => {
  const { dateKey } = ChoreyUtils;

  function parseLocalDate(key) {
    const [year, month, day] = String(key).split("-").map(Number);
    if (!year || !month || !day) return null;
    const result = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(result.getTime()) ? null : result;
  }

  function now() {
    const realNow = new Date();
    const override = parseLocalDate(ChoreyStorage.getDeveloperDateOverride());
    if (!override) return realNow;
    override.setHours(realNow.getHours(), realNow.getMinutes(), realNow.getSeconds(), realNow.getMilliseconds());
    return override;
  }

  function setDate(date) {
    ChoreyStorage.setDeveloperDateOverride(dateKey(date));
    return now();
  }

  function advanceDays(days) {
    const target = now();
    target.setDate(target.getDate() + days);
    return setDate(target);
  }

  function advanceMonth() {
    const source = now();
    const originalDay = source.getDate();
    const target = new Date(source.getFullYear(), source.getMonth() + 1, 1, 12, 0, 0, 0);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(originalDay, lastDay));
    return setDate(target);
  }

  function returnToToday() {
    ChoreyStorage.clearDeveloperDateOverride();
    return now();
  }

  function isOverridden() { return Boolean(ChoreyStorage.getDeveloperDateOverride()); }

  return Object.freeze({ now, advanceDays, advanceMonth, returnToToday, isOverridden });
})();
