// Generates db.json from the same seed logic the mockup originally
// ran in-browser. Run with: node tools/build-db.mjs
//
// Output shape:
//   { users, shifts, weekApprovals, editRequests }
//
// The seed is deterministic (LCG), so regenerating produces byte-identical
// output unless the logic here changes.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "db.json");

// ---- users ----------------------------------------------------------------

const users = [
  { id: 1, username: "alee",   password: "1234", displayName: "Alejandra A.", role: "owner",    color: "var(--emp-3)"  },
  { id: 2, username: "admin2", password: "1234", displayName: "Marisol G.",   role: "admin",    color: "var(--emp-5)"  },
  { id: 3, username: "admin3", password: "1234", displayName: "Carlos N.",    role: "admin",    color: "var(--emp-10)" },
  { id: 4, username: "acct1",  password: "1234", displayName: "Accountant",   role: "readonly", color: "var(--emp-8)"  },
  { id: 5, username: "acct2",  password: "1234", displayName: "Bookkeeper",   role: "readonly", color: "var(--emp-9)"  },
  { id: 6, username: "maria",  password: "1234", displayName: "Maria R.",     role: "employee", color: "var(--emp-2)"  },
  { id: 7, username: "jose",   password: "1234", displayName: "Jose A.",      role: "employee", color: "var(--emp-1)"  },
  { id: 8, username: "luis",   password: "1234", displayName: "Luis F.",      role: "employee", color: "var(--emp-6)"  },
];

// ---- shifts ---------------------------------------------------------------

let nextShiftId = 100;
const shifts = [];
function addShift({ empId, date, start, end, comment = "", loc, tz }) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  shifts.push({
    id: nextShiftId++,
    empId, date, start, end, hours, comment,
    clockIn:    loc?.in  || null,
    clockOut:   loc?.out || null,
    clockInTz:  tz?.in   || null,
    clockOutTz: tz?.out  || null,
  });
}

const FIXED_LOCS = [
  { in:{lat:38.87195, lng:-77.05618}, out:{lat:38.87173, lng:-77.05642} },
  { in:{lat:38.87168, lng:-77.05655}, out:{lat:38.87190, lng:-77.05612} },
  { in:{lat:38.87201, lng:-77.05602}, out:{lat:38.87178, lng:-77.05675} },
  { in:{lat:38.87160, lng:-77.05631}, out:{lat:38.87205, lng:-77.05608} },
  { in:{lat:38.87218, lng:-77.05660}, out:{lat:38.87182, lng:-77.05599} },
  { in:{lat:38.87155, lng:-77.05592}, out:{lat:38.87198, lng:-77.05650} },
];
let locIdx = 0;
const nextLoc = () => FIXED_LOCS[(locIdx++) % FIXED_LOCS.length];

// Curated April 2026 data
const aprilPattern = [
  [1, 2, "07:30","15:30"],
  [1, 2, "08:00","16:00"],
  [2, 2, "09:00","17:00"],
  [3, 2, "07:30","15:00"],
  [3, 3, "08:30","17:30"],
  [6, 2, "08:00","13:30", "Left early for dentist"],
  [7, 3, "08:00","17:00"],
  [7, 4, "09:00","15:00"],
  [8, 2, "07:30","16:30"],
  [8, 3, "08:00","17:00"],
  [8, 5, "12:00","20:00"],
  [9, 4, "07:00","15:30"],
  [10, 2, "08:00","17:00"],
  [10, 3, "08:00","16:00"],
  [10, 4, "08:00","16:00"],
  [10, 5, "10:00","18:00"],
  [13, 2, "07:30","16:30"],
  [13, 3, "08:00","16:00"],
  [14, 3, "08:00","12:00", "Half day — appointment"],
  [14, 4, "08:00","17:00"],
  [15, 2, "08:00","16:00"],
  [15, 5, "09:00","17:00"],
  [16, 2, "07:30","17:00"],
  [16, 3, "08:00","17:00"],
  [16, 4, "09:00","15:00"],
  [17, 2, "07:30","16:30"],
  [17, 3, "08:00","16:00"],
  [17, 4, "08:30","16:30"],
  [17, 5, "10:00","18:00"],
  [20, 2, "08:00","16:00"],
  [20, 3, "08:00","16:00"],
  [21, 4, "09:00","17:00"],
  [21, 5, "09:00","17:00"],
  [22, 2, "07:30","15:30"],
  [22, 3, "08:00","17:00"],
  [22, 4, "08:00","16:00"],
  [23, 2, "08:00","16:00"],
  [24, 2, "07:30","17:00"],
  [24, 3, "08:00","16:30"],
  [24, 5, "10:00","18:00"],
  [11, 3, "09:00","13:00", "School pickup — ran long"],
  [18, 3, "10:00","18:30"],
];
const OLD_TO_NEW_EMP = { 2: 6, 3: 7, 4: 8 };
const SOFIA_FALLBACK = [6, 7, 8];
let sofiaIdx = 0;
for (const [day, emp, start, end, comment] of aprilPattern) {
  const dateStr = `2026-04-${String(day).padStart(2, "0")}`;
  const newEmp = OLD_TO_NEW_EMP[emp] ?? SOFIA_FALLBACK[sofiaIdx++ % SOFIA_FALLBACK.length];
  addShift({
    empId: newEmp, date: dateStr, start, end,
    comment: comment || "",
    loc: nextLoc(),
    tz: { in: "America/New_York", out: "America/New_York" },
  });
}

// ---- week approvals -------------------------------------------------------

