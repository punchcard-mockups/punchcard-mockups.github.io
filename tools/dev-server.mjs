// Local dev server: serves index.html + mocks the Worker API with dummy data.
// Boot with: node tools/dev-server.mjs   →  http://localhost:8000
// The page's API_BASE auto-switches to "" on localhost so /login, /db etc.
// hit this server instead of workers.dev. Production traffic is untouched.
//
// Dummy fixtures are designed to reproduce the day-detail name-truncation bug:
// one overnight shift (+1d badge) and tz suffixes so the time column eats the row.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 8000;

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const dayInMonth = (offset) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
  return iso(d);
};

const db = {
  users: [
    { id: 1, username: "alee",      displayName: "Alejandra A.",            role: "owner",    color: "var(--emp-3)", passwordSalt: "x", passwordHash: "x" },
    { id: 2, username: "ana",       displayName: "Ana Teresa Cuervo",       role: "employee", color: "var(--emp-1)", passwordSalt: "x", passwordHash: "x" },
    { id: 3, username: "elizabeth", displayName: "Elizabeth E. Lopez Laguna", role: "employee", color: "var(--emp-4)", passwordSalt: "x", passwordHash: "x" },
    { id: 4, username: "yanira",    displayName: "Yanira Zare Salazar",     role: "employee", color: "var(--emp-7)", passwordSalt: "x", passwordHash: "x" },
    { id: 5, username: "pedro",     displayName: "Pedro Cuervo",            role: "readonly", color: "var(--emp-5)", passwordSalt: "x", passwordHash: "x" },
  ],
  shifts: [
    // OPEN shifts — clocked in today, no clock-out yet. end/hours are null,
    // which is how a clock-in is persisted before the matching clock-out
    // lands. These drive the "On shift now" live roster on the admin home.
    { id: 90, empId: 2, date: iso(today), start: "08:53", end: null, hours: null, clockInTz: "America/Lima",     clockOutTz: null, comment: "", adminEdits: [] },
    { id: 91, empId: 4, date: iso(today), start: "12:15", end: null, hours: null, clockInTz: "America/New_York", clockOutTz: null, comment: "", adminEdits: [] },
    // EARLY-MORNING clock-ins (before the 3:30am books boundary): actually
    // clocked in on `date`, but BOOKED to the previous calendar day. These
    // demonstrate the day-boundary rule on the calendar + week roll-up.
    { id: 92, empId: 3, date: iso(today),    start: "01:30", end: "09:30", hours: 8.0, clockInTz: "America/New_York", clockOutTz: "America/New_York", comment: "Overnight special — covered the early hours", adminEdits: [] },
    { id: 93, empId: 2, date: dayInMonth(1), start: "02:45", end: "10:45", hours: 8.0, clockInTz: "America/Lima",     clockOutTz: "America/Lima",     comment: "", adminEdits: [] },
    { id: 1, empId: 2, date: dayInMonth(2), start: "08:53", end: "23:39", hours: 14.8, clockInTz: "America/Lima",     clockOutTz: "America/Lima",     comment: "", adminEdits: [] },
    { id: 2, empId: 3, date: dayInMonth(2), start: "22:00", end: "06:00", hours: 8.0,  clockInTz: "America/New_York", clockOutTz: "America/New_York", comment: "overnight", adminEdits: [] },
    { id: 3, empId: 4, date: dayInMonth(2), start: "09:00", end: "17:00", hours: 8.0,  clockInTz: "America/Lima",     clockOutTz: "America/Lima",     comment: "", adminEdits: [] },
    { id: 4, empId: 2, date: dayInMonth(5), start: "08:00", end: "16:30", hours: 8.5,  clockInTz: "America/Lima",     clockOutTz: "America/Lima",     comment: "", adminEdits: [] },
    { id: 5, empId: 3, date: dayInMonth(7), start: "07:45", end: "15:55", hours: 8.2,  clockInTz: "America/New_York", clockOutTz: "America/New_York", comment: "", adminEdits: [] },
  ],
  weekApprovals: [],
  editRequests: [],
};

const TOKEN = "dev-token";
let currentUserId = null;

const publicUser = (u) => ({
  id: u.id, username: u.username, displayName: u.displayName, role: u.role, color: u.color,
  ...(u.noteOptional ? { noteOptional: true } : {}),
});

const filterDbForUser = (user) => {
  const users = db.users.map(publicUser);
  if (user.role === "employee") {
    return {
      users,
      shifts: db.shifts.filter((s) => s.empId === user.id),
      weekApprovals: db.weekApprovals.filter((w) => w.empId === user.id),
      editRequests: db.editRequests.filter((r) => r.empId === user.id),
    };
  }
  return { users, shifts: db.shifts, weekApprovals: db.weekApprovals, editRequests: db.editRequests };
};

