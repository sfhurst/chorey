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
// DEFAULT TASK OBJECTS
// ==========================================
// These seed a new installation and are copied into local storage. After that,
// local storage is the working task database until Supabase is introduced.
//
// Edit these objects directly when changing the built-in chore list. Categories,
// schedules, and stable IDs are explicit; no legacy string conversion runs here.
const defaultTasks = [
  {
    "id": "task-days-kitchen-wipe-microwave",
    "name": "Wipe microwave",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-wash-dishes",
    "name": "Wash dishes",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-rinse-sink",
    "name": "Rinse sink",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-wipe-counters-and-stovetop",
    "name": "Wipe counters and stovetop",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-meal-prep",
    "name": "Meal prep",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-wipe-counters",
    "name": "Wipe counters",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-rinse-sink",
    "name": "Rinse sink",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-wipe-toilet-seats",
    "name": "Wipe toilet seats",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        4,
        5
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-basement-empty-dehumidifier",
    "name": "Empty dehumidifier",
    "category": "Basement",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-basement-clear-steps",
    "name": "Clear steps",
    "category": "Basement",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-basement-cycle-laundry",
    "name": "Cycle laundry",
    "category": "Basement",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-personal-take-a-shower",
    "name": "Take a shower",
    "category": "Personal",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-take-out-garbage",
    "name": "Take out garbage",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        2
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-wipe-mirrors",
    "name": "Wipe mirrors",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        2,
        3
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-clean-toilets",
    "name": "Clean toilets",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        2,
        3,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-upstairs-bathroom-wipe-sink",
    "name": "Wipe sink",
    "category": "Upstairs Bathroom",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        2,
        4,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-upstairs-bathroom-clean-toilet",
    "name": "Clean toilet",
    "category": "Upstairs Bathroom",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        2,
        4,
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-take-out-recycling",
    "name": "Take out recycling",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        3
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-vacuum-floor",
    "name": "Vacuum floor",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        3
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-master-bedroom-change-the-bed-sheets",
    "name": "Change the bed sheets",
    "category": "Master Bedroom",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        4
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-master-bedroom-wash-bed-sheets",
    "name": "Wash bed sheets",
    "category": "Master Bedroom",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        4
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-master-bedroom-bedroom-declutter",
    "name": "Bedroom declutter",
    "category": "Master Bedroom",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        4
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-shock-the-pool",
    "name": "Shock the pool",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        4
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-clean-glass-doors",
    "name": "Clean glass doors",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        5
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-clean-refrigerator",
    "name": "Clean refrigerator",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-mop-floor",
    "name": "Mop floor",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-kitchen-meal-plan-and-order-groceries",
    "name": "Meal plan and order groceries",
    "category": "Kitchen",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-main-bathrooms-mop-floors",
    "name": "Mop floors",
    "category": "Main Bathrooms",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-declutter",
    "name": "Declutter",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-dust",
    "name": "Dust",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-vacuum",
    "name": "Vacuum",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        6
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-personal-groom",
    "name": "Groom",
    "category": "Personal",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        0
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-basement-finish-laundry",
    "name": "Finish laundry",
    "category": "Basement",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        0
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-prepare-for-the-work-week",
    "name": "Prepare for the work week",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        0
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-days-home-catch-anything-that-needs-attention",
    "name": "Catch anything that needs attention",
    "category": "Home",
    "schedule": {
      "type": "days",
      "date": null,
      "days": [
        0
      ],
      "week": null,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-1-bathrooms-clean-showers",
    "name": "Clean showers",
    "category": "Bathrooms",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 1,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-1-home-test-smoke-detectors",
    "name": "Test smoke detectors",
    "category": "Home",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 1,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-1-home-groom-dogs",
    "name": "Groom dogs",
    "category": "Home",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 1,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-2-garage-sweep-and-declutter",
    "name": "Sweep and declutter",
    "category": "Garage",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 2,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-2-basement-sweep-and-declutter",
    "name": "Sweep and declutter",
    "category": "Basement",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 2,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-3-upstairs-clean-bedrooms-and-bathrooms",
    "name": "Clean bedrooms and bathrooms",
    "category": "Upstairs",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 3,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-4-kitchen-organize-pantry-drawers-and-cabinets",
    "name": "Organize pantry, drawers, and cabinets",
    "category": "Kitchen",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 4,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-5-home-clean-windows",
    "name": "Clean windows",
    "category": "Home",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 5,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-5-home-clean-baseboards-and-door-frames",
    "name": "Clean baseboards and door frames",
    "category": "Home",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 5,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-weeks-5-home-clean-under-the-couch",
    "name": "Clean under the couch",
    "category": "Home",
    "schedule": {
      "type": "weeks",
      "date": null,
      "days": [],
      "week": 5,
      "months": []
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-basement-clean-washing-machine-pump",
    "name": "Clean washing machine pump",
    "category": "Basement",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        1
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-kitchen-clean-under-the-stove-and-refrigerator",
    "name": "Clean under the stove and refrigerator",
    "category": "Kitchen",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        2
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-home-change-or-clean-furnace-filters",
    "name": "Change or clean furnace filters",
    "category": "Home",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        3,
        6,
        9,
        12
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-home-apply-pest-control",
    "name": "Apply pest control",
    "category": "Home",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        3
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-kitchen-change-water-filters",
    "name": "Change water filters",
    "category": "Kitchen",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        4
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-home-make-soap",
    "name": "Make soap",
    "category": "Home",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        7
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-kitchen-clean-oven",
    "name": "Clean oven",
    "category": "Kitchen",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        10
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  },
  {
    "id": "task-months-home-check-windows-and-doors-for-drafts",
    "name": "Check windows and doors for drafts",
    "category": "Home",
    "schedule": {
      "type": "months",
      "date": null,
      "days": [],
      "week": null,
      "months": [
        11
      ]
    },
    "defaultAssigneeId": null,
    "visibility": {
      "type": "household",
      "visibleToIds": []
    },
    "createdById": "person-001",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "active": true
  }
];
