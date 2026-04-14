# PunchCard

Web app for shift tracking — clock in/out with GPS + timezone, weekly submission, admin approvals with audit trail, history with per-day detail. Published via GitHub Pages.

**Live:** https://punchcard-mockups.github.io/calendar-preview/app.html

## Demo accounts

All passwords are `1234`. Click a chip on the login screen to sign in.

| Username | Name | Role | What's set up |
| --- | --- | --- | --- |
| `alee` | Alejandra A. | Owner | The primary day-to-day approver |
| `admin2` | Marisol G. | Admin | Backup approver |
| `admin3` | Carlos N. | Admin | Backup approver |
| `acct1` | Accountant | Read-only | Accounting seat — view-only |
| `acct2` | Bookkeeper | Read-only | — |
| `maria` | Maria R. | Employee | Last week pending approval; has an admin-edited shift (Apr 1) visible in history |
| `jose` | Jose A. | Employee | Last week pending approval; includes a short shift with comment |
| `luis` | Luis F. | Employee | Last week was **rejected** by admin — rejection reason visible on home + past-weeks |

## Roles

- **Owner** / **Admin** — same action set today: approve/reject weeks, approve/reject edit requests, add employees, directly edit any shift (with required reason, logged).
- **Read-only** — accountants/bookkeepers. Full read access, all action buttons hidden.
- **Employee** — clock in/out, submit week for approval, request edits on past shifts (only on weeks that aren't yet admin-approved).

## Feature map

### Employee
- Clock In / Clock Out at the top of the home screen. Captures real browser GPS + the device's IANA timezone at each moment.
- Calendar with per-day hour readouts; month summary shows total hours and days worked.
- **Weekly submission** — submit the current week for approval with a one-line attestation. Past weeks that haven't been submitted show in a "Past weeks to submit" list. Rejected weeks show the admin's reason inline and offer a **Resubmit** button.
- **Request edit** on a past shift (date detail → button at bottom) — opens a modal with editable times + required reason. Disabled once the week has been admin-approved ("Approved — locked for editing").
- Shifts under 9 hours require a comment.
- History grouped **month → week**. Prior weeks collapse by default; click a week to expand. Week headers carry the status pill (Pending / Approved / Rejected) and total hours. A compact ✎ badge on the specific shift card flags which day was edited by an admin.
- Every time anywhere in the UI carries its timezone tag ("EDT", "CEST", etc.) — if the employee clocked in and out in different zones, each end is tagged separately.

### Admin / Owner
- Calendar overview with a daily heatmap, per-employee breakdown in the month summary.
- Pending-approvals banner combining week approvals + shift edit requests.
- Approvals modal:
  - **Drill-in**: tap a pending week to expand and see every shift in that week (date · time range · hours · comment) before approving.
  - **Approve**: animates the row out, marks the week approved.
  - **Reject**: opens an inline "Why are you rejecting this week?" textarea — a reason is required and is shown to the employee.
- Employee list with per-employee pending-week badges. Tap an employee to see their calendar, history, and map.
- Shift detail: an "Edit shift" button lets owner/admin change times on any shift (even after approval). The reason is required and each edit is appended to the shift's audit log — visible as a timestamped entry with editor, before→after diff, and reason.

### Read-only
- Sees the admin home with the same data; all action buttons / FABs are hidden.

### Shared
- EN / ES language toggle — every string, including rejection and audit-log messages, is localized.
- Editorial theme (Gloock + Vollkorn + Azeret Mono, cream + ink + Caramel accent); respects iOS safe area.
- Smooth submit / approve / reject animations — rows collapse + fade rather than the screen re-rendering.
- Version stamp in the top-left is bumped manually on each push so you can tell when the deploy has caught up.

## Tech

Vanilla HTML / CSS / JS — no framework, no build step. Google Fonts via `<link>`, OpenStreetMap tiles for maps, OKLCH color throughout. `Intl.DateTimeFormat` for timezone detection and display, `navigator.permissions.query` for GPS-permission pre-check.

## Workflow

Everything lives in `app.html` and pushes to `main`. GitHub Pages rebuilds automatically (~60s).

```bash
git -c user.name=punchcard-mockups \
    -c user.email=punchcard-mockups@users.noreply.github.com \
    commit -am "your message"
git push
```

Bump the version stamp (`<div class="version-tag">` near the top of the body) on each push so you can tell at a glance when the deploy has caught up.
