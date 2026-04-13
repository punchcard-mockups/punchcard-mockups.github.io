# Gap Analysis — Android Prototype ⇄ Web Mockup

Purpose: map what the Android PunchCard prototype supports against what the web mockup (`app.html`) simulates, so we know what has to be built before the web version could actually replace or complement the Android one.

Last updated alongside web `v.2026-04-13.1745`. The Android tree surveyed lives at `/Users/nathanfrost/projects/PunchCard`.

## Legend

- ✅ Implemented
- 🟡 Partial — works in the UI but isn't wired to real infrastructure (in-memory, no persistence, etc.)
- ❌ Missing
- 🆕 Present only in this side
- 🔀 Intentional divergence — behaviour is different on purpose

---

## Data model

| Entity / field | Android | Web | Notes |
| --- | --- | --- | --- |
| `User(id, username, passwordHash, displayName, role)` | ✅ SHA-256 hashed, Room entity | 🟡 In-memory, plain-text passwords | Web stores passwords as strings on the user object. |
| `Shift(id, employeeId, date, startTime, endTime, hours, latitude, longitude, clockOutLatitude, clockOutLongitude, comment, timezone, createdAt)` | ✅ Room entity, v3 schema | 🟡 In-memory objects | Web omits `timezone` and `createdAt`; otherwise equivalent. |
| `UserRole` | ADMIN, EMPLOYEE | owner, admin, readonly, employee | 🔀 Web adds Owner + Read-only |
| Week approvals | ❌ | 🆕 🟡 Array of `{empId, weekStart, status}` | New concept in web. |
| Edit requests | ❌ | 🆕 🟡 Array of `{shiftId, start, end, comment, status}` | New concept in web. |

## Authentication & roles

| Capability | Android | Web |
| --- | --- | --- |
| Username + password login | ✅ SHA-256 | 🟡 plain-text compare |
| Password hashing | ✅ | ❌ |
| Change password | ❌ | ❌ |
| Session persistence (survive app restart) | ✅ DataStore (likely) | ❌ Resets on page reload |
| Seed accounts | admin + 3 employees | 1 owner + 2 admins + 2 readonly + 3 employees |
| Role-gated UI | Admin vs Employee | Owner/Admin share, Readonly view-only, Employee separate |
| Read-only (view-only) role | ❌ | 🆕 ✅ |
| Owner vs Admin distinction | ❌ | 🆕 ✅ (cosmetic only; same powers) |

## Employee features

| Capability | Android | Web |
| --- | --- | --- |
| Clock-in timestamp | ✅ | ✅ |
| Clock-out timestamp | ✅ | ✅ |
| Clock-in GPS capture | ✅ FusedLocationProviderClient | ✅ `navigator.geolocation` |
| Clock-out GPS capture | ✅ | ✅ |
| Location permission prompt | ✅ ACCESS_FINE_LOCATION manifest + runtime request | ✅ Browser native prompt |
| Shift comment (optional) | ✅ | ✅ |
| Short-shift comment threshold | 🔀 **8 hours** | 🔀 **9 hours** |
| Enforce required comment | ✅ under threshold | ✅ under threshold |
| Shift history (list) | ✅ | ✅ |
| Shift history map | ✅ multi-pin static tiles | ✅ multi-pin static tiles (tightened zoom, 2×2 grid) |
| Per-shift detail screen | ✅ | ✅ with per-shift map |
| Employee edits their own past shift | ❌ (admin only) | 🔀 ✅ via edit request with required comment |
| Weekly sign-off | ❌ | 🆕 ✅ |
| Language toggle | ✅ EN/ES | ✅ EN/ES |
| Timezone stored on shift | ✅ | ❌ |

## Admin features

| Capability | Android | Web |
| --- | --- | --- |
| Admin calendar view | ✅ | ✅ |
| Calendar day summary (per-day stats) | ✅ colored cards | ✅ `24h · 3` staff count readout, heatmap tint |
| Month-level summary card | ❌ (or minimal) | 🆕 ✅ hours · days |
| Per-employee breakdown | ❌ | 🆕 ✅ horizontal bar graph |
| Employee list | ✅ | ✅ |
| Add employee dialog | ✅ with unique-username check | 🟡 ✅ (in-memory; not persisted) |
| Edit employee (rename, change role, delete) | ❌ | ❌ |
| Admin directly edits a shift | ✅ TimePickerDialog + comment | 🔀 ❌ replaced with "approve edit request" flow |
| Admin views individual employee's history | ✅ | ✅ |
| Admin views per-shift map | ✅ | ✅ |
| Weekly approval queue | ❌ | 🆕 ✅ |
| Edit-request approval queue | ❌ | 🆕 ✅ |
| Combined approvals banner + modal | ❌ | 🆕 ✅ |
| Bulk actions (approve many at once) | ❌ | ❌ |

## Storage & persistence

