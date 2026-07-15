const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const context = { console };
vm.createContext(context);
vm.runInContext('const ChoreyUtils = { dateKey: date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` };', context);
vm.runInContext(fs.readFileSync(__dirname + '/../scheduler.js', 'utf8') + '\nthis.scheduler = ChoreyScheduler;', context);
const scheduler = context.scheduler;
const person = { id: 'p1' };
const task = (schedule) => ({ id:'t1', name:'Test', category:'Test', active:true, schedule, visibility:{type:'household'} });
const occurrence = (schedule, iso) => scheduler.buildDayData([task(schedule)], person, new Date(`${iso}T12:00:00`)).occurrences[0]?.occurrence || null;

// The week is Monday-Sunday and is named by its contained Saturday.
let item = occurrence({type:'weeks', week:2, months:[7], days:[], date:null}, '2026-07-06');
assert(item, 'Second week of July should open Monday July 6');
assert.strictEqual(item.opensOn, '2026-07-06');
assert.strictEqual(item.anchorOn, '2026-07-11');
assert.strictEqual(item.closesOn, '2026-07-12');
assert.strictEqual(occurrence({type:'weeks', week:2, months:[7], days:[], date:null}, '2026-07-12').anchorOn, '2026-07-11');
assert.strictEqual(occurrence({type:'weeks', week:2, months:[7], days:[], date:null}, '2026-07-13'), null);

// Seasonal applies only as a month filter to daily and weekly recurrence.
assert(occurrence({type:'days', days:[4], months:[5,6,7,8,9], week:null, date:null}, '2026-07-16'));
assert.strictEqual(occurrence({type:'days', days:[4], months:[5,6,7,8,9], week:null, date:null}, '2026-10-15'), null);
assert(occurrence({type:'weeks', week:1, months:[5,6,7,8,9], days:[], date:null}, '2026-09-01'));
assert.strictEqual(occurrence({type:'weeks', week:1, months:[5,6,7,8,9], days:[], date:null}, '2026-10-01'), null);

// Month-long tasks use their selected months directly.
item = occurrence({type:'months', months:[5], days:[], week:null, date:null}, '2026-05-20');
assert.strictEqual(item.opensOn, '2026-05-01');
assert.strictEqual(item.closesOn, '2026-05-31');
assert.strictEqual(occurrence({type:'months', months:[5], days:[], week:null, date:null}, '2026-06-01'), null);
console.log('Scheduler tests passed.');
