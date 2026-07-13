// ==========================================
// PEOPLE CONFIGURATION
// ==========================================
const people = [
  { id: "person-001", legacyIds: ["steve"], name: "Steve", passcode: "0612", accent: "#3a9ad9", isAdmin: true, isOwner: true },
  { id: "person-002", legacyIds: ["sandy"], name: "Sandy", passcode: "1018", accent: "#8a63d2", isAdmin: true, isOwner: false },
  { id: "person-003", legacyIds: ["jace"], name: "Jace", passcode: "0302", accent: "#ffaa66", isAdmin: false, isOwner: false },
  { id: "person-004", legacyIds: ["phin"], name: "Phin", passcode: "0228", accent: "#66cdaa", isAdmin: false, isOwner: false },
];

// ==========================================
// DEFAULT TASKS
// ==========================================
// These seed a new installation and are copied into local storage. After that,
// local storage is the working task database until Supabase is introduced.
const legacyChoreSchedule = {
  days: {
    Monday: ["Kitchen: Wipe microwave", "Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Meal prep", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Wipe toilet seats", "Main Bathrooms: Take a shower", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry"],
    Tuesday: ["Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Take out garbage", "Kitchen: Meal prep", "Main Bathrooms: Wipe mirrors", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Clean toilets", "Main Bathrooms: Take a shower", "Upstairs Bathroom: Wipe sink", "Upstairs Bathroom: Clean toilet", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry"],
    Wednesday: ["Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Take out recycling", "Kitchen: Vacuum floor", "Kitchen: Meal prep", "Main Bathrooms: Wipe mirrors", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Clean toilets", "Main Bathrooms: Take a shower", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry"],
    Thursday: ["Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Meal prep", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Wipe toilet seats", "Main Bathrooms: Take a shower", "Upstairs Bathroom: Wipe sink", "Upstairs Bathroom: Clean toilet", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry", "Master Bedroom: Change the bed sheets", "Master Bedroom: Wash bed sheets", "Master Bedroom: Bedroom declutter", "Pool: Shock the pool"],
    Friday: ["Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Meal prep", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Wipe toilet seats", "Main Bathrooms: Take a shower", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry", "Whole House: Clean glass doors"],
    Saturday: ["Kitchen: Clean refrigerator", "Kitchen: Wash dishes", "Kitchen: Rinse sink", "Kitchen: Wipe counters and stovetop", "Kitchen: Mop floor", "Kitchen: Meal plan and order groceries", "Main Bathrooms: Wipe counters", "Main Bathrooms: Rinse sink", "Main Bathrooms: Clean toilets", "Main Bathrooms: Mop floors", "Main Bathrooms: Take a shower", "Upstairs Bathroom: Wipe sink", "Upstairs Bathroom: Clean toilet", "Basement: Empty dehumidifier", "Basement: Clear steps", "Basement: Cycle laundry", "Whole House: Declutter", "Whole House: Dust", "Whole House: Vacuum"],
    Sunday: ["Personal: Groom", "Home: Finish laundry", "Home: Prepare for the work week", "Home: Catch anything that needs attention"],
  },
  weekends: {
    1: ["Bathrooms: Clean showers", "Safety: Test smoke detectors", "Pets: Groom dogs"],
    2: ["Garage: Sweep and declutter", "Basement: Declutter"],
    3: ["Upstairs: Clean bedrooms and bathrooms"],
    4: ["Kitchen: Organize pantry, drawers, and cabinets"],
    5: ["Whole House: Clean windows", "Whole House: Clean baseboards and door frames", "Living Room: Clean under the couch"],
  },
  months: {
    1: ["Laundry: Clean washing machine pump"],
    2: ["Kitchen: Clean under the stove and refrigerator"],
    3: ["HVAC: Change or clean furnace filters", "Home: Apply pest control"],
    4: ["Kitchen: Change water filters"],
    6: ["HVAC: Change or clean furnace filters"],
    7: ["Home: Make soap"],
    9: ["HVAC: Change or clean furnace filters"],
    10: ["Kitchen: Clean oven"],
    11: ["Home: Check windows and doors for drafts"],
    12: ["HVAC: Change or clean furnace filters"],
  },
};

const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

function splitTaskLabel(label, fallbackCategory = "General") {
  const separatorIndex = label.indexOf(":");
  if (separatorIndex < 0) return { category: fallbackCategory, name: label.trim() };
  return { category: label.slice(0, separatorIndex).trim(), name: label.slice(separatorIndex + 1).trim() };
}

function taskSlug(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildDefaultTasks() {
  const createdAt = "2026-07-13T00:00:00.000Z";
  const tasksByLabel = new Map();

  Object.entries(legacyChoreSchedule.days).forEach(([dayName, labels]) => {
    labels.forEach(label => {
      const parsed = splitTaskLabel(label);
      const key = `${parsed.category}|${parsed.name}`;
      if (!tasksByLabel.has(key)) {
        tasksByLabel.set(key, {
          id: `task-days-${taskSlug(parsed.category)}-${taskSlug(parsed.name)}`,
          name: parsed.name,
          category: parsed.category,
          schedule: { type: "days", days: [], weekend: null, months: [], date: null },
          visibility: { type: "household", visibleToIds: [] },
          createdById: "person-001",
          createdAt,
          active: true,
        });
      }
      tasksByLabel.get(key).schedule.days.push(DAY_INDEX[dayName]);
    });
  });

  const tasks = [...tasksByLabel.values()].map(task => ({
    ...task,
    schedule: { ...task.schedule, days: [...new Set(task.schedule.days)].sort((a, b) => a - b) },
  }));

  Object.entries(legacyChoreSchedule.weekends).forEach(([weekend, labels]) => {
    labels.forEach(label => {
      const parsed = splitTaskLabel(label);
      tasks.push({
        id: `task-weekends-${weekend}-${taskSlug(parsed.category)}-${taskSlug(parsed.name)}`,
        name: parsed.name,
        category: parsed.category,
        schedule: { type: "weekends", days: [], weekend: Number(weekend), months: [], date: null },
        visibility: { type: "household", visibleToIds: [] },
        createdById: "person-001",
        createdAt,
        active: true,
      });
    });
  });

  const monthTasks = new Map();
  Object.entries(legacyChoreSchedule.months).forEach(([month, labels]) => {
    labels.forEach(label => {
      const parsed = splitTaskLabel(label);
      const key = `${parsed.category}|${parsed.name}`;
      if (!monthTasks.has(key)) {
        monthTasks.set(key, {
          id: `task-months-${taskSlug(parsed.category)}-${taskSlug(parsed.name)}`,
          name: parsed.name,
          category: parsed.category,
          schedule: { type: "months", days: [], weekend: null, months: [], date: null },
          visibility: { type: "household", visibleToIds: [] },
          createdById: "person-001",
          createdAt,
          active: true,
        });
      }
      monthTasks.get(key).schedule.months.push(Number(month));
    });
  });

  tasks.push(...[...monthTasks.values()].map(task => ({
    ...task,
    schedule: { ...task.schedule, months: [...new Set(task.schedule.months)].sort((a, b) => a - b) },
  })));

  return tasks;
}

const defaultTasks = buildDefaultTasks();