| Capability | Android | Web |
| --- | --- | --- |
| Local DB | ✅ Room v3 SQLite | ❌ in-memory JS |
| Migrations | ✅ v1→v2 timezone, v2→v3 clock-out coords | N/A |
| Cloud sync | ❌ | ❌ |
| Multi-device | ❌ (each device has its own DB) | ❌ |
| Session survives app close | ✅ | ❌ |
| Offline queue | ❌ (writes are synchronous to local DB; no network involved) | ❌ |

## i18n

| Capability | Android | Web |
| --- | --- | --- |
| English | ✅ | ✅ |
| Spanish | ✅ 59 keys | ✅ full coverage including stats labels and new approval/edit strings |
| Language toggle placement | Top bar | Top bar (segmented slider) |
| Locale-aware date/time | ✅ `DateTimeFormatter` with locale | ✅ `toLocaleDateString` / `toLocaleTimeString` |
| Spanish coverage for new features (approvals, edit requests) | N/A (features don't exist) | ✅ |

## Permissions / platform

| | Android | Web |
| --- | --- | --- |
| Location | ✅ ACCESS_FINE_LOCATION + ACCESS_COARSE_LOCATION | ✅ `navigator.geolocation` over HTTPS |
| Camera | ❌ | ❌ |
| Notifications | ❌ | ❌ |
| Push | ❌ | ❌ |
| Foreground service | N/A | N/A |

## Design / theme

| | Android | Web |
| --- | --- | --- |
| Design language | Material 3 (Jetpack Compose) | Custom Editorial (Gloock + Vollkorn + Azeret Mono, cream + ink + Caramel accent) |
| Dark mode | Material dynamic | Not implemented (deliberately light-only in Editorial) |
| Semantic color coding | Red/green/amber in Material palette | Red=warn, green=ok, amber=pending, caramel=action, user colors distinct from all |
| Employee color palette | Generic random selection | Curated jewel-tone palette, explicitly non-semantic |
| Responsive | Mobile-first (it's an Android app) | Fills any viewport, respects iOS safe area |

## Divergences that need a decision

These are places where web deliberately behaves differently from Android. Pick one as the source of truth:

1. **Comment threshold: 8 hr (Android) vs 9 hr (Web).** Team said 9 in the feedback list — Android needs updating if we keep 9.
2. **Shift edits: admin-direct (Android) vs request-and-approve (Web).** Web's flow is stricter and leaves a paper trail. If adopted, Android needs to add the edit-request schema and approval UI.
3. **Weekly sign-off: web-only.** If adopted, Android needs a `WeekApproval` entity, approval UI, and the "submit week" flow on the employee side.
4. **Role hierarchy: 2 roles (Android) vs 4 (Web).** Android needs Owner + Read-only if we standardise on the web model. Owner is cosmetic; Read-only is a real permission level that will need DB/DAO gating.

---

## To build — in order of priority (if we promote the web version toward production)

### P0 — nothing ships without these

1. **Backend / persistence.** Currently all data is in memory. Needs some backing store (Firebase, Supabase, a small custom API — pick one). Includes: user accounts, shifts, week approvals, edit requests.
2. **Auth** — real password hashing (bcrypt/argon2), session tokens, optional password reset. Today: plain-text compare.
3. **Data sync model.** Pick offline-first (local cache + reconciliation) or online-only. Android implies offline-first was considered (Room, no network); web currently implies online-only (no cache layer).

### P1 — reach feature-parity with Android

4. **Admin direct-edit of shifts** — either as a separate code path, or drop it in favour of the request/approve flow on Android too.
5. **Session persistence** — remember the logged-in user between page loads.
6. **Timezone column on shift** — Android captures it, web drops it. Add back if shifts can span TZs (travelling employees).
7. **Edit/remove employee** — both apps are missing this. Realistic teams will churn; you'll need it before launch.

### P2 — polish & parity of new web-only features into Android (if we standardise)

8. **Weekly sign-off & edit requests** in Android, with the same required-comment rule.
9. **Owner + Read-only roles** in Android.
10. **Month summary card + per-employee breakdown** in the Android calendar view.

### P3 — things neither app has yet, likely needed for real operations

11. **Export** (CSV for payroll; PDF for record-keeping).
12. **Notifications** — on pending approvals (admin), on approved/rejected shifts (employee).
13. **Audit log** — who edited what and when, especially once edits can happen remotely.
14. **Analytics** — hours per employee over time, week-over-week comparisons.
15. **Bulk approval** — approve all pending weeks/edits with one action.
16. **Photo attachment** — if you ever want proof of work or clock-in location validation.
17. **Geofencing** — warn/block clock-in outside a business radius.

## Open questions

- **Target deployment:** is the end-state Android-only, web-only, or both? That decides whether web needs to stay feature-parallel or whether the Android app eventually retires.
- **Where does data live?** The mockup has been useful for UI/UX but makes no assertions about backend architecture. Needs a decision before anything in P0 can start.
- **Who can create accounts?** Currently admins/owners only via the add-employee dialog. Is self-sign-up ever allowed? (No in either app today.)
- **Account-level data scope:** if multiple businesses adopt this, does each one own its own data tenancy? The current schema has no `business_id` concept.
