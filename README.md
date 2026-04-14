# PunchCard

Web app for shift tracking — clock in/out with GPS, weekly sign-off, admin approvals, history and map views. Published via GitHub Pages.

**Live:** https://punchcard-mockups.github.io/calendar-preview/app.html

## Demo accounts

All passwords are `1234`. Click a chip on the login screen to sign in.

| Username | Name | Role |
| --- | --- | --- |
| `alee` | Alejandra A. | Owner |
| `admin2` | Marisol G. | Admin |
| `admin3` | Carlos N. | Admin |
| `acct1` | Accountant | Read-only |
| `acct2` | Bookkeeper | Read-only |
| `maria` | Maria R. | Employee |
| `jose` | Jose A. | Employee |
| `luis` | Luis F. | Employee |

## Roles

- **Owner** — same permissions as Admin; labelled "OWNER". The primary day-to-day approver.
- **Admin** — backup approvers (approve weeks & edit requests, add employees).
- **Read-only** — accountants/bookkeepers. Full read access, no actions.
- **Employee** — clock in/out, submit week for approval, request edits on past shifts.

## Features

**Employee**
- Clock in / clock out with real browser GPS
- Shift calendar + month summary
- Weekly sign-off: submit the current week for approval
- Edit requests on past shifts (comment required)
- History with a mini-map of all located shifts
- Shifts under 9 hours require a comment

**Admin / Owner**
- Calendar view with per-day hours · staff count on each cell, month summary and per-employee breakdown
- Pending-approvals banner (weeks + edit requests combined count)
- Approvals modal: approve/reject weeks and shift edit requests
- Employee list with pending-week badges
- Tap an employee → their personal calendar, stats, map, and full shift list
- Tap any shift → shift detail screen with a map of just that shift

**Read-only**
- Sees admin home with the same data; all actions hidden

**Shared**
- EN/ES language toggle (fully localized)
- Editorial theme with Caramel accent
- Responsive; respects iOS safe-area insets
- Version stamp in the top-left updates on every deploy

## Tech

Vanilla HTML / CSS / JS — no framework, no build step. Google Fonts via `<link>`, OpenStreetMap tiles for maps, OKLCH color throughout.

## Workflow

Everything is edited in `app.html` and pushed to `main`. GitHub Pages rebuilds automatically (~60s).

```bash
git -c user.name=punchcard-mockups \
    -c user.email=punchcard-mockups@users.noreply.github.com \
    commit -am "your message"
git push
```

The version stamp (top-left) gets bumped manually on each push so you can tell when the deploy has caught up.