const weekApprovals = [
  { empId: 6, weekStart: "2026-04-06", status: "pending" },
  { empId: 7, weekStart: "2026-04-06", status: "pending" },
  { empId: 8, weekStart: "2026-04-06", status: "rejected",
    rejectionComment: "Thursday's hours look off — 9:00 AM start but the GPS was still at home. Please double-check and resubmit." },
];

// ---- seed admin edit on Apr-1 shift --------------------------------------

{
  const targetShift = shifts.find(s => s.empId === 6 && s.date === "2026-04-01");
  if (targetShift) {
    if (!targetShift.adminEdits) targetShift.adminEdits = [];
    targetShift.adminEdits.push({
      by: 1,
      at: new Date("2026-04-05T14:30:00").toISOString(),
      oldStart: targetShift.start,
      oldEnd: targetShift.end,
      newStart: targetShift.start,
      newEnd: "15:00",
      comment: "Cut short — Maria left 30 min early for dentist; she forgot to clock out.",
    });
    targetShift.end = "15:00";
    const [sh, sm] = targetShift.start.split(":").map(Number);
    targetShift.hours = ((15 * 60) - (sh * 60 + sm)) / 60;
  }
}

// ---- ~6 months of historical shifts --------------------------------------

(function seedHistorical() {
  const COMMENTS = [
    "Left early for dentist","Dr. appointment","Kid home sick",
    "Car trouble — late start","Holiday cover — short day",
    "School pickup — ran long","Half day — appointment",
  ];
  let seed = 20261013;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const employeeIds = [6, 7, 8];
  const week = new Date(2025, 9, 13);
  const lastWeek = new Date(2026, 2, 23);
  const historicalShiftIds = [];

  while (week <= lastWeek) {
    const weekStart = toYMD(week);
    for (const empId of employeeIds) {
      const skipDay = rand() < 0.35 ? Math.floor(rand() * 5) : -1;
      for (let day = 0; day < 5; day++) {
        if (day === skipDay) continue;
        const shiftDate = new Date(week);
        shiftDate.setDate(week.getDate() + day);
        const dateStr = toYMD(shiftDate);

        const startH = 7 + Math.floor(rand() * 2);
        const startM = Math.floor(rand() * 4) * 15;
        const short = rand() < 0.08;
        const durHrs = short ? 4 + rand() * 3 : 8 + rand() * 1.25;
        const endTotalMin = startH * 60 + startM + Math.round(durHrs * 60 / 15) * 15;
        const endH = Math.floor(endTotalMin / 60);
        const endM = endTotalMin % 60;

        const idBefore = nextShiftId;
        addShift({
          empId, date: dateStr,
          start: `${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}`,
          end:   `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`,
          comment: short ? pick(COMMENTS) : "",
          loc: nextLoc(),
          tz: { in: "America/New_York", out: "America/New_York" },
        });
        historicalShiftIds.push(idBefore);
      }
      weekApprovals.push({ empId, weekStart, status: "approved" });
    }
    week.setDate(week.getDate() + 7);
  }

  const applyEdit = (shiftIdx, editor, at, trimMinutesOff, comment) => {
    const sh = shifts.find(s => s.id === historicalShiftIds[shiftIdx]);
    if (!sh) return;
    const [sH, sM] = sh.start.split(":").map(Number);
    const [eH, eM] = sh.end.split(":").map(Number);
    const newEndMin = (eH * 60 + eM) - trimMinutesOff;
    const newEnd = `${String(Math.floor(newEndMin/60)).padStart(2,'0')}:${String(newEndMin%60).padStart(2,'0')}`;
    sh.adminEdits = sh.adminEdits || [];
    sh.adminEdits.push({
      by: editor,
      at: new Date(at).toISOString(),
      oldStart: sh.start, oldEnd: sh.end,
      newStart: sh.start, newEnd,
      comment,
    });
    sh.end = newEnd;
    sh.hours = (newEndMin - (sH*60+sM)) / 60;
  };
  if (historicalShiftIds.length > 20) {
    applyEdit(Math.floor(historicalShiftIds.length * 0.25), 1,
      "2026-01-10T16:20:00", 15,
      "Clock-out ran 15 min past actual — trimmed.");
    applyEdit(Math.floor(historicalShiftIds.length * 0.55), 2,
      "2026-02-14T10:05:00", 30,
      "End time corrected — cameras show they left 30 min earlier.");
  }
})();

// ---- edit requests --------------------------------------------------------

const editRequests = [];
let nextEditReqId = 1;
(function seedEditRequest() {
  const candidate = shifts
    .filter(s => s.empId === 6 && s.date >= "2026-03-16" && s.date <= "2026-03-27")
    .pop();
  if (!candidate) return;
  const [sH, sM] = candidate.start.split(":").map(Number);
  const newStartMin = Math.max(0, sH * 60 + sM - 30);
  const newStart = `${String(Math.floor(newStartMin/60)).padStart(2,'0')}:${String(newStartMin%60).padStart(2,'0')}`;
  editRequests.push({
    id: nextEditReqId++,
    shiftId: candidate.id,
    empId: 6,
    start: newStart,
    end: candidate.end,
    comment: "I forgot to clock in when I arrived — actual start was ~30 min earlier.",
    status: "pending",
    submittedAt: new Date("2026-04-09T18:30:00").toISOString(),
  });
})();

// ---- emit -----------------------------------------------------------------

const db = { users, shifts, weekApprovals, editRequests };
writeFileSync(OUT, JSON.stringify(db, null, 2) + "\n");
console.log(`Wrote ${OUT}`);
console.log(`  users:         ${users.length}`);
console.log(`  shifts:        ${shifts.length}`);
console.log(`  weekApprovals: ${weekApprovals.length}`);
console.log(`  editRequests:  ${editRequests.length}`);
