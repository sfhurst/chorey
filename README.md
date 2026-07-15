# Chorey

**A calm household chore planner that helps without hurting.**

Chorey was built for a busy household where both parents work full time, kids have sports, the house gets messy, and there is always something competing for attention. It turns a permanent chore schedule into a simple list for the day, week, and month so the user does not have to remember everything at once.

The app is especially useful for an attention pattern where a person starts toward one chore, gets distracted, and forgets what they intended to do. Chorey keeps the next useful action close at hand. Open the phone, see the list, remember the task, and continue.

## Philosophy

Chorey exists to reduce mental load. It is meant to help and never meant to hurt.

Most task systems preserve yesterday's failures as today's debt. Chorey does not. If a task is missed, the app moves on. The task returns the next time its schedule naturally cycles around. There are no overdue piles, broken streaks, points, penalties, or guilt.

Chorey says:

> Today is today. Here is what can be done now.

Week-long and month-long work remains visible without demanding immediate attention. A quiet due counter shows the available runway, but the interface does not turn that information into pressure.

## Design principles

- **Help without hurting.** Every feature should reduce stress or remove something the user must remember.
- **Start with today.** Day-long tasks are the primary checklist. Yesterday is not carried forward as debt.
- **Let schedules rebuild the list.** Tasks return automatically when their natural recurrence comes around.
- **Keep longer work calm.** Week-long and month-long tasks remain visible with quiet deadlines rather than urgent warnings.
- **Avoid guilt mechanics.** No streaks, overdue counters, points, rewards, or productivity scores.
- **Prefer obvious interactions.** A checkbox completes, an assignment control assigns, and task editing belongs to the owner.
- **Keep the scheduler authoritative.** Scheduling decisions belong in one place so the interface can stay simple.
- **Protect simplicity.** A feature that adds more management than help probably does not belong.

## How scheduling works

Task definitions use four recurrence types:

- `once` — occurs on one specific date
- `days` — occurs on selected days of the week
- `weeks` — occurs during selected Saturday-anchored weeks of the month
- `months` — remains available during selected months

The scheduler converts those recurrence rules into three occurrence durations:

- **Day-long** — shown for one day
- **Week-long** — shown Monday through Sunday, using Saturday as the recurrence anchor
- **Month-long** — shown for the full calendar month

The normal list assumes day-long work needs no heading. Longer work is shown under **This Week** and **This Month**, with a quiet countdown such as `Due: 5 days`, `Due: Tomorrow`, or `Due: Today`.

The congratulations message is based on what is due today:

- Day-long tasks count every day they appear.
- Week-long tasks count on Sunday, the final day of their window.
- Month-long tasks count on the final day of the month.

This allows the user to finish today's work without a large monthly task blocking that sense of completion all month.

## Current architecture

Chorey is a static JavaScript application designed to remain usable throughout development.

- `chore_list.js` contains people and canonical default task objects.
- `scheduler.js` determines task visibility, occurrence duration, and closing dates.
- `repositories.js` provides asynchronous storage interfaces.
- `storage.js` currently stores one consolidated application record in `localStorage`.
- `ui.js` renders the checklist and task-management views.
- `task-creator.js` handles task creation and editing.
- `swipe.js` handles swipe-to-edit interactions.
- `app.js` coordinates the application.

The repository boundary is intended to make a later move from local storage to Supabase affect as little of the static application as possible. The existing static version can remain available while synchronization is developed and tested separately.

## Default tasks and live data

`defaultTasks` seeds a fresh installation. Once initialized, the browser's stored record becomes the live database. Editing `chore_list.js` does not overwrite existing local tasks automatically. During development, a fresh seed can be loaded with:

```js
localStorage.removeItem("chorey_app_state");
location.reload();
```

This deletes locally created tasks, assignments, and completion state, so it should be used deliberately.

## Direction

The planned technical direction is:

1. Keep the current static version stable and usable.
2. Move the project into GitHub with versioned development.
3. Replace the local repository implementation with Supabase synchronization.
4. Verify reliable laptop and phone use.
5. Add installable PWA behavior and offline loading.

Future features are welcome, but the philosophy remains the test:

> If a feature makes Chorey feel heavier, more complicated, or more stressful, it probably does not belong.

## Current-cycle storage

Chorey is a current-cycle checklist, not a history tracker.

- A day-long occurrence exists only for its scheduled calendar day.
- A week-long occurrence exists only for its Monday-through-Sunday window. The Saturday inside that window determines which numbered week and month it belongs to.
- A month-long occurrence exists only for its scheduled calendar month.
- Seasonal scheduling is only a month filter on day-long and week-long recurrence. Month-long tasks already select the months in which they occur.
- Completion and temporary assignment state are physically removed when their occurrence is no longer active.
- No streaks, missed-day records, completion history, scores, or archived occurrences are retained.

A task may include `defaultAssigneeId`. It is currently `null` for the built-in list, but a hardcoded task can name a household member as its initial assignee. Broader personal/private-task behavior is intentionally deferred until the Supabase phase.

When Chorey stays actively open across midnight, it does not interrupt the user. If it is hidden for at least 15 minutes and reopened on a new date, the current schedule is rebuilt and expired state is cleaned up. A normal reload always loads the current date.

## Hardening changes

The static GitHub Pages version now includes:

- schema version 5 with sequential migration steps
- occurrence-level repository writes instead of application-level whole-state replacement
- physical cleanup of expired occurrence state
- explicit storage-write failures rather than silent success
- a future-ready `defaultAssigneeId` field
- inactive-after-midnight refresh behavior
- scheduler regression tests in `tests/scheduler.test.js`

Run the scheduler tests with:

```bash
node tests/scheduler.test.js
```


## Hidden developer menu

Long-press the date for one second to open the local developer menu. A normal tap still returns to profile selection. The menu can reset local data, advance the scheduler by one day, one week, or one calendar month, and return to the real current date. The simulated date is stored locally and survives reloads until it is cleared. Reset Local Data removes all Chorey browser data and restores the hardcoded defaults.
