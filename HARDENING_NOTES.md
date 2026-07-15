# Chorey Hardening Notes

## Implemented

1. Storage schema advanced from version 4 to version 5.
2. Migrations now advance sequentially through each schema version.
3. Every task normalizes a `defaultAssigneeId`; all current built-in tasks set it to `null`.
4. Application writes now target one occurrence at a time through `set` and `delete` repository methods.
5. Every Today render prunes occurrence state that is not part of the currently active day, week, or month.
6. Empty days also trigger cleanup.
7. Local-storage write failures throw an error instead of being silently ignored.
8. Chorey refreshes after crossing midnight only when it has been hidden for at least 15 minutes.
9. Seasonal recurrence remains a month filter for daily and weekly tasks only.
10. Scheduler regression tests cover weekly anchoring, seasonal daily/weekly recurrence, and month-long recurrence.

## Intentionally deferred to Chorey 2 / Supabase

- private tasks
- personal-task permissions
- locked assignments
- account security and row-level security
- multi-household support
- synchronization and conflict handling
- soft deletion and restoring backend defaults

## Reset behavior

Clearing the browser's site data remains a true factory reset. It removes custom tasks, local edits, completion state, and assignments. The hardcoded defaults seed the next launch.


## Developer clock and reset menu

- Long-pressing the date for one second opens a hidden developer menu.
- Normal date taps still return to profile selection.
- Time travel uses a centralized `ChoreyClock` and never changes the device clock.
- Tomorrow and Next Week advance from the currently simulated date.
- Next Month advances one calendar month and clamps dates such as January 31 to the last valid day of February.
- Return to Today removes the override.
- Reset Local Data removes the root and legacy Chorey storage keys, then reloads the hardcoded defaults.
