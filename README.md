# PunchCard Web Mockup

Interactive web simulation of the PunchCard shift-tracking app, used for design iteration and stakeholder review. Published via GitHub Pages.

## What this is

A clickable prototype of the PunchCard experience — calendar, clock-in/out, history, approvals, admin views — running entirely in the browser with in-memory data. No backend. Designed to let the team see and test UI decisions before committing them to the Android prototype.

It is **not** a shipping product. Data resets on every page load.

## Live URLs

- **App (Editorial theme, prod-feeling):** https://punchcard-mockups.github.io/calendar-preview/app.html
- **Mockup / theme playground:** offline (preserved at `mockup.html` in the repo; restore by renaming to `index.html`)

## Repo layout

| File | Purpose |
| --- | --- |
| `app.html` | The production-feeling app simulation. Fills the full viewport. Editorial theme, Caramel accent, fixed in place. |
| `mockup.html` | Earlier exploration page with a phone-shell frame, sidebar, and a theme toggle for alternate design directions (Default, Minimalist, Warm, Nordic, Tactile, Midnight, Editorial). Currently offline (not served at root). |
| `calendar-summary.html` | Historical snapshot from the calendar-summary iteration. Kept for reference. |

## Demo accounts

All passwords are `1234` (except `alee` which is also `1234`). Click a chip on the login screen to sign in.

| Username | Name | Role | Purpose |
| --- | --- | --- | --- |
| `alee` | Alejandra A. | **Owner** | Main approver, full access |
| `admin2` | Marisol G. | Admin | Backup approver |
| `admin3` | Carlos N. | Admin | Backup approver |
| `acct1` | Accountant | Read-only | View-only (accounting) |
| `acct2` | Bookkeeper | Read-only | View-only |
| `maria` | Maria R. | Employee | Has a pending week for approval |
| `jose` | Jose A. | Employee | Has short shifts that triggered the 9hr comment rule |
| `luis` | Luis F. | Employee | Active employee |

## Roles

- **Owner** — same permissions as Admin; labelled "OWNER" on the badge. Intended for the one primary user (Alejandra) who approves day-to-day.
- **Admin** — backup approvers with the same action set (approve weeks & edit requests, add employees).
- **Read-only** — accountants/bookkeepers. Full read access, no actions.
- **Employee** — clock in/out, submit week for approval, request edits on past shifts.

## Features

**Employee**
- Clock in / clock out with real browser GPS (falls back to a mocked coord if permission denied or unavailable)
- Captured lat/lng shown inline during the flow
- Shift calendar + month summary (hours · days)
- Weekly sign-off: submit the current week for approval
- Edit requests on past shifts (requires a comment explaining the change)
- History with a mini-map of all located shifts
- 9-hour threshold — shifts under 9 hours require a comment

**Admin / Owner**
- Calendar view with per-day hours · staff count on each cell, month summary (hours · days) and per-employee breakdown in the summary card
- Pending-approvals banner (weeks + edit requests combined count)
- Approvals modal: approve/reject weeks and shift edit requests
- Employee list with pending-week badges
- Add employee FAB + modal
- Tap an employee → their personal calendar, stats, map, and full shift list
- Tap any shift → shift detail screen with a map of just that shift

**Read-only**
- Sees the admin home with the same data
- All action buttons and FABs are hidden or disabled
- Amber "read-only" banner in the greeting

**Shared**
- EN/ES language toggle (all UI strings, weekdays, month names, day labels, comments all localized)
- Editorial theme with Caramel accent (warm cream bg, ink type, Gloock serif headings + Vollkorn body + Azeret Mono for numerals)
- Responsive: fills the viewport at any size, respects iOS safe-area insets
- Version stamp in the top-left updates on every deploy

## Tech

- Vanilla HTML / CSS / JS — no framework, no build step, no bundler
- Google Fonts (Gloock, Vollkorn, Azeret Mono) loaded via `<link>`
- OpenStreetMap tiles for the mini-maps
- OKLCH color throughout; `color-mix()` for employee avatar tints
- CSS custom properties drive the theme; swapping themes on the mockup page is just a body class change

## Design decisions

See `GAP_ANALYSIS.md` for the full comparison with the Android prototype. Key intentional divergences from Android:

- **9-hour threshold** (Android uses 8) — matches the team's operational rule
- **Weekly sign-off** (new) — employees submit the week, admins approve
- **Edit requests** (new) — employees can request changes to past shifts with a required comment; admins approve or reject (Android lets admin edit directly)
- **Owner + Read-only roles** (new) — reflects the real team structure (1 primary approver, 2 backups, 2 accountants, 3 employees)
- **Summary + breakdown** below the calendar — Android only had the calendar
- **Per-shift map** — tap any shift to see just its clock-in/out pins

## Workflow

Everything is edited in the two HTML files and pushed to `main`. GitHub Pages rebuilds automatically (~60s).

```bash
# Edit app.html, then:
git -c user.name=punchcard-mockups \
    -c user.email=punchcard-mockups@users.noreply.github.com \
    commit -am "your message"
git push
```

The version stamp (top-left of the app) gets bumped manually on each push so you can tell at a glance when the deploy has caught up.

## Known limitations (these are mockup-level, not bugs to fix here)

- Data is in-memory and resets on every page load
- Passwords are stored in plain text
- No real backend, no sync, no multi-device
- No persistence of created employees, submitted shifts, or approvals
- Uses tile-based static maps; no pan/zoom

These are all the right shape for a mockup. Promoting any of them to production is addressed in the gap analysis.