const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const send = (status, body, type = "application/json") => {
    res.writeHead(status, {
      "Content-Type": type,
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };
  try {
    if (req.method === "OPTIONS") return send(204, "");
    const url = new URL(req.url, "http://localhost");

    if (req.method === "POST" && url.pathname === "/login") {
      let body = ""; for await (const c of req) body += c;
      const { username } = JSON.parse(body || "{}");
      const user = db.users.find((u) => u.username.toLowerCase() === (username || "").trim().toLowerCase());
      if (!user) return send(401, { error: "invalid credentials" });
      currentUserId = user.id;
      return send(200, { user: publicUser(user), token: TOKEN });
    }
    if (req.method === "POST" && url.pathname === "/logout") {
      currentUserId = null;
      return send(200, { ok: true });
    }
    if (req.method === "GET" && url.pathname === "/me") {
      if (!currentUserId) return send(401, { error: "unauthenticated" });
      const u = db.users.find((x) => x.id === currentUserId);
      return send(200, { user: publicUser(u) });
    }
    if (req.method === "GET" && url.pathname === "/db") {
      if (!currentUserId) return send(401, { error: "unauthenticated" });
      const u = db.users.find((x) => x.id === currentUserId);
      return send(200, { user: publicUser(u), db: filterDbForUser(u) });
    }
    // Clock-in: append a shift (open if `end` omitted). Mirrors the Worker's
    // POST /shifts so the local headed demo exercises the real clock flow.
    if (req.method === "POST" && url.pathname === "/shifts") {
      if (!currentUserId) return send(401, { error: "unauthenticated" });
      const u = db.users.find((x) => x.id === currentUserId);
      if (u.role !== "employee") return send(403, { error: "only employees clock in" });
      let raw = ""; for await (const c of req) raw += c;
      const b = JSON.parse(raw || "{}");
      if (!b.date) return send(400, { error: "missing date" });
      const id = db.shifts.reduce((m, x) => Math.max(m, x.id ?? 0), 0) + 1;
      const shift = {
        id, empId: u.id, date: b.date, start: b.start, end: b.end ?? null,
        hours: typeof b.hours === "number" ? b.hours : null,
        clockIn: b.clockIn ?? null, clockOut: b.clockOut ?? null,
        clockInTz: b.clockInTz ?? null, clockOutTz: b.clockOutTz ?? null,
        comment: b.comment ?? "", adminEdits: [],
      };
      db.shifts.push(shift);
      console.log(`[shifts] ${u.username} ${shift.date} ${shift.start}–${shift.end ?? "open"} (id ${id})`);
      return send(200, { ok: true, shift });
    }
    // Clock-out: close own open shift. Mirrors the Worker's /shifts/clock-out.
    if (req.method === "POST" && url.pathname === "/shifts/clock-out") {
      if (!currentUserId) return send(401, { error: "unauthenticated" });
      const u = db.users.find((x) => x.id === currentUserId);
      let raw = ""; for await (const c of req) raw += c;
      const b = JSON.parse(raw || "{}");
      const idx = db.shifts.findIndex((s) => s.id === b.id);
      if (idx < 0) return send(404, { error: "shift not found" });
      const cur = db.shifts[idx];
      if (cur.empId !== u.id) return send(403, { error: "not your shift" });
      if (cur.end) return send(409, { error: "shift already closed" });
      if (!b.end) return send(400, { error: "missing end" });
      const shift = {
        ...cur,
        end: b.end,
        hours: typeof b.hours === "number" ? b.hours : null,
        ...(b.clockIn != null ? { clockIn: b.clockIn } : {}),
        ...(typeof b.clockInTz === "string" ? { clockInTz: b.clockInTz } : {}),
        ...(b.clockOut != null ? { clockOut: b.clockOut } : {}),
        ...(typeof b.clockOutTz === "string" ? { clockOutTz: b.clockOutTz } : {}),
        ...(typeof b.comment === "string" ? { comment: b.comment } : {}),
      };
      db.shifts[idx] = shift;
      console.log(`[clock-out] ${u.username} closed id ${shift.id} → ${shift.end}`);
      return send(200, { ok: true, shift });
    }
    if (req.method === "GET" && url.pathname === "/health") return send(200, { ok: true });

    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const fp = join(ROOT, path);
    const ext = path.slice(path.lastIndexOf("."));
    const buf = await readFile(fp).catch(() => null);
    if (!buf) return send(404, "not found", "text/plain");
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    res.end(buf);
  } catch (e) {
    send(500, { error: e.message });
  }
}).listen(PORT, () => {
  console.log(`dev server on http://localhost:${PORT}`);
  console.log("dummy logins (any password):");
  for (const u of db.users) console.log(`  ${u.username.padEnd(12)} ${u.role.padEnd(10)} ${u.displayName}`);
});
