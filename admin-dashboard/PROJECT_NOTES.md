# Project Notes — Admin Dashboard

## HARD RULES

- Do not rebuild the app or delete working functionality; no unrelated refactors.
- No backend, database, or new authentication. No Redux/Zustand/MobX unless inspection proves it unavoidable (explain first). No TypeScript conversion.
- Prefer React Context + custom hooks + existing services; persistence via localStorage, centralized in one place.
- One source of truth per entity; Dashboard/Reports COMPUTE from it (derived values, never stored copies).
- Never hardcode metrics, report numbers, or fake activity entries.
- No new dependencies without a concrete reason.
- Prefer the smallest change that meets the requirement.
- Do not start visual redesign before functionality is done and verified.
- After each phase, report: what was inspected, changed, why, files changed, functionality completed, issues, verification actually performed (never claim untested things passed), what remains.

---

## Findings from Inspection

### What Works

1. **Full CRUD for Users** — Add, edit, delete, toggle favorite, filter by status/favorite, search by name/email/role. All persisted to localStorage.
2. **Full CRUD for Patients** — Add, edit, delete, filter by status, search by name/email/phone. All persisted to localStorage.
3. **Dashboard** — Computes 8 statistics (user counts, patient counts) directly from `useUsers()` and `usePatients()` data. Shows recent activity (last 5).
4. **Reports** — Computes user/patient statistics and trend tables from data via `buildUserReport()`/`buildPatientReport()` in `utils/reports.js`. Period filter (all/6m/12m) and category filter work.
5. **Settings** — Profile, notifications, appearance persisted to localStorage with defaults merge. Reset to defaults works.
6. **Activity log** — Recorded on user CRUD + patient CRUD operations. Persisted to localStorage with max 100 entries. `clearActivities()` exists.
7. **Routing** — react-router v8 with BrowserRouter, nested routes, AdminLayout as layout route with `<Outlet/>`.
8. **Components** — Sidebar, Header, StatCard, UserTable, PatientTable, StatusBadge, Modal, PageHeader, PageActions, SelectedUser, SelectedPatient, AddUserForm, EditUserForm, AddPatientForm, EditPatientForm, TrendTable — all functional and reusable.
9. **Validation** — Email, phone, DOB validation utilities exist and are used in forms.
10. **localStorage persistence** — Centralized via `resourceStorage.js` with schema versioning, migration support, and item validation. Each entity has its own storage module (`userStorage.js`, `patientStorage.js`, `activityStorage.js`, `settingsStorage.js`).
11. **State management** — React Context + custom hooks pattern. Four providers (Users, Patients, Settings, Activities) wrapped in `AdminLayout`.

### What Is Incomplete / Hardcoded / Mocked

1. **All data is mocked** — `userService.jsx` has `MOCK_USERS` (10 users), `patientService.jsx` has `MOCK_PATIENTS` (8 patients). No real API call exists. After first load, data persists to localStorage, so subsequent loads use stored data.
2. **User `createdAt` is derived from ID** — `deriveUserCreatedAt(id)` in `userService.jsx` uses `Number(id) % 12` months back from a hardcoded `BASE_CREATED_AT` (`2026-09-15`). This is a mock artifact, not real data.
3. **Patient `createdAt` dates are hardcoded** in `MOCK_PATIENTS` — spanning 2020–2026. The Reports period filter may produce empty results for 6m/12m if the hardcoded dates fall outside the cutoff.
4. **No dedicated Activity page** — There is no `/activities` route. Activity is only shown as "Recent Activity" on the Dashboard. The `clearActivities()` function exists in ActivityProvider but is not wired to any UI.
5. **Settings changes do NOT record activity** — `SettingsProvider` has no `recordActivity` call. No activity is logged when settings are changed.
6. **EditUserForm has no validation** — Unlike AddUserForm/EditPatientForm, EditUserForm relies only on HTML `required` attribute, no custom validation logic.
7. **Report trend data may be sparse** — `groupByMonth` in `utils/reports.js` groups by `createdAt`. With mock data spanning many years, the 6m/12m filters could yield very few or zero months.

### Where State Lives

- **Users** — `UsersContext` / `UsersProvider` (state: `users`, `loading`, `error`, `addUser`, `updateUser`, `deleteUser`, `toggleFavorite`)
- **Patients** — `PatientsContext` / `PatientsProvider` (state: `patients`, `loading`, `error`, `addPatient`, `updatePatient`, `deletePatient`)
- **Settings** — `SettingsContext` / `SettingsProvider` (state: `settings`, `updateSettings`, `resetSettings`)
- **Activities** — `ActivityContext` / `ActivityProvider` (state: `activities`, `recordActivity`, `clearActivities`)
- **Page-level** — `useState` in each page component for search terms, filters, modal open/close, selected items

### Duplicated Data or Logic

- **Filter/search patterns** — Both `Users.jsx` and `Patients.jsx` have nearly identical filter logic (search term, status filter). Could be extracted but currently page-specific.
- **Modal patterns** — Both `Users.jsx` and `Patients.jsx` duplicate add/delete/edit modal logic.
- **PageHeader + PageActions pattern** — Identical usage in Users, Patients, Reports pages.
- **ID generation** — Both `UsersProvider` and `PatientsProvider` use the same `Math.max(...ids) + 1` pattern inline rather than a shared utility.
- **StatusBadge** — Single shared component, good.
- **StatCard** — Single shared component, good.

### Reusable vs Page-Specific Components

**Reusable (used across pages):**
- StatCard, StatusBadge, Modal, PageHeader, PageActions, TrendTable

**Page-specific:**
- UserTable, SelectedUser, AddUserForm, EditUserForm (Users page)
- PatientTable, SelectedPatient, AddPatientForm, EditPatientForm (Patients page)
- Sidebar, Header (layout components, used once)

### What Must Stay Untouched

- `src/context/` — All 8 context files
- `src/services/` — All 7 service/storage files
- `src/hooks/` — All 4 hook files
- `src/utils/` — All 3 utility files
- `src/constants/` — All 2 constant files
- `src/index.css` — Existing styling (no redesign in this phase)
- `src/App.jsx` — Routing structure
- `src/layouts/AdminLayout.jsx` — Provider nesting order
- `src/main.jsx` — Entry point
- `package.json` — Dependencies (no new packages)
- `vite.config.js`, `eslint.config.js`, `index.html`

---

## Phase Plan

### Phase 1: Shared Data Layer + Dashboard
- Verify localStorage persistence works end-to-end (load → mutate → reload)
- Confirm Dashboard statistics are truly derived (not stored copies)
- Confirm activity log records and displays correctly
- Ensure `deriveUserCreatedAt` doesn't break report period filters

### Phase 2: Users Hardening
- Add validation to EditUserForm matching AddUserForm pattern
- Consider shared ID generation utility
- Verify localStorage round-trip for users

### Phase 3: Patients
- Verify patient localStorage persistence
- Confirm PatientTable and SelectedPatient work correctly
- Verify patient `createdAt` dates work with Reports period filters

### Phase 4: Reports
- Verify `buildUserReport`/`buildPatientReport` produce correct data with mock data
- Test period filter edge cases (6m/12m with historical mock data)
- Confirm TrendTable renders correctly with filtered data

### Phase 5: Settings + Activity
- Add activity recording for Settings changes
- Consider adding a dedicated Activity page/route (or expand Dashboard activity section)
- Wire `clearActivities()` to UI

### Phase 6: Design Foundation
- Establish the locked design system as CSS custom properties in a dedicated `src/styles/tokens.css` (not inline in `index.css`, so Phase 7 has one place to change)
- Add base element styles (`base.css`) and app-shell styles (`shell.css`)
- Make the shell responsive: full sidebar ≥1200px, reduced sidebar 768–1199px, keyboard-accessible drawer <768px
- Convert the pre-existing component CSS to tokens only in Phase 7 — Phase 6 changes no page or component appearance
- **PrimeReact is NOT installed.** At the time of Phase 6 the decision was deferred ("token-only now, decide later"). **Superseded in Phase 7:** the owner permanently reversed the component-library option. See "Permanent library decision" below.

### Phase 7: Component/Page Redesign
- Apply locked visual redesign to all components
- Only after phases 1–6 are verified

---

## Progress Log

*This section will be appended to after each phase.*

### Phase 1 — Shared Data Layer + Dashboard Integration (2026-09-29)

**Outcome: no code changes were required. The phase was already implemented; this entry records verification.**

#### What was inspected
- `src/layouts/AdminLayout.jsx` — provider nesting (Activity → Settings → Users → Patients) around `<Outlet/>`
- `src/context/` — `UsersProvider`, `PatientsProvider`, `ActivityProvider`, `SettingsProvider` + their 4 context objects
- `src/hooks/` — `useUsers`, `usePatients`, `useActivities`, `useSettings`
- `src/services/` — `resourceStorage.js` (factory), `userStorage.js`, `patientStorage.js`, `activityStorage.js`, `settingsStorage.js`, `userService.jsx`, `patientService.jsx`
- `src/pages/Dashboard.jsx`, `src/pages/Users.jsx`, `src/App.jsx`
- `src/utils/reports.js`, `src/constants/statuses.js`, `src/constants/storage.js`

#### Finding: the phase's deliverables already exist
1. **Shared state** — React Context providers are already mounted around the routes in `AdminLayout.jsx:11-26`, each exposing a hook. This is the smallest setup that fits the existing routing/layout, so it was kept as-is.
2. **Stores** — users, patients, and activity all exist and are consumed via hooks. `recordActivity` is already called from user CRUD (`UsersProvider.jsx:60,74,86,103`) and patient CRUD (`PatientsProvider.jsx:58,75,86`).
3. **Persistence** — centralized in `resourceStorage.js` as a single `createStorage` factory with schema versioning, migrations, and per-entity validators. Providers hydrate on mount, seed from mock once when storage is empty, and persist on every mutation. Corrupt/missing storage is handled (JSON parse errors, bad envelopes, unknown versions, non-array data, invalid records).
4. **Dashboard** — all 8 stats are already derived from `useUsers()`/`usePatients()`. A repo-wide search for hardcoded metric literals returned **zero** matches; there is no separate data copy and nothing to replace. No stat had to be removed or flagged as underivable.
5. **UI** — untouched. No restyling.

#### Changes
**None.** No files were modified. Rebuilding any of the above would have violated the "do not rebuild" and "smallest change" rules.

#### Verification actually performed
- `npm run build` — passes, 138 modules transformed, no broken imports.
- `npm run lint` — passes, clean.
- **61 executable assertions** (Node harness in `/tmp/opencode/`, outside the repo, importing the real app modules via a resolve-only loader):
  - First load seeds from mock and persists; reload does **not** re-seed; edits and deletes survive reload.
  - Corrupt storage (7 cases: unparseable, wrong shape, bad version, non-array data, garbage arrays) all return `null` and remove the bad key, so the provider re-seeds cleanly instead of crashing.
  - Partially-corrupt patient records are discarded individually while valid ones survive.
  - Derived Dashboard math is consistent (`active + inactive === total` for users, `+ pending === total` for patients) and reacts correctly to simulated add/delete.
  - Activity: unique incrementing ids, newest-first ordering, cap of 100 enforced, persisted, and `slice(0,5)` yields the 5 newest.
  - Deleting every user does not resurrect the seed.
  - Reports: `all`/`12m`/`6m` filters all return non-empty, consistent results. Seeded user `createdAt` spans 2025-11-15 → 2026-08-15.

#### Not verified (no browser run)
No browser automation is installed and adding one would breach the "no new dependencies" rule, so the following were **not** runtime-tested: the rendered Dashboard, actual console output at runtime, and the live click-through of add/delete → instant count change. These are covered only by static reading of the wiring plus the logic-level assertions above. **A manual browser pass is still recommended.**

#### Flags / open items
1. **Activity API naming differs from the Phase 1 spec** (decision made: keep as-is). Spec was `logActivity(type, entity, description)` with entries `{id, type, entity, description, timestamp}`. Actual is `recordActivity({type, message, entityType, entityId})` with entries `{id, type, message, timestamp, entityType, entityId}`. Semantically equivalent, fully wired, and already persisted. Renaming would touch 5 files and invalidate existing stored entries for no functional gain.
2. **Seed user `createdAt` is a mock artifact** — `deriveUserCreatedAt` (`userService.jsx:6`) derives dates from the ID, so the 6m report filter only returns 5 of 10 seeded users. Real users added via `addUser` get a genuine `new Date()` timestamp and are unaffected. Not a bug; noting it so Reports results are not misread in Phase 4.
3. **Patient 6m/12m reports are sparse** — only 2 of 8 seeded patients fall inside those windows (hardcoded 2020–2026 `createdAt`). Consistent, not empty, but thin. Phase 4 item.
4. **"Recent additions" Dashboard stat was not added.** It was named in the Phase 1 brief as an example, but nothing was hardcoded for it, and adding a card is a UI change rather than replacing a fake number. Left for Phase 5/7.
5. **Settings changes still record no activity** — `SettingsProvider` does not call `recordActivity`. Already tracked as a Phase 5 item.
6. **`clearActivities()` still has no UI** — no `/activities` route exists. Already tracked as a Phase 5 item.

---

### Phase 2 — Users Persistence and Hardening (2026-09-29)

**Outcome: 8 defects found and fixed. 6 files changed (2 new, 4 modified), no restyling, no new dependencies.**

#### What was inspected
`src/pages/Users.jsx`, `src/components/{AddUserForm,EditUserForm,UserTable,SelectedUser,AddPatientForm}.jsx`, `src/context/UsersProvider.jsx`, `src/services/{userService.jsx,userStorage.js,activityStorage.js}`, `src/utils/validation.js`, `src/hooks/useUsers.jsx`, `src/pages/Dashboard.jsx`, `src/utils/reports.js`.

#### Preserved unchanged
Fetching, `loading`/`error` states, search, status filter, favorite filter, view/add/edit/delete, favorite toggling, and the delete confirmation modal all behave as before. Verified by diff review and by re-running the Phase 1 harness (37/37 still pass — no regression to persistence, seeding, corrupt-storage recovery, or Dashboard derivation).

#### Defects found and fixed

1. **`EditUserForm` had no custom validation** (known finding #6 from the inspection). It relied on native `required`/`type=email`, which blocked submit with no inline message and let whitespace-only values through. It now shares the same validator as `AddUserForm`, uses `noValidate` so inline messages actually appear, and is fully controlled.
2. **No duplicate-email handling anywhere in the app.** Added to the shared validator: case-insensitive and whitespace-insensitive, and it names the conflicting user. Editing a user to its own email is allowed via `excludeId`; editing user B to user A's email is rejected.
3. **ID generation was inlined in the providers and silently ignored non-numeric ids** (`Number(id) || 0`). Extracted to `src/utils/ids.js` with a collision guard: it now scans past any id already present rather than assuming `max + 1` is free.
4. **`deleteUser`/`toggleFavorite` wrote bogus activity entries for an id that did not exist** — `User "undefined" deleted`. That is a fake log line, which the hard rules forbid. Both now return early and log nothing.
5. **"No users found." conflated an empty list with no search results.** The two states are now distinct: `No users yet. Add your first user to get started.` vs `No users match the current search and filters.`
6. **Mutations read a stale `users` snapshot** (`commitUsers(users.map(...))`). All four mutations now use functional `setUsers` updates, so rapid repeated actions compose over the latest committed list instead of overwriting each other.
7. **Persistence writes were scattered** across the hydrate path and `commitUsers`. Replaced with one write path: a `useEffect` that persists whatever the store holds, gated on `isHydrated`. The gate is load-bearing — without it the initial `[]` state would overwrite stored data on mount.
8. **The filter predicate was an untestable inline closure inside the page component.** Moved to `src/utils/users.js` as `filterUsers`, following the existing `utils/reports.js` pattern, so combined-filter behaviour could actually be verified rather than asserted.

#### Files changed
- **New** `src/utils/ids.js` — `nextId` with collision guard.
- **New** `src/utils/users.js` — `validateUser`, `findDuplicateEmail`, `normalizeEmail`, `filterUsers`, filter constants.
- `src/context/UsersProvider.jsx` — functional updates, single gated persist path, shared `nextId`, guards on missing ids.
- `src/components/AddUserForm.jsx` — now calls the shared `validateUser` (duplicate checking added; local copy of the rules deleted).
- `src/components/EditUserForm.jsx` — validation, `noValidate`, inline errors, duplicate checking.
- `src/pages/Users.jsx` — uses `filterUsers`; distinct empty vs no-results messages.

`PatientsProvider` still has its own inline id logic. Adopting `nextId` there is a Phase 3 item, deliberately left out of scope.

#### Verification actually performed
- `npm run build` — passes, 140 modules, no broken imports. `npm run lint` — clean.
- **79 executable assertions** (Node harness in `/tmp/opencode/`, importing the real utils/services):
  - `nextId`: empty list, gaps, mixed string/number ids, and a property check across 13 id shapes that it never returns an id already taken.
  - `validateUser`: required fields, malformed email, missing TLD, whitespace trimming, exact/case-insensitive/whitespace-insensitive duplicate detection, `excludeId` self-edit, cross-user collision.
  - Persistence lifecycle: exactly one write on hydrate, and it is never an empty array; add/edit/delete/favorite each survive a simulated refresh; refresh does not re-seed.
  - Dashboard counts derived from the store move correctly on add, delete, and favorite.
  - Rapid actions: reproduces the old stale-closure bug (two toggles = no net change) and shows the functional updater fixes it; consecutive `nextId` calls stay unique.
  - Activity: created/updated/deleted/favorited entries all produced, every entry has `id`/`type`/`message`/`timestamp`, newest-first, cap 100, persisted, and `slice(0,5)` yields 5 renderable entries. Missing-id operations produce zero entries.
  - Edge cases: empty list does not resurrect the seed, adding into an empty list yields id 1, deleting the last user persists `[]` and stays empty on reload.
  - Filters: all 45 search x status x favorite combinations match the expected AND semantics, and no-results is provably distinct from an empty list.
- Phase 1 harness re-run as a regression check: 37/37 pass.

#### Not verified (still no browser run)
No browser automation is installed and adding one would breach the no-new-dependencies rule. The requested click-through — adding, editing, deleting, favoriting, each filter, a filter combination, refreshing between steps, and watching the Dashboard — was **not** performed in a browser. None of the rendered output, the inline error text, the modal, or runtime console behaviour was observed. Those are covered only by logic-level assertions plus diff review. **A manual browser pass is still required before this is called done.**

#### Flags / open items
1. **IDs are unique but not strictly stable.** Deleting the highest-numbered user frees that id for the next add. Guaranteeing non-reuse needs a persisted counter, i.e. a storage schema migration, which is larger than this phase warrants. Consequence: an old activity entry whose `entityId` matches a recycled id now refers to a different person. Log-only impact.
2. **Duplicate email is enforced in the form layer, not the store.** The forms are currently the only write path, so this is effective, but the store will accept a duplicate if something else calls `addUser` later. Moving the rule into the provider would require the provider to return a result object and the page to surface it — a larger change, deferred.
3. **No retry-on-error was added, deliberately.** The data source is local (mock array + localStorage): `getUsers()` is a pure mock that cannot reject, and `getStoredUsers()` swallows its own errors and returns `null`. The `error` state is therefore effectively unreachable, so a retry button would be dead UI. Flagged rather than built.
4. **Locally added users have no `phone` field** while seeded users do, because the form does not collect it. Pre-existing; adding a field is a feature change, not a fix, so it was left alone.
5. `handleEditUser` in `Users.jsx` declares a local `const editingUser` that shadows the state variable of the same name. Harmless, but confusing to read. Left alone as an unrelated cleanup.
6. Phase 1 flag 1 (activity API naming) remains open by prior decision.

---

### Phase 3 — Patients (2026-09-29)

**Outcome: Patients now runs on the same hardened shared data flow as Users. 6 defects fixed, 5 files changed plus 1 constants change, no restyling, no new dependencies.**

#### What was inspected
`src/pages/Patients.jsx`, `src/components/{PatientTable,SelectedPatient,AddPatientForm,EditPatientForm,Modal,StatusBadge}.jsx`, `src/context/PatientsProvider.jsx`, `src/services/{patientService.jsx,patientStorage.js}`, `src/utils/patients.js`, `src/utils/validation.js`, `src/pages/Dashboard.jsx`, plus the Phase 2 `src/utils/{ids,users}.js`.

#### Data model: followed the repo, invented nothing
The repo had already settled the model, so nothing was added or renamed. `patientStorage.js` ships a migration that **deletes** an `age` field and `isValidPatient` explicitly rejects any record where `age !== undefined` — the codebase had already decided that date of birth is the stored fact and age is derived. So the model stays `id, name, dateOfBirth, gender, phone, email, status, lastVisit, createdAt`, with age computed by `calculateAge`. Verified by assertion that the seed keys are exactly that set and that no `age` key is ever written.

**Status vocabulary deliberately not changed.** The brief suggested "active/discharged/pending". The repo uses Active/Inactive/Pending across `PATIENT_STATUS_OPTIONS`, `StatusBadge`, the Dashboard and `buildPatientReport`. Renaming Inactive → Discharged would ripple through all of them for a label change, so the existing three were kept and `Inactive` serves as the discharged equivalent. Flagged below rather than changed.

#### Defects found and fixed

1. **Validation was duplicated verbatim across `AddPatientForm` and `EditPatientForm`** — two ~35-line near-identical `validate()` bodies that had already drifted (`AddPatientForm` checked `status`, `EditPatientForm` did not). Extracted to `validatePatient` in `src/utils/patients.js`; both forms now call it. Net −60 lines of duplicated rules.
2. **No age sanity check.** The old rules rejected a future date of birth but accepted e.g. `1800-01-01`, implying a 226-year-old patient. `validatePatient` now bounds the derived age at `MAX_PATIENT_AGE` (120). The threshold is a chosen constant, exported so it is visible and testable.
3. **`deletePatient` wrote a fake activity entry for a missing id** (`Patient "undefined" deleted`) — same hard-rule-9 violation fixed for users in Phase 2. Now returns early and logs nothing.
4. **Mutations read a stale `patients` snapshot** (`commitPatients(patients.map(...))`). All mutations now use functional `setPatients` updates, so rapid repeated actions compose rather than overwrite.
5. **Persistence writes were scattered** across hydrate and `commitPatients`. Replaced with one write path, an effect gated on `isHydrated`. The gate is load-bearing: without it the initial `[]` would overwrite stored patients on mount.
6. **ID generation was inlined again** with the same `Number(id) || 0` weakness fixed for users in Phase 2. `PatientsProvider` now uses the shared `nextId` from `src/utils/ids.js`, closing the item Phase 2 deferred.
7. **"No patients found." conflated empty list with no search results.** Now `No patients yet. Add your first patient to get started.` vs `No patients match the current search and filters.`
8. **`filterPatients` extracted** from the page's inline closure into `utils/patients.js`, mirroring `filterUsers`, so combined search+status behaviour is verifiable.
9. **Filter constants were about to be duplicated.** `ALL_STATUSES` lived in `utils/users.js` and again in `Patients.jsx`; `FAVORITES_FILTER`/`NON_FAVORITES_FILTER` in `utils/users.js`. All three moved to `constants/statuses.js` alongside the existing status vocabulary, so there is one source of truth.

#### Reuse decisions
- `PatientTable`, `SelectedPatient`, `Modal`, `StatusBadge`, `PageHeader`, `PageActions` were reused as-is. **None were generalized.** Users and Patients differ in columns, fields, filter dimensions (patients have no favorite) and status vocabulary; a shared table or shared detail panel would need configurable props for almost every cell, which is a rewrite, not reuse.
- The genuinely identical logic was extracted and nothing more: the shared `nextId` utility, the shared filter constants, and the shared date/age helpers already in `utils/patients.js`. Validation is shared per-entity (`validateUser` / `validatePatient`) rather than forced into one generic rule engine, because the rule sets genuinely differ (favorite, no phone/DOB/gender for users).
- **A generic CRUD provider factory was deliberately not built.** It would be the "copy-paste-fork" the brief warns against, but the alternative is a large abstraction the hard rules rule out. The two providers are now consistent in shape and share their persistence and ID strategy, which is the smaller honest change.

#### Files changed
- `src/utils/patients.js` — added `validatePatient`, `filterPatients`, `MAX_PATIENT_AGE`.
- `src/context/PatientsProvider.jsx` — shared `nextId`, functional updates, gated persist, missing-id guard.
- `src/components/AddPatientForm.jsx` — deleted the local `validate`, now calls `validatePatient`.
- `src/components/EditPatientForm.jsx` — same.
- `src/pages/Patients.jsx` — `filterPatients`, distinct empty vs no-results, constants from `constants/statuses.js`.
- `src/constants/statuses.js` — gained `ALL_STATUSES`, `FAVORITES_FILTER`, `NON_FAVORITES_FILTER`.
- `src/pages/Users.jsx`, `src/utils/users.js` — import path updated only, no behaviour change.

#### Verification actually performed
- `npm run build` — passes, 140 modules. `npm run lint` — clean.
- **80 new executable assertions**: seed key set matches the repo's existing model and no `age` is ever written; all six required fields; DOB malformed / Feb-30 / future / age-at-cap / age-over-cap / newborn; phone and email formats; six simultaneous errors; search by name/email/phone, case-insensitivity, trimming, status filter, combined search+status, contradictory filters returning empty, empty-list handling; hydration writes exactly once and never an empty array; add/edit/delete each surviving a simulated refresh with no re-seed; Dashboard patient metrics moving on add and delete with active+inactive+pending === total; created/updated/deleted activity entries present, well formed, capped, persisted, and none for a missing id; empty list, delete-last-patient, and reload-of-empty all stable.
- **Regression across all prior phases: 220 assertions total, 0 failures** — Phase 1 (37), Phase 1 reports (24), Phase 2 (79), Phase 3 (80). The Phase 2 harness initially reported 2 failures after the constants move; that was a stale import in the harness, not an app defect, confirmed by fixing the import and re-running. Users logic is asserted unaffected in the Phase 3 harness section [11].

#### Not verified (still no browser run)
No browser automation is installed and adding one would breach the no-new-dependencies rule. The requested click-through — adding, editing, deleting, searching, filtering, refreshing between steps, watching Dashboard patient stats and the activity feed — was **not** performed in a browser. Nothing rendered was observed: not the patient table, the detail panel, the inline error text, the confirmation modal, nor runtime console output. **A manual browser pass is still required.**

#### Flags / open items
1. **`MAX_PATIENT_AGE = 120` is a chosen threshold**, not a requirement from the repo or the brief. It only rejects absurd dates. Change it if the domain needs a different bound.
2. **No duplicate-email rejection for patients, unlike users.** Deliberate. In a hospital admin context, family members and guardians routinely share a contact email, so rejecting duplicates would block legitimate records. The shared `findDuplicateEmail` helper is available if that judgement is later reversed.
3. **Status vocabulary is Active/Inactive/Pending, not Active/Discharged/Pending.** See above. If "Discharged" is required wording, it is a coordinated change across `constants/statuses.js`, `StatusBadge`, `Dashboard.jsx` and `utils/reports.js`.
4. **`lastVisit` is not editable.** `SelectedPatient` displays it and new patients get `lastVisit: ""` (rendered as "—"). It is never set to a real value anywhere in the app, so that field is currently always empty or a seed constant. Adding a last-visit date is a feature, out of scope here.
5. **ID reuse limitation carries over from Phase 2** — deleting the highest-numbered record frees that id. Same log-only impact, same deferred fix (persisted counter).
6. **Gender options (`Male`/`Female`/`Other`) are still hardcoded in both patient forms** rather than a shared constant. Three strings, not a logic duplication, so left alone — but the two forms can drift.
7. Phase 1 flag 1 (activity API naming) and Phase 2 flag 3 (no retry-on-error, source is local) both remain open by prior decision.

---

### Phase 3b — Patient status rename: Inactive → Discharged (2026-09-29)

**Outcome: approved Phase 3 flag 3 implemented. Vocabulary change plus a storage schema migration so no existing browser data is lost. No restyling, no new dependencies.**

#### Scope decision
**Patients only.** `STATUS_INACTIVE` was a single shared constant used by both entities, but the two mean different things: admin staff are not "discharged". So `STATUS_INACTIVE` was kept for users and a new `STATUS_DISCHARGED = "Discharged"` was introduced for patients. `USER_STATUS_OPTIONS` is unchanged; `PATIENT_STATUS_OPTIONS` is now `[Active, Discharged, Pending]`.

#### The data-loss trap (the reason this was not a one-line change)
`STORAGE_SCHEMA_VERSION` is **global**, and `resourceStorage.migrate()` returns `null` — causing the key to be dropped and the entity to re-seed from mock — if any step in the version chain is missing. So naively bumping the version would have **silently wiped every existing user's users, patients and activity log**. Handled by registering a step for every entity:
- `patientStorage.js` — step `1` rewrites `status: "Inactive"` → `"Discharged"` (it also already had step `0` stripping the legacy `age` field).
- `userStorage.js` and `activityStorage.js` — pass-through step `1` (`(items) => items`) so their data survives untouched.
- `settingsStorage.js` needed nothing: it does not use the migration chain, it only re-stamps the current version.

`STORAGE_SCHEMA_VERSION` bumped 1 → 2.

#### Other changes
- `patientService.jsx` — the two seeded `STATUS_INACTIVE` patients now use `STATUS_DISCHARGED`.
- `StatusBadge.jsx` — `Discharged` maps to the **existing** `status-inactive` CSS class. Deliberately reusing that class rather than adding a `status-discharged` rule, so the badge looks the same and no CSS was touched.
- `Dashboard.jsx` — card "Inactive Patients" → "Discharged Patients", description "No longer under care", filtering on `STATUS_DISCHARGED`.
- `utils/reports.js` — `buildPatientReport` returns `discharged` instead of `inactive`. `buildUserReport` keeps `inactive`.
- `Reports.jsx` — patient card and patient category dropdown use `Discharged`. The user category dropdown still offers `Inactive`.
- `Patients.jsx` and both patient forms needed no changes; they read `PATIENT_STATUS_OPTIONS` / the shared validator, so they picked the new vocabulary up automatically.

#### Files changed
`constants/statuses.js`, `constants/storage.js`, `services/{patientStorage,userStorage,activityStorage,patientService}`, `components/StatusBadge.jsx`, `pages/{Dashboard,Reports}.jsx`, `utils/reports.js`.

#### Verification actually performed
- `npm run build` — passes. `npm run lint` — clean.
- **45 dedicated assertions** for this change, including a hand-written **v1 localStorage fixture** reproducing what the previous release actually stored:
  - No data loss: users, patients and activities all read back, counts and identities preserved, activity order preserved. A deliberately `Inactive` user (id 99) survives by id, proving the user pass-through step works and users were **not** re-seeded.
  - Patients: no record left as `Inactive`; discharged count equals the old inactive count; active and pending untouched; every status is in the new option list; no `age` key.
  - Migrated data is written back at v2 for all three entities, and a second read is stable and does not re-migrate.
  - Legacy v0 bare-array storage still migrates all the way (age stripped **and** status renamed).
  - A future version (99) is still rejected rather than misread.
  - Fresh install uses the new vocabulary end to end and round-trips.
  - Vocabulary is patients-only: `USER_STATUS_OPTIONS` unchanged, user report keeps `inactive` and has no `discharged`.
  - `buildPatientReport` exposes `discharged` and no longer `inactive`, buckets sum to the total, the `Discharged` category filter works, the old `Inactive` category now correctly returns 0, and every `PATIENT_STATUS_OPTIONS` entry matches at least one patient (no orphan dropdown option).
- **Full suite re-run: 266 assertions, 0 failures** (37 + 24 + 79 + 81 + 45).
- Harness honesty note: this run surfaced **4 real failures** in the Phase 1 harnesses and **1** in the new harness, all caused by stale `Inactive` assertions. They were stale expectations, not app defects — confirmed by tracing each to the renamed bucket and re-running. The new harness additionally had a genuine flaw on its first run: it built its "pre-rename" fixture from the *current* seed, so it was silently testing new-vocabulary data. The fixture was corrected to rewind statuses explicitly, which is what made the migration assertions meaningful.

#### Not verified (still no browser run)
No migration was exercised in a real browser. The migration is verified against a simulated v1 `localStorage` payload, not against a live tab that had accumulated real usage. The rendered badge, Dashboard card, Reports card and status dropdowns were not observed, and no console output was checked. **A manual browser pass on an existing profile with data is still required** — it is the only way to confirm the real upgrade path.

#### Flags
1. **The badge for `Discharged` reuses the `status-inactive` CSS class.** Visually identical to before by design, so no restyling occurred. If Phase 7 wants a distinct colour for discharged patients, that belongs in the design phase.
2. **`STATUS_INACTIVE` still exists** and is still the user status. Two similar-looking constants now coexist (`STATUS_INACTIVE`, `STATUS_DISCHARGED`) and they mean different things for different entities. Deliberate, but worth remembering before anyone "tidies" it.
3. **Patient reports changed key name** from `inactive` to `discharged`. Only `Reports.jsx` consumes it and it was updated, so nothing is broken — but any future code reading `patientReport.inactive` will get `undefined`.
4. All Phase 1/2/3 flags remain open as previously recorded.

---

### Phase 4 — Reports from real data (2026-09-29)

**Outcome: the Reports page was already fully derived. No mocked values existed. The phase added genuinely computable breakdowns, moved the calculations out of JSX into a hook, and added render-level verification. No restyling, no new dependencies.**

#### Audit (requirement 1) — the headline finding: there was nothing mocked
Every number, the trend tables, and the stat cards already read from the shared `UsersProvider`/`PatientsProvider` state via `buildUserReport`/`buildPatientReport`. There were no hardcoded figures, no placeholder trends, and no invented rows. Verified by assertion rather than by reading alone: the report total equals `users.length`/`patients.length`, changing the input changes the output, and the `createdOverTime` rows sum exactly to the real totals. So **no metric had to be removed** for being unfakeable.

#### Calculations moved out of JSX (requirement 2)
`Reports.jsx` previously built two arrays of stat-card objects inline, and called the report builders directly. Now a new **`src/hooks/useReportData.jsx`** owns the loading/error/empty flags, the two report builds, and the stat-card definitions. JSX only renders. All arithmetic lives in pure functions in `src/utils/reports.js`.

#### New metrics, all honestly derivable (requirement 3)
Added to the existing user/patient status counts, patient gender, and patient age groups:
- `statusBreakdown` — per status, count + share + bar. Replaces nothing; the stat cards remain.
- `genderBreakdown` — from the stored `gender` field.
- `ageGroupBreakdown` — **derived from `dateOfBirth`**, never stored. Buckets `0-17 / 18-34 / 35-44 / 45-64 / 65+`.

Three honesty properties were designed in deliberately, because a breakdown that silently loses records is worse than no breakdown:
1. **Every breakdown sums to the report's own `total`**, so the numbers can be checked against a manual count by adding up a column.
2. **Status breakdowns always list every status option**, including zero rows, so a reader can see `Discharged 0` instead of wondering whether it is missing.
3. **Gender and age add an `Unknown` row** when a record cannot be placed (gender not in the option list, or `dateOfBirth` unparseable/absent). This covers hand-edited `localStorage`. Buckets are tested to be contiguous and cover `0..Infinity` with no gaps or overlaps, and the exact boundary ages (17/18, 34/35, 64/65) are asserted individually.

#### No chart library (requirement 4)
`package.json` has no charting dependency and none is vendored. The brief said to use tables/CSS bars and to ask before proposing a library, so **I did not add one and am not proposing one**: for 3–6 rows a table plus a CSS bar is sufficient and a chart library would be a large dependency for no gain here. `BreakdownTable` renders a table reusing the existing `.user-table` class, plus a bar built from two **newly added** CSS classes. The `index.css` diff is **purely additive — 17 added lines, 0 removed, 0 existing rules touched**, verified with `git diff`. Nothing was restyled.

#### Empty data (requirement 5)
`toSharePercent` and `toBarPercent` are guarded against zero, negative, and non-finite totals and return `0` rather than `NaN`. With an empty dataset all counts are `0`, all shares are `0%`, all bars are `0%`, and the trend tables return `[]` and render their existing "No registrations for the selected filters." message. The new `BreakdownTable` renders "No data yet." for zero rows. This is covered both by data assertions and by rendering the components and grepping the resulting HTML for `NaN`/`undefined`/`null`.

#### Reactivity and refresh (requirement 7)
Reports still derive from the same context state the pages mutate, so updates are immediate. Verified by driving the real storage layer through add/delete cycles and rebuilding the report after each mutation, then by writing to `localStorage`, discarding the in-memory arrays, re-reading from storage, and confirming identical totals, breakdowns, and shares.

#### Shared gender options
`GENDER_OPTIONS` was extracted to `src/constants/genders.js` and is now used by both patient forms and the gender breakdown. This closes the Phase 3 flag about duplicated gender literals drifting from the dropdown, and gives the breakdown a stable key list.

#### Files changed
`utils/reports.js`, `hooks/useReportData.jsx` (new), `components/BreakdownTable.jsx` (new), `constants/genders.js` (new), `pages/Reports.jsx`, `components/{Add,Edit}PatientForm.jsx`, `index.css` (additive only).

#### Verification actually performed
- `npm run build` — passes. `npm run lint` — clean.
- **100 data assertions**, comparing every report number against an **independent manual count** written separately from the report code, across: an empty dataset, a 5-patient small dataset, boundary ages, off-list/missing gender, unparseable dates, real add/delete cycles through the real store, a simulated refresh via `localStorage`, and both the period and category filters.
- **Dashboard ↔ Reports agreement asserted** at all three points: the small dataset, after add/delete cycles, and for users as well as patients. `Dashboard.jsx` filters inline, so its logic was mirrored verbatim in the harness and compared field by field. They agree because both read the same state.
- **23 render assertions** using `react-dom/server` driven through Vite's SSR pipeline (both already installed; **nothing added to `package.json`**). These check the real DOM output: correct counts in the right cells, a share percent and an inline bar width, zero-count rows, the "No data yet." and existing trend empty states, and the absence of `NaN`, `undefined`, and `null` anywhere in the markup. The `Reports` page was also mounted under the **same four-provider nesting as `AdminLayout.jsx`** to prove the hook wiring does not throw.
- **Full suite: 389 assertions, 0 failures** (37 + 24 + 79 + 81 + 45 + 100 + 23).
- Two harness bugs were found and fixed honestly, both mine:
  - The refresh test initially failed with `getStoredPatients() === null`. Cause was **not** a report bug: my synthetic patients were missing `phone`, `email`, and `lastVisit`, so `patientStorage`'s `isValidPatient` discarded them and nothing was written. This incidentally confirmed storage-level validation is working. Fixtures were completed.
  - An assertion that an unknown category returns the unfiltered set was **my wrong expectation**. The real, pre-existing Phase 1 behaviour is that an unknown category filters literally to `0`. The assertion was corrected, and the invariant that actually matters — breakdowns still summing to that `0` with no `NaN` — is now asserted instead.

#### Not verified
1. **The page was never rendered after data loads.** `renderToStaticMarkup` does not run `useEffect`, so the providers never hydrate and the page render stops at "Loading reports...". The data-bearing branches were verified by rendering the components directly with real report output, and the page tree was verified to mount with the correct provider nesting — but the post-hydration DOM of the page itself is unconfirmed. No `jsdom`/`happy-dom` is installed and adding one is not permitted.
2. **No interactivity was tested.** Changing the period or category dropdown, and reports updating live in the browser after an add or delete, are unverified — SSR has no events and no effects. The data path behind them is verified; the event wiring is not.
3. **No visual check.** Bar widths, column alignment, and how the new tables sit next to the existing ones were never seen. A browser pass is required.

#### Flags
1. **An unknown category still filters to 0** rather than being ignored (pre-existing Phase 1 behaviour, deliberately not changed here). A typo'd category therefore shows a full set of zeros rather than everything. Defensible, but surprising.
2. **`patientReport` and `userReport` gained three and one new keys respectively.** `statusBreakdown` is on both; `genderBreakdown` and `ageGroupBreakdown` are on the patient report only. Purely additive, so no consumer breaks.
3. **Age groups are a judgement call.** `0-17 / 18-34 / 35-44 / 45-64 / 65+` is a conventional banding, not something the project or the description specified. It is defined in one place (`AGE_GROUPS`) and exported so it is easy to change. Worth confirming it is the banding expected.
4. **Age groups are computed against "now"**, so a patient's group changes on their birthday without any edit. That is correct behaviour, but it means report figures are not reproducible across time.
5. **The bar is relative to the largest row in that table**, not to the total. With a 1-of-100 split the bar still looks full-width, which reads well but must not be mistaken for a percentage. The `Share` column is the one to trust; the bar is decorative.
6. The `useReportData` hook itself has no direct unit test — there is no React test renderer installed. Every calculation it composes is tested; the hook is a thin pass-through.
7. All Phase 1/2/3/3b flags remain open as previously recorded.

---

### Phase 5 — Settings, Activity UI, unified integration (2026-09-29)

**Outcome: the gap was not missing features, it was missing wiring. Settings had no reset-data action and logged nothing; `clearActivities()` had no UI; there was no full activity list. All four gaps closed. No restyling, no new dependencies.**

#### Inspection (requirement 1) — what already existed
Settings already had profile (name/email/role), notification toggles, an appearance selector, defaults merging and "Reset to Defaults", all persisted via `settingsStorage`. Activity logging already existed for **7** call sites: user create/edit/delete/favorite, patient create/edit/delete. The history was already newest-first and already capped at 100. So the honest summary is that most of the machinery was present and unwired.

The four real gaps:
1. **No reset-data action** — required by this phase, and the only genuinely new feature.
2. **`clearActivities()` had no UI** — the function existed, nothing called it.
3. **No full activity list** — only the Dashboard's last-5 list existed.
4. **Settings logged nothing** — `SettingsProvider` never called `recordActivity`.

#### Settings changes
- **Settings changes now log activity**, but only when something *actually* changed. `diffSettings` (new, pure, in `utils/settings.js`) compares the merged result against the previous settings and reports the changed `section.field` paths. Saving an unmodified form produces **no** entry — asserted, because a log that fills with noise on every Save is worse than no log.
- The diff and the `recordActivity` call are deliberately made **outside** the `setSettings` updater. Calling a sibling provider's `setState` inside an updater would be a side effect in a reducer and would double-log under React StrictMode.
- **"Reset demo data" added**, behind a `Modal` confirmation that states exactly how many user and patient records will be replaced. It calls `resetUsers()` and `resetPatients()` (new methods on the two providers, which re-seed from the existing mock services and persist through the providers' existing effects) and `clearActivities()`. **Settings are deliberately left untouched** and the UI says so, because preferences are not demo data. No authentication anywhere.
- **Deliberate design decision:** the reset clears the activity log and *then* records the reset itself, so the log ends up holding exactly one honest entry instead of being silently empty. Otherwise there is no trace that a destructive action happened. Asserted.

#### Activity UI (requirement 2)
- **New `pages/Activity.jsx`** at `/activity`, reachable from a new Sidebar link. Routing supported this with two one-line additions (`App.jsx` route + `Sidebar.jsx` link) — no heavy changes. Columns: **Type, Description, When**, newest first, plus a clear-log button behind its own confirmation modal.
- **Newest-first is enforced, not assumed.** `appendActivity` already prepends, but stored data could be out of order, so `sortActivitiesNewestFirst` (new, pure) sorts by timestamp and is a no-op on the normal path. Entries with an unparseable timestamp sort last rather than scrambling the list, and ties keep their original order.
- **`formatActivityTimestamp`** (new, shared) replaced the two inline `new Date(...).toLocaleString()` calls. It returns a readable **"Unknown time"** instead of ever rendering **"Invalid Date"** for corrupt or missing timestamps.
- **Dashboard panel** limit raised 5 → 8, switched to the shared formatter, and given a "View all activity" link. **The panel was also moved out of the `isEmpty` branch** — it was previously nested inside it, so it was unreachable whenever there were no users/patients and its own "No recent activity." empty state could essentially never be seen. The stats area keeps its own empty state.
- **History cap centralised.** The magic `100` moved from a local constant in `ActivityProvider` to `MAX_STORED_ACTIVITIES` in `constants/storage.js`, consistent with how persistence config was centralised in earlier phases. 100 is within the 100–200 range requested. Verified: 150 appends cap at 100, the newest survives, ids stay unique, and 650 further appends do not grow the store.

#### Logging coverage (requirement 3)
All eight required operations are asserted present in source with the correct `type` and `entityType`: user create/edit/delete, patient create/edit/delete, settings change, settings reset. No seeded or fake entries exist on any page — asserted against the Activity page, Dashboard, and both providers.

#### Integration (requirement 4)
Full chain driven through the real storage services, the real report builders, and `Dashboard.jsx`'s inline filters mirrored verbatim: create → persisted → Dashboard count → Reports count → activity entry, for users and patients, for create, edit and delete. Checked at every step: the entry is newest-first, names the record, carries the right `entityId`, has a parseable timestamp, renders a readable one, and is itself persisted. Dashboard and Reports agreed at every point. **Refresh was verified by re-reading all three stores from `localStorage` after every single operation**, not just at the end.

#### Files changed
`pages/Settings.jsx`, `pages/Dashboard.jsx`, `pages/Activity.jsx` (new), `context/SettingsProvider.jsx`, `context/UsersProvider.jsx`, `context/PatientsProvider.jsx`, `context/ActivityProvider.jsx`, `utils/activity.js` (new), `utils/settings.js` (new), `constants/storage.js`, `App.jsx`, `components/Sidebar.jsx`.

#### Cleanup (requirement 5)
- Removed the unused `IN_PERIOD_DESCRIPTION` export left over from Phase 4 and the unused `SETTINGS_SECTIONS` export added in this phase.
- Swept `src/` for exported symbols that nothing imports and for component/page files nothing imports: only `App.jsx` and `main.jsx` are unimported, and both are entry points, so they are not dead.
- No `console.log`/`debug`/`info`/`debugger`/`TODO`/`FIXME` anywhere in `src/`. The single remaining `console.warn` in `resourceStorage` is deliberate and reports discarded items.
- No temporary or debug files in the repo; the render harnesses run from `/tmp` and delete their temporary copies.

#### Verification actually performed
- `npm run build` — passes. `npm run lint` — clean.
- **125 data assertions** covering: readable timestamps including five invalid inputs; newest-first ordering including ties, invalid timestamps and non-mutation; the storage cap under 650 appends; activity storage round-trip and rejection of malformed entries; `diffSettings` precision across single, multiple, boolean, cleared and null inputs, plus non-mutation; settings persistence including v0 envelopes and future-version rejection; logging coverage for all eight operations; no-op saves logging nothing; both full integration chains; refresh at every step; and reset-demo-data consistency including idempotency and post-reset Dashboard/Reports agreement.
- **36 render assertions** on the real DOM output. Notably, the providers' lazy `useState` initialisers **do** run under SSR, so pre-seeding `localStorage` produced genuinely **populated** renders: the Activity table with correct columns, capitalised types, correct newest-first row order, HTML-escaped quotes, a link back, the empty state with a disabled clear button, and correct handling of a corrupt timestamp and an empty type — all with no `NaN` and no "Invalid Date" anywhere.
- **Full suite: 550 assertions, 0 failures** (37 + 24 + 79 + 81 + 45 + 100 + 125 + 23 + 36).
- Two harness bugs, both mine, both fixed honestly:
  - The refresh test initially reported 4 failures. Cause was **my test**, not the app: I captured the expected counts at each step but re-read storage *after all three operations*, so only the final step could ever agree — and it passed by coincidence. Rewritten to assert inline immediately after each operation.
  - A message assertion failed because HTML escapes `"` as `&quot;`. My assertion was wrong, not the rendering; it now checks both the plain names and the escaped form.
- **Note on browser verification:** the user has confirmed the app works in a real browser, including the phase 1–4 items I had flagged as unverified. That is recorded as user-confirmed, distinct from the checks I ran myself.

#### Not verified
1. **The Dashboard activity panel was never rendered past the loading state.** The providers clear `loading` inside an effect, which does not run under SSR, so the Dashboard render stops at "Loading statistics...". Its structure is asserted from source instead (the panel is confirmed to sit *outside* the `isEmpty` branch, has its own empty state, uses the shared formatter, and is limited to 8), but the populated markup was not rendered. This is a harness limit, not an app failure — and the user has since reported the Dashboard working in a browser.
2. **Provider event handlers were not executed.** There is no DOM here, so `addUser`, `updateSettings`, `handleConfirmResetDemoData` and friends were never actually invoked. The integration chain was driven by a **faithful mirror** of the provider logic calling the same real services and utilities, plus static source assertions for the logging wiring. This is the weakest part of the verification and is called out as such.
3. **No interactivity tested** — the modal confirm/cancel paths, the clear-log button, the route transition to `/activity`, and the Sidebar link were never clicked. SSR has no events.
4. **The Settings page's form does not resync** if `settings` changes outside this page (the form state is initialised once). Pre-existing behaviour, unchanged, and harmless today because the only other writer is this page's own reset handler. Left alone as out of scope.

#### Flags
1. **Reset demo data restores the mock seed, so `createdAt` reverts to the mock values.** After a reset, report period filters operate on the hardcoded mock dates again rather than on the dates of records the user actually created. This is a direct consequence of "restore the original sample data" and is the honest behaviour, but it means a reset discards real history from the reports.
2. **Settings activity entries use `entityId: 0`.** There is no settings row to point at, so `0` is a placeholder. `isValidActivity` requires a number or string, so this is required, not chosen. A future activity page that links entities by id will have nothing to link for settings.
3. **A settings change logs one entry naming every changed field.** Saving a form that changed five fields produces one message listing five paths. Deliberate — one user action, one entry — but the message can get long.
4. **`MAX_STORED_ACTIVITIES` is 100.** Older entries are silently dropped, so the Activity page can never show more than 100. That is the intended bound, but "silently" is doing work in that sentence.
5. **The Activity page has no filtering, search, or pagination** — it renders all stored entries (max 100) in one table. Grouping by day or filtering by entity type would be the natural next step, and both are honestly derivable from the stored fields.
6. **Two separate destructive actions now exist** (clear activity log, reset demo data) with two separate confirmations, and neither is undoable. The modals state the counts, which is good, but there is still no recovery path.
7. All Phase 1/2/3/3b/4 flags remain open as previously recorded. The age bands and the unknown-category behaviour from Phase 4 were reviewed and **kept as-is at the user's direction**.

### Phase 6 — Design Foundation (2026-09-29)

**Outcome: the locked design system is now the single source of truth as CSS custom properties, the app shell is responsive and keyboard-accessible, and no page or component changed appearance. PrimeReact was deliberately not installed.**

#### Files added
| File | Purpose |
| --- | --- |
| `src/styles/tokens.css` | The locked design system. All colours, typography, radii, borders, shadows, spacing, shell dimensions, z-index and motion tokens. |
| `src/styles/base.css` | Element defaults: type scale, the global `:focus-visible` ring, `prefers-reduced-motion`, scrollbars. |
| `src/styles/shell.css` | App shell grid, sidebar, header, nav, responsive drawer, scrim. |
| `src/hooks/useFocusTrap.js` | Focus trap + Esc + focus restoration for the drawer. |

#### Files changed
- `src/index.css` — now opens with three `@import` lines and keeps **all** pre-existing component CSS below them, byte-for-byte unchanged. No component selector was rewritten.
- `index.html` — added `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`, then a single `display=swap` stylesheet for Inter (400/500/600/700) and Poppins (500/600/700).
- `src/layouts/AdminLayout.jsx` — owns drawer state, holds the sidebar ref, wires the focus trap, renders the scrim. **Provider nesting and route structure are unchanged.**
- `src/components/Header.jsx` — menu button with `aria-expanded` / `aria-controls` / dynamic label; the title is now a deliberately small, de-emphasised `h1`.
- `src/components/Sidebar.jsx` — `forwardRef`, `id="app-sidebar"`, `tabIndex={-1}`, labelled `nav` landmark, close-on-navigate. All six routes and `end`-matching on `/` preserved.

#### Verified
- **Contrast was computed, not asserted.** A harness implements the WCAG relative-luminance formula and evaluates every documented pairing from the real hex values. Result: text-primary 19.22:1, text-secondary 7.77:1, text-muted 5.32:1, accent 5.27:1, accent-on-subtle 4.74:1, success 5.25:1, warning 5.93:1, error 6.54:1, inverse-on-accent 5.27:1. All clear 4.5:1.
- **Responsive verified by evaluating the real cascade** at 1440 / 1000 / 390. 1440 → `240px 1fr` sidebar, 64px header, 32px padding, no menu button, no scrim. 1000 → 200px sidebar, 24px padding, still no drawer. 390 → single column, sidebar `position: fixed` 240px/84vw, off-canvas at `translateX(-100%)`, menu button visible, scrim active. Breakpoint boundaries confirmed exact: 1199/1200 and 767/768.
- Build output inspected: the token block, the drawer breakpoint and the `display=swap` font link are all present in `dist/`.
- **No functionality regression.** All 550 prior assertions still pass unchanged (37 + 24 + 79 + 81 + 45 + 100 + 125 + 23 + 36), plus 150 new Phase 6 assertions (117 spec + 33 responsive). `npm run lint` and `npm run build` clean.

#### One real defect found and fixed during verification
The original `--color-border-control: #8a93a0` reached only **2.92:1** against `--color-surface-muted` (`#f7f8fa`), below the 3:1 that WCAG 1.4.11 requires for the boundaries of interactive controls. Darkened to **`#828b98`**, which measures 3.45:1 on white and 3.24:1 on the muted surface. The lighter `--color-border-strong` is retained for decorative dividers, where 1.4.11 does not apply.

#### Flags
1. **The drawer is not a real `<dialog>` and does not use `inert`.** It is an overlay `<nav>` with a focus trap. This is functional and keyboard-complete, but a closed drawer relies on `visibility: hidden` to leave the tab order. Using `inert` or the native `<dialog>` element would be more robust.
2. **`useIsCompactViewport()` reads `matchMedia` once at mount and never re-reads it.** Rotating a phone, or resizing a desktop window from 1200px to 700px, will not update the breakpoint state used for the scrim. The **CSS** is correct at every width (verified above); only the scrim's mount condition is stale. A `matchMedia` change listener would fix it.
3. **The focus trap moves focus to the first focusable element, which is the first nav link — not the drawer itself.** A screen reader therefore announces a link rather than the navigation landmark on open.
4. **The `isCompact` prop gates the scrim but not the trap.** If the drawer were ever opened programmatically on desktop, the trap would engage on a permanently visible sidebar. Only the hidden menu button prevents this today.
5. **The body is not scroll-locked while the drawer is open.** Background scrolling on touch devices is possible behind the overlay.
6. **Poppins and Inter are loaded from Google Fonts, so rendering depends on a third-party network call.** `display=swap` and `preconnect` mitigate this, and the fallback stack ends in `system-ui`, but the app is not fully self-contained offline.
7. **Legacy component CSS in `index.css` still hardcodes colours, radii and spacing** (and carries its own 1000px/600px breakpoints). It was intentionally left untouched so that Phase 6 changes no appearance. **Phase 7 must convert it**, or the token system will be only half-adopted.
8. **Theme support is not implemented.** The appearance selector in Settings still has no effect on these tokens; there is no `[data-theme]` hook yet.
9. ~~**PrimeReact remains undecided.**~~ **RESOLVED in Phase 7:** the owner permanently reversed this. No component library will be installed. See "Permanent library decision". The `tokens.css` mapping table referenced here was removed, because a mapping table for a library that will never be adopted is dead configuration.
10. All Phase 1/2/3/3b/4/5 flags remain open as previously recorded.

---

## Contradictions with Description

1. ~~**"Activity log" as a feature** — The description implies an Activity log as a notable feature, but there is no dedicated Activity page. Activity is only shown in the Dashboard's "Recent Activity" section (last 5 items). The `clearActivities()` function exists but has no UI.~~ **RESOLVED in Phase 5**: a dedicated `/activity` page now exists with a full table, and `clearActivities()` has UI. The original finding was correct at the time of the initial inspection.
2. **"PrimeReact/Animate UI"** — Neither is installed and neither is referenced anywhere. The project uses plain CSS classes. No animation library exists. **Phase 7 made this permanent at the owner's direction** — see "Permanent library decision" below.
3. **"real API vs mock"** — All data is mocked from arrays in `userService.jsx` and `patientService.jsx`. There is no API layer. After first load, localStorage serves as the data source.
4. **"shared Users/Patients data"** — Users and Patients are in completely separate contexts with no shared data layer between them. They are distinct entities, which is architecturally correct but could benefit from shared utilities (e.g., ID generation).

## Genuine Uncertainties

1. **Report period filter effectiveness** — With mock user `createdAt` derived from ID modulo 12 and mock patient `createdAt` spanning 2020–2026, the 6m and 12m period filters may produce empty or near-empty results. This needs verification.
2. **Activity page necessity** — Whether to add a dedicated `/activities` route depends on the project requirements. The infrastructure (`ActivityContext`, `activityStorage`, `clearActivities`) is already in place.
3. **Settings activity tracking** — Whether settings changes should generate activity entries is a design decision that hasn't been made explicit in the current codebase.

---

## Permanent library decision

**Decided by the owner during Phase 7. This is permanent and supersedes all earlier "decide later" language.**

The component-library option (PrimeReact) is **reversed and closed**. It will not be installed, configured, imported, aliased or referenced anywhere in the application. The app keeps its hand-built, token-driven component set. The reason the earlier mapping table in `tokens.css` was deleted rather than kept "for later" is that a bridge to a library that will never be adopted is dead configuration, which is exactly the kind of drift the token system exists to prevent.

No part of the UI depends on a third-party **component** package. `package.json` runtime dependencies are `react`, `react-dom`, `react-router`, plus one documented exception: `@fortawesome/fontawesome-free`, an icon **font**, added at the owner's direction during the Cure.Med visual redesign to replace hand-drawn and text glyphs in the navigation. No Font Awesome React component package, no `fontawesome-svg-core`, and no animation library is installed. See "Cure.Med visual redesign" below.

---

## Phase 7 — Component and page redesign (2026-09-29)

**Outcome: the token system is now the only source of visual values. Every shared component and every page except the shell has been rebuilt on it, the viewport subscription is live, and the whole surface is keyboard- and screen-reader-complete. All 921 assertions pass, and `npm run lint` / `npm run build` are clean.**

### What was inspected first

- The Phase 6 result (tokens, base, shell, focus trap) and the seven open Phase 6 flags.
- Every component and page for hardcoded appearance values, placeholder-only forms, unlabelled controls, non-semantic tables, missing dialog semantics and colour-only status.
- `index.css` was found to still hold the entire legacy component stylesheet (Phase 6 flag 7), which had to be converted for the token system to be more than half-adopted.

### Files added

| File | Purpose |
| --- | --- |
| `src/styles/components.css` | The converted component system: buttons, fields, cards, tables, badges, modal, empty state, pagination, loading, page transition. Every value is a token or a `calc()` over tokens. |
| `src/components/Button.jsx` | The only button. `primary` / `secondary` / `danger` / `ghost`, two sizes. |
| `src/components/Field.jsx` | Label + control + hint/error wiring. Emits a real `<label for>`, and passes `id`, `aria-invalid` and `aria-describedby` to its child. |
| `src/components/Icon.jsx` | The single 16px icon set (11 glyphs), 1.5px stroke, always `aria-hidden`. |
| `src/components/Modal.jsx` | Accessible dialog: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, focus trap, Esc + backdrop close, scroll lock. |
| `src/components/Table.jsx` | Labelled, focusable scroll region; `SortableTh` with `aria-sort` and a real button. |
| `src/components/Pagination.jsx` | Labelled `nav`, live range announcement, optional page-size select. |
| `src/components/EmptyState.jsx` | Subdued status glyph + title + message + optional action. |
| `src/components/Avatar.jsx` | Monochrome initials tile. |
| `src/hooks/useMediaQuery.js` | Live breakpoint subscription via `useSyncExternalStore`. |
| `src/hooks/usePagination.js` | In-memory pagination with clamping. |
| `src/hooks/useTableSort.js` | Generic stable column sorting. |
| `src/hooks/useScrollLock.js` | Background scroll lock with scrollbar-width compensation. |

### Files changed

- `src/index.css` — now contains **imports only**. The entire legacy component stylesheet was moved into `components.css` and converted; no selector was left behind.
- `src/styles/tokens.css` — added status tokens (`--color-status-{active,discharged,pending,inactive}` and their `-bg` pairs), component geometry (`--icon-size-sm`, `--icon-stroke-width`, `--focus-ring-{width,offset,offset-inset}`, `--checkbox-size`, `--status-dot-{size,size-sm}`, `--notice-accent-width`, `--measure-text`, `--bar-{height,width-min,width-max}`, `--modal-width-max-viewport`, `--space-section-gap`) and the one translucent value (`--color-backdrop`). **Removed 6 tokens that had no consumer anywhere** (`--font-mono`, `--radius-small`, `--border-width-strong`, `--shadow-popover`, `--space-16`, `--z-dropdown`) plus `--space-12`, which became orphaned when `.section` moved to `--space-section-gap`. The `PrimeReact` mapping table was deleted.
- `src/layouts/AdminLayout.jsx` — the drawer is now **derived** (`isDrawerOpen = isDrawerRequestedOpen && isCompact`) instead of being reset inside an effect. This removes a cascading render and means widening past the breakpoint closes the drawer implicitly. The page wrapper is keyed on `location.pathname` so exactly one enter transition runs per route.
- `src/components/Header.jsx` — the CSS-drawn hamburger was replaced with the shared `Icon` set, so there is no longer a hand-rolled glyph outside the icon language.
- `src/components/StatusBadge.jsx` — state classes are now BEM modifiers (`status-badge--active`), so a generic `.status-active` can no longer leak onto other elements.
- `src/components/UserTable.jsx`, `PatientTable.jsx`, `TrendTable.jsx`, `BreakdownTable.jsx` — semantic tables: `<caption>`, `scope="col"`, labelled scroll regions, stacked mobile layout, sortable headers where it helps, and real button labels for row actions.
- `src/components/AddUserForm.jsx`, `EditUserForm.jsx`, `AddPatientForm.jsx`, `EditPatientForm.jsx` — every control goes through `Field`; no placeholder-only inputs remain.
- `src/components/PageHeader.jsx`, `PageActions.jsx`, `StatCard.jsx`, `SelectedUser.jsx`, `SelectedPatient.jsx` — rebuilt on tokens.
- `src/pages/Dashboard.jsx`, `Users.jsx`, `Patients.jsx`, `Reports.jsx`, `Activity.jsx`, `Settings.jsx` — all six pages restyled. **Dashboard now uses the shared `PageHeader`** instead of hand-rolling the markup. **Settings was the last page converted** and is the only page that was still on the old markup when this phase began.
- `src/hooks/useFocusTrap.js` — now takes a `focusTarget` so a dialog can focus the container itself (announcing its title) while the drawer still focuses its first link.

### Verified (921 assertions, 0 failures; lint and build clean)

- **Tokenisation is exhaustive and proven, not asserted.** The harness re-parses every CSS file and checks there is no hex/`rgb()`/`hsl()` literal and no raw spacing/geometry literal outside `tokens.css`. It then resolves **every** `var(--token)` back to a declaration — a typo'd token renders as *nothing*, which a "does it look tokenised" grep would miss — and confirms there are **no unused tokens**. It also confirms `index.css` is imports-only and in dependency order.
- **Contrast is computed** from the real token values for 30 text and non-text pairs, including all four status badges and the focus ring. The status hues are additionally checked to differ **in luminance**, so they stay distinguishable in greyscale and for colour-blind readers.
- **Locked geometry** is asserted from the tokens: 1px borders, 8/12/16px radii, 40px controls, no card shadow, and every spacing step on the 4px grid.
- **Accessibility** is checked on rendered markup and source: labels bound by `for`/`id` or by wrapping, dialog role/modality/labelling/description, Tab + Shift+Tab cycling, Esc, focus restoration, scroll lock, `aria-sort`, `scope`, live regions, and that every icon name — literal *and* dynamic — resolves.
- **Motion** is limited to a fixed allowlist of state-driven animations (`overlay-in`, `dialog-in`, `page-in`, `loading-pulse`), with no staggered or infinite decoration, and `prefers-reduced-motion` neutralising animation and transition.
- **The viewport fix is exercised, not grepped.** A mock `window.matchMedia` is driven through subscribe → change → unsubscribe, proving the snapshot updates on a real change event and stops after unsubscribe, and that the legacy-Safari `addListener` path works. The layout is separately checked to hold no effects at all.
- **No regression**: all 707 pre-Phase-7 assertions still pass (37 + 24 + 79 + 81 + 45 + 100 + 125 + 117 + 33 + 23 + 43), plus 214 new Phase 7 assertions.

### Defects found and fixed during Phase 7 verification

1. **Lint rejected the first drawer implementation.** The auto-close-on-widen was a `setState` in an effect, which causes a cascading render and is exactly the pattern `react-hooks/set-state-in-effect` exists to catch. Replaced with derived state. `useMediaQuery` had the same problem; replaced with `useSyncExternalStore`.
2. **`starFilled` icon and every dynamic icon name were audited.** `Icon` returns `null` for an unknown name, so a typo would silently render nothing. All names now resolve and the harness checks the set on every run.
3. **`.status-active` was a bare global class.** Renamed to `status-badge--active` to match the BEM convention used elsewhere and remove the collision risk.
4. **The empty-state glyph was accent blue and commented as "purely decorative".** Changed to a muted monochrome glyph, since decorative accent colour is precisely what the brief rules out.
5. **Eight tokens were dead** (`--font-mono`, `--radius-small`, `--border-width-strong`, `--shadow-popover`, `--space-16`, `--z-dropdown`, `--space-12`, and the PrimeReact bridge). Removed, and the two with a real consumer (`--focus-ring-width`, `--space-section-gap`) were wired instead.
6. **Two Phase 6 assertions encoded the old appearance** (CSS-drawn hamburger, `2px` literal outline). Updated to assert the current, stricter truth (shared icon set; `var(--focus-ring-width)` resolving to 2px).

### Flags

1. **No headless browser was available, so nothing here is a rendered-pixel claim.** Verification is: computed contrast, computed cascade at three widths, DOM produced by server-rendering the real components, and source/CSS analysis. It is not a screenshot diff and should not be described as one.
2. **The breakdown bar is the single inline style in the app** (`width: ${row.bar}%`). It is data-driven (`toBarPercent(count, max)`), decorative, and `aria-hidden`; the real figure is in the adjacent Share column. It is deliberately exempt from tokenisation and the harness asserts it stays data-driven.
3. **Theme is still not implemented.** Settings still stores and displays a `light`/`dark` preference that has no effect. The Field hint now says so plainly rather than implying it works.
4. **Two destructive actions remain non-undoable** (clear activity log, reset demo data). Both are behind dialogs that state the counts and are not recoverable.
5. **The mobile drawer scrim is a focusable `<button aria-label="Close navigation">`.** This gives it a keyboard path but means a full-surface invisible control exists in the tab order while the drawer is open; a non-focusable backdrop plus an explicit close control would be leaner.
6. **Fonts still come from Google Fonts** (`display=swap` + `preconnect`), so rendering depends on a third-party network call and the app is not fully self-contained offline.
7. All Phase 1/2/3/3b/4/5/6 flags remain open as previously recorded, except those explicitly marked resolved above.

---

## Cure.Med visual redesign — Part A, foundation (2026-09-29)

**Outcome: the Phase 6–7 monochrome/electric-blue visual system is reversed and replaced with a light, near-white lavender-and-purple foundation sampled from the owner's reference screenshots. This is a reversal of two committed phases, not an incremental restyle. Part A is styling and assets only: no page was restructured and no component logic, provider, hook or data flow was touched. 323 assertions pass, `npm run lint` and `npm run build` are clean. Part B has NOT been started and is waiting on approval.**

### The reversal, and why

Phase 6 locked a monochrome system and Phase 7 built every page on it, including a token comment that declared a single "cool electric blue" accent the right choice for clinical software. That decision is now reversed, deliberately, for the same reason the PrimeReact decision was reversed: a committed choice that is no longer the right choice is worse than never having made it, because every component now encodes it.

- **Replaced:** greyscale surfaces, a single saturated electric blue (`#0a5cff` family), `--color-bg: #f1f2f4`-style neutral greys, flat borderless cards, and Poppins/Inter.
- **With:** near-white surfaces on a faint lavender page tint, one purple accent, hairline borders, restrained elevation on cards only, and Space Grotesk/Roboto.
- **Why:** the owner supplied two reference screenshots as the intended visual direction. Their flat accent tiles, soft purple-blue banner gradient and low-chroma light surfaces are the target. The screenshots informed the *values*; they did not dictate layout, and nothing was copied structurally.

The token names were **kept**, not renamed. `color/bg`, `color/surface`, `color/text-*`, `color/accent`, `radius/*`, `shadow/*` and so on still mean what they meant, so the reversal is a value change, not a refactor. `--shadow-none` was removed because the new elevation policy made it meaningless and it had no consumer.

### Font choices (the substitution the owner needs to confirm)

| Role | Choice | Reasoning |
| --- | --- | --- |
| Headings / display | **Space Grotesk** 500–700 | Freely licensed, geometric-grotesque character matching the reference UI's headings, and visually distinct from the body face. |
| Body / UI | **Roboto** 400–700 | **A deliberate substitute for "Google Sans", which is proprietary and not on Google Fonts.** Roboto is freely licensed, has a similar humanist-neutral tone and near-identical metrics behaviour, and is the closest safe stand-in. |

`font-display: swap` and the two `preconnect` hints were kept; the single `<link>` in `index.html` was edited in place, not duplicated. The display face is scoped to `h1`–`h6`, `.metric` and `.empty-state-title` only — it is never applied to a body-text element, and the body stack does not lead with it. **This substitution is a judgement call, not a match; please confirm Roboto is acceptable or name a preferred freely licensed alternative.**

### The one dependency exception

`@fortawesome/fontawesome-free@7.3.1` — the owner's explicit exception to "no new dependencies". Two CSS files are imported, not the React bindings and not `all.min.css`: `fontawesome.min.css` (the class→codepoint map) and `solid.min.css` (the webfont binding). Six navigation icons only. An audit confirmed all six are in the **free solid set** and none require a Pro licence. No brand or regular webfont is emitted, and the existing hand-built inline-SVG `Icon` set was left alone, because it already resolves every name and 1.5px-strokes correctly.

**Known cost, stated plainly:** the codepoint map ships 1,422 rules covering all 2,001 free icon selectors (including aliases), and the solid webfont is 119 kB, so the icon system costs ~17 kB gzipped CSS plus that webfont for six glyphs. This was accepted because hand-trimming it means copying vendor CSS into the repo, which is exactly the drift the token system exists to prevent. If that trade is wrong, the lean alternative is inlining the six SVGs from the package's own `svgs/solid/` and dropping the webfont entirely (~1–2 kB, no font request) — worth revisiting, flagged below.

### Files added

| File | Purpose |
| --- | --- |
| `src/components/MediaPlaceholder.jsx` | Accessible empty-media surface: `role="img"` + `aria-label`, an illustration silhouette or avatar circle, `block` / `avatar` / `inline` variants, optional visible caption. An unknown `kind` renders nothing rather than an empty box. It is deliberately *not* an `<img>`, so it can never show a broken-image glyph. |

### Files changed

- `src/styles/tokens.css` — the reversal itself. Sampled palette, Space Grotesk/Roboto, `--gradient-hero` (used by exactly one hero element), card/hero/dialog shadows, 12/20/999px radii, and placeholder-media geometry. `--shadow-none` deleted.
- `src/index.css` — added the two Font Awesome imports ahead of the design-system files; still imports-only and still ordered.
- `src/styles/base.css` — type stack plus corrected comments; display face kept off body text.
- `src/styles/shell.css` — header and sidebar now sit on `--color-surface` over the lavender canvas, so the shell reads as white chrome instead of a grey band; added `.nav-link__icon` for the Font Awesome glyphs.
- `src/styles/components.css` — card/hero elevation and radius, hero block, placeholder-media styles, and removal of the old blue-tinted accent rules.
- `src/components/Sidebar.jsx` — the six nav items now use Font Awesome solid icons. `aria-hidden` on every glyph, because the visible text label carries the meaning; adding the icons did not add any accessible name.
- `src/components/StatCard.jsx` — comment only.
- `index.html`, `package.json`, `package-lock.json` — font link; the one dependency.

### Verified (323 assertions, 0 failures; lint and build clean)

- **Every `var(--token)` resolves to a real declaration and no token is unused**, re-parsed from source. A typo'd token renders as *nothing*, which a visual grep cannot catch. There is no colour literal and no raw geometry literal outside `tokens.css`.
- **Contrast is computed from the resolved token values**, not asserted: 33 text/UI pairs, all passing. Body text 16.20:1, link-on-white 6.20:1, white-on-accent 6.20:1, control border on white 3.55:1, every hero gradient stop ≥ 4.88:1 under white text, and each status badge on its own tint 4.76 / 5.28 / 5.71 / 7.40:1.
- **All six icon codepoints were confirmed to survive the build** into `dist/assets`, and the sidebar was server-rendered to check that all six classes, the `aria-hidden` flags, the nav landmark label and the active state are present.
- `MediaPlaceholder` was server-rendered in all three variants and an unknown `kind`, checking `role`, `aria-label`, the visible caption, and that no variant emits an `<img>` or a broken-image glyph.
- No old electric-blue hex, and no `Poppins`/`Inter`, remains anywhere in `src/` or `index.html`, nor in the built CSS.

### Defects found and fixed during this verification

1. **A false claim in `tokens.css` was caught and corrected.** The status comment asserted "a minimum luminance gap of 0.02 … is asserted, not assumed" and ">= 25deg from the accent hue". Neither was true: the real minimum pairwise luminance gap is **0.0068** (Discharged vs Pending), and the neutral Inactive sits **3.2deg** from the accent hue. Rewritten to state the rule that is actually verified — no pair is both hue-similar *and* lightness-similar — and to explain why a hue-only rule would wrongly ban a deliberate grey. This is the second time a comment in this project asserted a property the harness had never checked; the harness now derives every number in that comment.
2. **The Phase 7 claim that status hues "are additionally checked to differ in luminance" is superseded.** It was never enforced at that strength. The chromatic statuses genuinely are ≥ 59deg apart in hue; the neutral is separated by chroma instead. Recorded here rather than left as a standing claim.
3. **A stale `grep` for the icon classes initially reported zero matches** and looked like a broken import. The classes were present: the minifier rewrites `--fa:"\f625"` to the literal character `U+F625`. The check was corrected to match both forms before any conclusion was drawn.
4. **The verification harness itself had four bugs** (a `--color-color-…` token-name typo, a missing `fa-` prefix in two icon regexes, a dependency count of 3 instead of 4, and a colour pattern so broad it flagged the new success green `#0b7a4b` as "old electric blue"). All were harness faults, fixed and re-run; none indicated an app defect.

### Flags

1. **Nothing here is a rendered-pixel claim.** As in Phase 7, there was no headless browser. Verification is computed contrast, computed cascade, real server-rendered DOM, and source/CSS analysis. It is not a screenshot diff and must not be described as one.
2. **The reference screenshots were analysed programmatically, not viewed.** I sampled exact pixel values from the two PNGs (accent `#5438ff`, light page `#f1f1fe`, banner gradient stops) because I cannot see images. The values are real measurements, but my reading of the *overall composition* is inferred. Please eyeball the result against the screenshots.
3. **Roboto is a substitute for proprietary Google Sans and needs your confirmation** (see the font table above).
4. **The Font Awesome webfont is 119 kB for six icons.** Accepted, with the inline-SVG alternative documented above if you want the weight back.
5. **`MediaPlaceholder` is currently unimported.** It is a foundation component for Part B, so it deliberately has no consumer yet — but under the dead-code discipline applied in Phase 7 it is an exception, and it should be wired in during Part B rather than left orphaned. **Resolved in Part B** — it is now used by the hero, the highlight card, the sidebar profile card and every recent-patients row.
6. **The hero gradient and placeholder styles have no consumer yet**, for the same reason: they exist so Part B is restricted to composing existing primitives. **Resolved in Part B** — `--gradient-hero` now has exactly one consumer, `.hero` on the Dashboard, and the harness asserts it still has exactly one.
7. **The app still has no dark theme.** The reference included a dark screenshot; only the light direction is built, so the dark palette remains a possible Part B/B+ decision. **Still open** — see Part B.
8. All Phase 1/2/3/3b/4/5/6/7 flags remain open as previously recorded, except where superseded above.

---

## Cure.Med visual redesign — Part B, composition (2026-09-29)

**Outcome: the Part A foundation is now composed into the app. The failing heading font is replaced, both record "view" actions open the shared modal, the shell was rebuilt around grouped navigation and a real search, and the dashboard was restructured around data this app actually has. 810 assertions pass, 44 contrast pairs pass, `npm run lint` and `npm run build` are clean. No provider, hook, service or storage behaviour was changed, and no dependency was added.**

### The font that was failing to load

Part A shipped Space Grotesk 500–700 as the display face. It does not exist as a Google Font, so the request 404'd on the family and every heading silently fell back to the body face. Verified first, then replaced.

- **Was:** `family=Space+Grotesk:wght@500;600;700&family=Roboto:wght@400;500;600;700&display=swap` — the combined request returned CSS with **no Space Grotesk `@font-face` block at all**.
- **Now:** `family=Bricolage+Grotesque:wght@600;700&family=Roboto:wght@400;500;600;700&display=swap`. The single `<link>` was edited in place; both `preconnect` hints are untouched.
- **Why Bricolage Grotesque:** it is a real variable Google Font, it is a geometric grotesque with the same character as the reference's headings, and it is visually distinct from Roboto so the display/body split is actually visible. The reference screenshot's own typeface could not be identified with confidence, so this is a close match, not a copy.
- **Weights were cut to 600 and 700** because those are the only two the app applies. The harness derives the applied weights from the CSS (currently `bold` and `semibold` only) and fails if any display-face rule sets a weight outside 600/700, so a third weight cannot be introduced without also requesting it.
- `--font-heading` in `tokens.css` now leads with `"Bricolage Grotesque"`; `--font-body` is Roboto only. The display face is still scoped to headings, metrics and titles and is never applied to body text.

### View-as-modal

`SelectedUser` and `SelectedPatient` were inline panels that appeared *below* the table, so opening a record pushed the page around and the selection had no dialog semantics. Both now render inside the existing shared `Modal` (the same component the delete confirmation already used), which means the focus trap, Escape handling, focus restoration, backdrop click, `aria-modal` and the dialog's own `h2` title all apply to the view action for free. Nothing was duplicated to achieve this.

- The record name is an `h3` directly under the dialog's `h2`.
- The old `.detail-panel` card chrome (background, border, radius, shadow) was deleted. The dialog is already the card; a second card inside it was the thing that made the old version read as a separate surface.
- The number of view actions in the app is asserted to be exactly two, each one only setting a selection id, each one owned by a page that renders the shared `Modal` and imports it.

### The shell

- **Sidebar:** two labelled groups — `Workspace` (Dashboard, Users, Patients, Reports, Activity) and `Preferences` (Settings) — plus a profile card at the bottom. The card reads the real name and role from `Settings` and links to `/settings`, the page that edits exactly those fields. An unset profile renders as "Profile not set" / "Set your details in Settings" rather than a fabricated person, and no rating or credential is invented.
- **Header:** a real search form, today's date, and the existing mobile navigation control. The search is `role="search"` with a bound `sr-only` label, submits on Enter, and navigates to `/patients?q=…`. `Patients` reads the term from the URL and writes it back with `replace: true`, so the header search and the page's own box are one source of truth, a search survives a reload, and it does not stack one history entry per keystroke.
- **No bell and no theme toggle.** This app has no notification inbox and no working theme, and a control that does nothing is worse than no control.

### The dashboard, and what filled each slot

Every value is computed from the existing stores. Nothing is stored twice and no figure is hardcoded.

| Slot | Filled with | Why |
| --- | --- | --- |
| Welcome banner | `Hero` — greeting from the Settings profile name, a sentence of real counts, one white CTA to `/patients` | The banner is the app's only consumer of `--gradient-hero` and its only large display type. |
| Hero media | `MediaPlaceholder` ("Dashboard illustration placeholder") | There is no illustration asset; a dashed named frame says "unfilled" instead of rendering a broken image. |
| Single large number | `StatHighlight` — total patients, with the status split underneath | Patients are the primary record type and the only entity with a care lifecycle. |
| "To-do" column | `QuickActions` — four links: Patients, Users, Reports, Activity | The reference dashboard has a task list. This app has no tasks, no assignments and no due dates, so a to-do list would be fiction dressed as data. These are the four things an operator actually does from this screen, and every one navigates. |
| "Appointments" column | `RecentList` — five most recently created patients, each with a status badge | There are no appointments in this app. The nearest real thing is the newest records, which is what an operator wants next to a patient count. |
| Chart area | Analytics card: period pills + two `TrendTable`s **with** bars | Reuses `useReportData` and `REPORT_PERIODS` — the same hook and options the Reports page reads — so the two screens cannot disagree about a total. |
| Activity feed | Kept at the bottom, unchanged in meaning | It was already honest real data; moving it was not necessary. |

`TrendTable` gained an opt-in `showBar` prop that reuses the existing `toBarPercent` helper and the existing `breakdown-bar` styles. The bar is `aria-hidden`, the Count column is always present, and `showBar` defaults to `false`, so the Reports page is byte-for-byte unchanged by this work.

`Reports`' period `<select>` became the same `FilterPills` group, driven by `REPORT_PERIODS`, which is derived from `PERIOD_MONTHS` so the options and the filter implementation cannot drift. `Reports` also stopped re-declaring `ALL_CATEGORIES` locally and now imports it from `utils/reports`, where it was already defined.

### Files added

| File | Purpose |
| --- | --- |
| `src/components/Hero.jsx` | `Hero` (the page `h1` + message + media slot) and `HeroLink` (a real `Link` styled with the existing button language). |
| `src/components/StatHighlight.jsx` | The one large metric card. Deliberately not a bigger `StatCard`. |
| `src/components/QuickActions.jsx` | Real navigation shortcuts, one per destination, icon decorative. |
| `src/components/RecentList.jsx` | Short people list with a media slot per row, a real empty state and an optional footer. |
| `src/components/FilterPills.jsx` | Accessible mutually-exclusive option group; `aria-pressed` carries the selection, so the active pill is never colour-only. |

### Files changed

- `index.html` — the font link (one line, edited in place).
- `src/styles/tokens.css` — `--font-heading`; comments corrected from Space Grotesk to Bricolage Grotesque.
- `src/styles/shell.css` — grouped nav, profile card, header search, header date, `.header__title`; header and sidebar now sit on `--color-surface`.
- `src/styles/components.css` — hero, placeholder media, dashboard layout, highlight, quick actions, recent list, analytics, pills; card/dialog elevation; `.detail-panel` reduced to content only.
- `src/components/Header.jsx`, `Sidebar.jsx`, `SelectedUser.jsx`, `SelectedPatient.jsx`, `TrendTable.jsx`, `Icon.jsx` (four new glyphs: `users`, `patient`, `chart`, `history`).
- `src/pages/Dashboard.jsx` (restructured), `Patients.jsx` (modal + URL search), `Users.jsx` (modal), `Reports.jsx` (pills, shared constant), `Activity.jsx` (one dead class fixed).
- `src/utils/patients.js` — added `sortPatientsByCreatedAtDesc`; `src/utils/reports.js` — exports `REPORT_PERIODS`, `ALL_CATEGORIES`, `PERIOD_MONTHS`.

### Judgement calls, stated explicitly

1. **The reference's task list and appointments column were not faked.** Both slots were filled with real, reachable data (quick actions, recent patients). This is a deliberate departure from the screenshot's composition.
2. **Header search targets Patients only.** Patients is the entity this app looks people up on. It does not search Users and does not search across both.
3. **The hero CTA is a white button, not a second purple one.** The banner is already the accent; stacking a purple fill on it is the "purple everywhere" failure. Its label is `--color-accent` on `--color-surface` (6.20:1), and both hover and active states are checked the same way.
4. **Analytics reuses `useReportData` rather than deriving new numbers on the dashboard.** No chart library was added; the bar column reuses the existing breakdown-bar system.
5. **The header's app name was demoted from `h1` to a `<p class="header__title">`.** This is a change to a Part A decision (see defects below) and is the one item in this phase that touches something Part A deliberately chose.
6. **Settings was grouped as its own `Preferences` section** rather than kept as a sixth peer, because it is the only item that configures the app rather than being part of the work.
7. **Font Awesome was left as-is.** Six solid glyphs still cost a 119 kB webfont and a large codepoint map. Part A already recorded the lean alternative; it is still not done.

### Verified (810 assertions, 44 contrast pairs, lint and build clean)

- **The font really exists and really is served.** The live request returns HTTP 200 with 42 `@font-face` rules; Bricolage Grotesque is present at 600 and 700, each declaring `font-display: swap` and a Latin subset covering `U+0000-00FF`; both Latin files were downloaded and their first four bytes are `wOF2`, so they are real fonts and not error pages; Roboto is still served; the response contains no Space Grotesk. `src/`, `index.html` and `dist/` contain no Space Grotesk reference. The harness fails if any display-face rule uses a weight outside 600/700, or if the display face is applied to a body-text element.
- **Token integrity and drift:** every `var(--token)` resolves, no token is dead, every alias resolves, no colour literal exists outside `tokens.css`, and the new selectors carry no raw geometry literal.
- **Accent restraint is enumerated, not eyeballed.** Accent *fills* exist on exactly three selectors (`.btn-primary`, `.pill--active`, `.breakdown-bar-fill`), `--gradient-hero` has exactly one consumer, accent *tints* on three, and `box-shadow` is confined to card/hero/dialog/page chrome.
- **Contrast:** 44 computed pairs, all passing — every text pair ≥ 4.5:1, every non-text pair ≥ 3:1, every hero gradient stop ≥ 4.88:1 under white text, each status badge on its own tint 4.76–7.40:1, and the status set is checked for hue/lightness separation as a set rather than pairwise-by-luminance (see defect 5).
- **Rendered output.** The real components were server-rendered through Vite SSR and the DOM inspected: the sidebar (six glyphs, all `aria-hidden`, two group labels, active state, real profile name and role, and the unset-profile case), the header (search landmark, bound label, `type="search"`, real `aria-expanded`, machine-readable `<time>`, no bell, no theme toggle), the pills, hero, highlight, quick actions, recent list, both dialogs (real `role="dialog"`, `aria-modal`, `h3` record name, every field still present, em dash for an empty field), and `TrendTable` with and without bars (43% and 100% widths, no NaN). No `NaN`, `undefined`, `[object Object]` or `Invalid Date` appears in any rendered output.
- **Cascade at three widths** is evaluated by parsing the media queries, not by grep: 1440 (sidebar column, search fixed width), 1000 (reduced sidebar), 390 (sidebar becomes a fixed off-canvas drawer, menu button appears, the date is dropped, the search flexes).
- **Dead code:** no orphaned source file, no `console.log`/`debugger`/`TODO`/`FIXME`, no `<img>` anywhere in `src/` (comments excluded, since the prose mentions `<img>` deliberately), no local `@font-face` shadowing the CDN, and the six Font Awesome codepoints all survive the build.
- **Build:** `dist/index.html` 0.78 kB, CSS 103.57 kB (23.54 kB gzip), JS 326.73 kB (98.61 kB gzip), webfont 119.48 kB. `dist/index.html` keeps both preconnects and the corrected family.

### Defects found and fixed in this phase

1. **The header and the page were both rendering an `h1`.** `Header` shipped an `<h1>Admin Dashboard</h1>` whose own comment claimed "the page owns the H1", and every page's `PageHeader` renders another `h1`. Adding the hero would have put three on the Dashboard. The header title is now a `<p class="header__title">`, and the harness asserts that a page has exactly one `h1` and that the hero is the Dashboard's only one. This supersedes the Part A note that the header title is "a deliberately small, de-emphasisised h1".
2. **A dead CSS class was in use on the Activity page.** `className="status-badge status-inactive"` referenced a class that Phase 7 renamed, so those badges had lost their background. Now `status-badge--inactive`.
3. **`.nav-group` had markup but no rule.** The new sidebar group wrapper was unstyled; a rule was added rather than deleting the harness's expectation of it.
4. **Two comments in the two dialog bodies claimed they render no heading** while both render an `h3`. Corrected to describe what the code does.
5. **The harnesses themselves had eight defects** (all found by running them, none of which indicated an app problem): an unterminated regex that made the whole file fail to parse; a `Set` misuse in the token-usage collector; the Google Fonts link being parsed with `URLSearchParams`, which decoded `+` to a space, dropped the second family and then built a URL `fetch` refused — which is also why the live font check reported a network failure while the network was fine; a CTA contrast check that compared the CTA's label against the gradient *behind* the button rather than against the button's own surface; pseudo-class selectors counted as separate elements when auditing accent fills; `<img>` matched inside a comment that discusses `<img>`; icons and orphan-file checks that matched class names and import paths the code does not use. All corrected and re-run. On the first green run the harness also correctly rejected one of my own assertions: I had expected undated records in a specific order, and the implementation's stable ordering was right.
6. **The contrast harness was still asserting a rule that Part A had already retired.** It required every status pair to differ by ΔL ≥ 0.05 in luminance and reported seven failures on the current palette. Those are the numbers Part A recorded as the *real* values (minimum pairwise gap 0.0068, Discharged vs Pending) and formally superseded with the rule "no pair may be close in both hue and lightness", which is what the code comments and `tokens.css` now say. The stale threshold was replaced with that rule, not with a re-tuned number. **No status colour was changed in this phase.**

### What remains, and what needs your decision

1. **No browser pass.** There is still no headless browser on this machine (`firefox` is a snap stub that refuses to run), so nothing here is a rendered-pixel claim. What is verified is the real server-rendered DOM, the computed cascade, computed contrast and source analysis. A human should look at the Dashboard, the two dialogs and a phone-width layout before this is called done.
2. **Should the header search cover Users too?** It currently searches Patients only. Extending it to both entities, or to Users, is a product decision, not a styling one.
3. **The header `h1` demotion changes a Part A decision.** If you would rather the app name stayed a heading and the page title were not, say so and it will be reverted — but then the page `h1` has to go instead, and one of the two has to.
4. **Notifications and theme remain unimplemented.** Settings still stores a `light`/`dark` preference and two notification flags that do nothing. The header deliberately shows no bell or toggle. Building them, or deleting the dead Settings fields, is a separate piece of work.
5. **Font Awesome is still 119 kB for six glyphs.** Inlining the six SVGs from the package's own `svgs/solid/` directory would drop the webfont entirely; not done here.
6. **No dark theme.** The reference included a dark screenshot; only the light direction is built.
7. **A column/area chart is still not built.** The analytics card shows the same data as Reports with a proportional bar. If a real chart is wanted, that is a new dependency or a hand-built SVG and should be requested explicitly.
8. **Two destructive actions remain non-undoable**, and the mobile drawer scrim is still a focusable full-surface button — both carried forward from earlier phases.
9. All Phase 1/2/3/3b/4/5/6/7 and Part A flags remain open as previously recorded, except those explicitly resolved above.

---

## Part B — independent verification pass (2026-09-30)

**Outcome: Part B was already fully implemented and committed (`49cf3b0`). This pass changed no application file — `git status` is clean — and rebuilt the verification from scratch, because the previous harnesses no longer exist. 250 assertions pass; `npm run lint` and `npm run build` are clean.**

### The finding that matters most: there is no test suite

`package.json` has four scripts: `dev`, `build`, `lint`, `preview`. There is **no `test` script, no test runner in `devDependencies`, and no `*.test.*` / `*.spec.*` file anywhere in the project.**

Every earlier phase's "N assertions, 0 failures" came from Node harnesses written to `/tmp/opencode/` and run by hand. **Those files are gone.** So the instruction to "run the full existing test suite" cannot be satisfied as written — there is nothing to run. Claiming a suite passed would be false.

What was done instead: three harnesses were written from scratch against the current source and run. They are also ephemeral (in `/tmp`, per this project's own convention), so **the project still has no regression suite** — see open item 1 below, which is the single most important thing in this section.

| Harness | Assertions | Covers |
| --- | --- | --- |
| `verify-partb.mjs` | 125 | Token integrity, font, contrast, accent restraint, view-as-modal, prior-phase invariants, shell/dashboard requirements |
| `render-partb.mjs` | 79 | The real DOM, server-rendered through Vite SSR, of the real components |
| `cascade-data.mjs` | 46 | The evaluated media-query cascade at three widths, plus data-layer regression |
| **Total** | **250** | |

### The font fix is real, and confirmed against the live CDN

The brief's first item was the heading font. Verified rather than trusted:

- The single `<link>` is `family=Bricolage+Grotesque:wght@600;700&family=Roboto:wght@400;500;600;700&display=swap`, with both `preconnect` hints intact. `dist/index.html` carries the same string, so the fix reached the build.
- A live request returns **HTTP 200** with `@font-face` blocks for `Bricolage Grotesque` at **600 and 700**, each with `font-display: swap` and a Latin subset covering `U+0000-00FF`. Roboto is still served at 400/500/600/700.
- The two Latin `woff2` files were downloaded and their first four bytes are **`wOF2`** (`774f4632`) — they are real fonts, not error pages.
- **No leftover reference to the font that was failing.** `Space Grotesk`, `Space+Grotesk`, `Poppins` and `Inter` appear in neither `src/` nor `index.html`, nor in `dist/`. (The strings `Spacebar` and `xmlSpace` in the JS bundle are React internals, and `userSpaceOnUse` is in `favicon.svg`; neither is a font.)
- **Headings actually resolve to Bricolage Grotesque.** `--font-heading` is `"Bricolage Grotesque", "Roboto", system-ui, -apple-system, "Segoe UI", sans-serif`, so the computed `font-family` for any heading is `Bricolage Grotesque` with Roboto as the fallback. The `h1, h2, h3, h4, h5, h6` rule applies it, and `body` applies `--font-body` and does **not** contain the display face.
- All seven display-face rules (`h1`–`h6`, `.metric`, `.stat-card__value`, `.hero__title`, `.modal__title`, `.empty-state__title`) use only `semibold` (600) or `bold` (700) — exactly the two weights requested, so no font file ships that nothing can select. The harness **fails** if a third weight is introduced without also requesting it, and fails if the display face is ever applied to a body-text selector.
- The `@font-face` blocks are in **no** local stylesheet, so nothing shadows the CDN.

### View-as-modal — confirmed everywhere "view" exists

There are exactly **two** view actions in the app: `handleViewUser` (`Users.jsx:43`) and `handleViewPatient` (`Patients.jsx:51`). Both pages import and render the **existing shared `Modal`** — the same component the delete confirmation already used — and both render their detail body (`SelectedUser` / `SelectedPatient`) *inside* that `<Modal>`. No new modal, side panel, inline expansion or dedicated route was introduced, and the app still contains exactly one `Modal` component.

The rendered dialogs confirm the a11y contract holds for the view action, not just for confirmations: real `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the dialog's own `<h2>`, the record name as an `<h3>` directly under it, a focus trap, Escape/backdrop close, scroll lock, and a labelled close control. Every previously-shown field survives — user: Email, Role, Status, Favorite; patient: Email, Phone, Age, Gender, Status, Date of birth, Last visit, Created. An empty `lastVisit` renders an em dash, not blank or `undefined`.

### Contrast recomputed — 23 pairs, and the code comments are true

Computed with the WCAG relative-luminance formula from the resolved token values. All pass: text pairs ≥ 4.5:1, non-text pairs ≥ 3:1, every hero gradient stop ≥ 4.88:1 under white text, and each status badge on its own tint in the 4.76–7.40:1 range.

The stronger check is that **the numbers written in the comments are the numbers the tokens actually produce**: `text-primary` 17.9:1, `text-secondary` 9.0:1, `text-muted` 6.2:1, `accent` 6.20:1 on white, `accent-subtle` 5.35:1 under the accent, and the hero's "every stop ≥ 4.88:1" all match to within 0.1. This is the check that caught two false claims in earlier phases, so it is asserted rather than trusted.

### Accent restraint enumerated, not eyeballed

Accent **fills** exist on exactly three selectors: `.btn-primary`, `.pill--active`, `.breakdown-bar-fill` (plus a disabled-hover variant of the button). Accent **tints** on exactly three: `.media-placeholder`, `.inline-message`, `.nav-link.active`. `--gradient-hero` has exactly **one** consumer (`.hero` on the Dashboard). `box-shadow` is confined to six chrome selectors: card, hero, stat-card, table-scroll, empty-state, modal. No view is dominated by purple.

### Prior-phase invariants still hold

`prefers-reduced-motion` neutralises both animation and transition. The `matchMedia` viewport fix is still a live `useSyncExternalStore` subscription with the legacy `addListener` path. Status is still never colour-only: every badge renders a text label **and** a filled `::before` dot, and no bare `.status-*` global class has leaked back into markup. No `console.log`/`debugger`/`TODO`/`FIXME`. No `<img>` anywhere in `src/` — placeholders are `role="img"` frames with a visible caption, never broken-image glyphs. `index.css` is imports-only; 110 tokens declared, 110 referenced, **zero dead**, 11 aliases all resolving, and no colour literal outside `tokens.css`.

### Responsive cascade evaluated at 1440 / 1000 / 390

Computed by parsing the media queries and applying them, not by grepping:

| | 1440 | 1000 | 390 |
| --- | --- | --- | --- |
| Layout columns | `240px 1fr` | `200px 1fr` | `1fr` |
| Sidebar | grid column | grid column | `position: fixed` drawer |
| Menu button | `none` | `none` | `inline-flex` |
| Header search | fixed width | fixed width | `1 1 auto` (flexes) |
| Header date | shown | shown | dropped |
| Dashboard columns | `2fr 1fr` | `1fr` | `1fr` |

Boundaries confirmed exact at 767/768 and 1199/1200.

### Data layer untouched

`sortPatientsByCreatedAtDesc` (added in Part B) is pure — it does not mutate its input, returns every record including unparseable and missing dates (which sort last rather than crashing), and leaks no `NaN`. Dashboard and Reports still agree: the patient report's `total` (8) equals the store length, the status breakdown sums to 8, and the chart's `createdOverTime` sums to 8 via its `value` field. An empty dataset yields `0` throughout, never `NaN`. `REPORT_PERIODS` is derived from `PERIOD_MONTHS`, so the Dashboard pills and the Reports filter cannot drift.

### One genuine observation, recorded not "fixed"

`--color-accent-border` (`#c9bdff`) measures **1.72:1 on white**, below the 3:1 that WCAG 1.4.11 requires. It is used in exactly two places — `.media-placeholder` (the dashed "unfilled" frame) and `.inline-message` (the notice banner, whose left rule is the real signal). Neither is the boundary of an interactive control, so 1.4.11 does not apply, and both surfaces carry a second cue (a visible caption; a background tint and text). The harness now **asserts that this token is never used on an interactive boundary**, so if someone later puts it on a button or input, the check fails. Left as-is deliberately: darkening it would make the placeholder frame compete with the content it is meant to recede behind.

### Harness bugs — mine, found by running them, none was an app defect

1. **The media-query parser silently dropped every rule inside an `@media` block.** It located a rule's end with `indexOf("}")`, which finds the *inner* brace. This reported the dashboard as failing to collapse at 390px — a false alarm that would have sent me "fixing" working responsive CSS. Replaced with proper brace-depth matching.
2. **The font `<link>` regex matched the wrong tag.** A lazy `[\s\S]*?` spanning from the first `<link>` captured the `favicon.svg` link, then the `preconnect`. Both made the font checks pass vacuously against an empty string. Fixed to match on the link's own attributes. (The prior phase recorded the same class of bug via `URLSearchParams` decoding `+` as a space.)
3. **Content assertions ran against comments.** "bell", "theme", "task" and `<img>` all appear in *prose* that deliberately says those things are absent. Nine checks were failing because a comment mentioned the word. Comments are now stripped before any content assertion.
4. **A `<link>`-shaped regex and an `aria-hidden` count** asserted six separate attributes where the code has one wrapper `aria-hidden` around all six glyphs — the implementation is better than the expectation.
5. **`createdOverTime` rows were summed on `count`**; they expose `value`. Produced a spurious `NaN`.
6. Three breakpoint and sidebar-width assertions demanded the literals `1200px`/`768px`/`240px` where the CSS correctly uses `max-width: 1199`/`767` and the `var(--sidebar-width)` token. The assertions now test the *effect* at the edges.

### Open decision confirmed: Font Awesome left as-is

`@fortawesome/fontawesome-free` is unchanged and remains the only non-React runtime dependency. `src/index.css` imports `fontawesome.min.css` + `solid.min.css` (not `all.min.css`), and exactly **one** webfont is emitted: `fa-solid-900-IAB4Droh.woff2`, **116.7 kB** (119.48 kB on disk). All six codepoints survive minification into the built CSS.

**Recorded as the owner requested, not done:** inlining the six SVGs from the package's own `svgs/solid/` directory would drop the webfont and the ~17 kB gzipped codepoint map entirely, for roughly 1–2 kB total. It stays undone deliberately, to avoid touching working icon code during a restructure. This is a self-contained follow-up with no visual change.

### Judgement calls, restated (unchanged from the implementation, recorded here as the audit's position)

1. **The reference's to-do list was not faked.** This app has no tasks, assignments or due dates, so the slot became `QuickActions` — four links (Patients, Users, Reports, Activity) that are the things an operator actually does from this screen, every one of which navigates. A to-do list here would be fiction dressed as data.
2. **The reference's Appointments column was not faked.** There is no scheduling concept, so the right-hand column became `RecentList` — the five most recently created patients, each with a status badge and a `MediaPlaceholder` avatar. The newest records are the nearest real analogue of "what's coming up", and they sit next to the patient count, which is the number they explain.
3. **The single large metric is total patients**, not total users. Patients are this app's primary record type and the only entity with a care lifecycle; both figures still appear in the stat grid below, so the choice hides nothing.
4. **Analytics reuses `useReportData` and `REPORT_PERIODS`** — the same hook and options the Reports page reads — so the Dashboard and Reports cannot disagree about a total. No chart logic was duplicated and no chart library was added.
5. **The sidebar is split into `Workspace` and `Preferences`.** The app has a genuine primary/secondary split (five working pages vs. the one page that configures the app), so a single group would have been the artificial choice, not the two groups.
6. **The profile card shows name and role only.** It reads real data from Settings and links to the page that edits exactly those fields. No rating, credential or plan tier was invented, because the app has no concept of any. An unset profile renders "Profile not set" / "Set your details in Settings" rather than a fabricated person.
7. **No notification bell and no dark/light toggle.** This app has no notification inbox and no working theme. A control that does nothing is worse than no control; both are listed below as real work rather than built as decoration.
8. **The header search targets Patients only.** It is a real form that navigates to `/patients?q=…`, and `Patients` reads the term from the URL, so the header box and the page box are one source of truth and a search survives a reload.
9. **The header app name was demoted from `h1` to `<p class="header__title">`.** Every page owns exactly one `h1`; adding the hero would otherwise have given the Dashboard two. This reverses a Part A decision and is the one item in Part B that touches a deliberate earlier choice.

### What still needs the project owner's decision

1. **The project has no regression test suite, and the harnesses are ephemeral.** This is the most consequential item here. Three hundred-plus assertions have now been written twice and lost twice. Adding a runner (`vitest`, `node --test`) plus a committed test directory is a dependency and a convention change, so it was not done unilaterally — but without it, "the test suite still passes" is not a claim anyone can make about this repository.
2. **No browser pass, still.** There is no headless browser on this machine. Everything above is computed contrast, an evaluated cascade, real server-rendered DOM and source analysis. **Nothing here is a rendered-pixel claim** and it must not be described as one. A human should look at the Dashboard, both dialogs, and a phone-width layout against the reference screenshots before this is called done.
3. ~~**Roboto as the Google Sans substitute still needs confirming.**~~ **RESOLVED — the owner confirmed Roboto is acceptable.** Recorded as confirmed in the Part C section; the substitution stands unchanged.
4. **Should the header `h1` demotion stand?** It reverses a Part A decision. If the app name should stay a heading, the page `h1` has to go instead — one of the two has to yield.
5. **Notifications and theme remain unimplemented.** Settings still stores a `light`/`dark` preference and two notification flags that do nothing. Either build them or delete the dead fields — the header deliberately shows neither.
6. **Font Awesome: 116.7 kB for six glyphs.** Not done, as instructed. The lean alternative is documented above.
7. **No dark theme**, although the reference included a dark screenshot.
8. **No real chart.** The analytics card is the same data as Reports with a proportional bar. A genuine column/area chart is a new dependency or a hand-built SVG and should be requested explicitly.
9. **Should the header search cover Users, or both entities?** A product decision, not a styling one.
10. **Two destructive actions remain non-undoable** (clear activity log, reset demo data), and the mobile drawer scrim is still a focusable full-surface `<button>`. Both carried forward from earlier phases.
11. All Phase 1/2/3/3b/4/5/6/7 and Part A flags remain open as previously recorded, except where explicitly resolved above.

---

## Part C — sidebar fold, floating panel and header affordances (2026-09-30)

**Outcome: implemented, verified by 737 computed assertions across four harnesses with 0 failures, `npm run lint` and `npm run build` clean. Twelve Part B assertions are marked SUPERSEDED because the owner reversed them in this pass — they are kept in place, not deleted, so a regression back to the old behaviour stays visible. Still no rendered-pixel or browser verification; see open items.**

### Files touched, and nothing else

| File | Change |
| --- | --- |
| `src/components/Sidebar.jsx` | Fold toggle, single sliding highlight, pinned footer, collapsed profile, measurement and reduced-motion handling |
| `src/components/Header.jsx` | Two inert placeholders (theme, notifications) after the date |
| `src/layouts/AdminLayout.jsx` | Owns the collapsed state, reads and writes it, adds the grid class |
| `src/services/shellPreferenceStorage.js` | **New.** Persists the preference through the existing `createStorage` helper |
| `src/styles/tokens.css` | Rail colours, rail geometry, float gap, shell duration, rail shadow — additions only |
| `src/styles/shell.css` | The floating panel, the dark rail, the highlight, the drawer, reduced motion |
| `src/styles/components.css` | The rail avatar tint, and nothing else |

No page, provider, hook, data service, dependency, config or test file was touched. The harness asserts this from `git status`, not from a claim.

### The sidebar is now a floating panel, not a grid column

The panel is `position: sticky`, inset `--sidebar-float-gap` (12px) from the top and the inline edges, `margin: var(--sidebar-float-gap)` for the bottom inset, height `calc(100vh - var(--header-height) - (var(--sidebar-float-gap) * 2))`, with `--shadow-rail` rather than `--shadow-card` so a dark surface detaches from a near-white canvas. The grid track is what actually narrows: `var(--sidebar-width) 1fr` expanded, `var(--sidebar-width-collapsed) 1fr` folded, transitioned over `--duration-shell` (240ms) on the existing `--ease-standard`. **No bespoke spring**, because the system already has one curve and two is worse than one.

The folded width is 68px — a real shrink, less than half of the 200px reduced width. The rail is icon-plus-padding, not a wide panel with the text hidden.

### The one decision everything else rests on: the fold must not reflow the nav

The owner asked for a highlight that slides, including *around* the fold. The obvious implementation — measure on resize, or reposition during the transition — is a drag-and-drop algorithm with a timing dependency, and it will drift.

Instead the nav was made **geometrically identical in both states**, which makes drift impossible rather than unlikely:

- A folded link keeps its **vertical** padding (`var(--space-2)`), only the horizontal padding and the gap go to zero.
- A folded group label keeps its box via `visibility: hidden`, never `display: none`.
- The link's own text is the only thing removed, with `display: none`.

So `offsetTop` and `offsetHeight` of the active row are the same number before and after the fold. The highlight has nothing to catch up on. Both files say this in a comment at the rule, because it is invisible, non-obvious, and the first person to "tidy up" that padding will break the slide.

This is why there is no `isRepositioning` state: `react-hooks/set-state-in-effect` forbids a synchronous passive-effect state update, and suppressing the lint was the wrong answer. Removing the need for the state was the right one.

### One highlight element, not one per item

A single `<span class="nav-indicator">` sits inside `.nav-groups`, which is `position: relative`, so the `offsetTop` that positions it and the `translateY` that moves it share one frame of reference. It is `height: 0`, `pointer-events: none`, `z-index: 0` under `z-index: 1` links, and `aria-hidden="true"` because the state is already carried by `aria-current` and a heavier weight — the block is never the only signal.

It is measured from `.nav-link--active` with `useIsomorphicLayoutEffect` (so it is a `useEffect` on the server and does not warn), on mount, on pathname change, on collapse, on drawer open, and again on `ResizeObserver` of the nav list and on `document.fonts.ready` — a webfont swapping in changes row heights, and a highlight sized before that is a highlight sized wrong.

**The highlight does not exist in the server render** (no layout, so no measurement) and is inserted by the layout effect before first paint. The harness asserts both halves of that, because a highlight rendered at `top: 0` on the server is a visible flash at the top of the nav on every load.

### The rail is a dark island, so it was audited against itself

A self-contained dark surface cannot inherit the light palette's contrast results. Every rail ratio is measured against `--color-rail` and the harness recomputes all of them from the token values.

| Pair | Ratio | Used for |
| --- | --- | --- |
| `--color-rail-text` on `--color-rail` | **17.63:1** | Rail text, and the focus ring |
| `--color-rail-text-muted` on `--color-rail` | **6.88:1** | Inactive rail icons |
| `--color-rail-text-muted` on `--color-rail-hover` | **5.54:1** | Inactive rail icons on a hovered row |
| `--color-text-primary` on `--color-rail-active` | **8.26:1** | Active rail row text |
| `--color-rail-active` on `--color-rail` | **8.12:1** | The active block's edge against the rail |
| `--color-accent` on `--color-rail` | **2.84:1** | *Rejected* — under the 3:1 that 1.4.11 wants of a state boundary |

**The active block is light in both states.** Expanded it is `--color-accent-subtle`; folded it is `--color-rail-active` (`#b3a4ff`); both carry `--color-text-primary`. The *relationship* is identical across the fold, only the depth of the lavender changes. A saturated accent block is 2.84:1 on the rail and is also visually blinding, so it was rejected on measurement rather than taste.

`--color-rail-active` is its own token and deliberately **not** a reuse of `--color-accent-border`: that one is a near-white border colour on a light surface, and a token named "border" should not end up as a fill.

### Accessibility decisions, and what was deliberately not built

- Nav links **always** carry `aria-label`, and it is the identical string to the visible label, so "label in name" holds when expanded and the link is still named when the text is `display: none`.
- `title` is offered **only while folded**, because that is the only state with no visible text. **No custom tooltip was built**: `.nav-groups` is the scroll container and `overflow: hidden` on a nav item clips a tooltip, so a styled tooltip needs a portal and a positioned wrapper for six labels of information that a native tooltip already conveys. This is an open item, not an oversight.
- The fold toggle is a real `<button>` with `aria-expanded={!isCollapsed}`, `aria-controls="app-sidebar"`, and a name that changes with the action ("Collapse sidebar" / "Expand sidebar").
- The collapsed profile card gets `aria-label="Profile and settings"` **only while folded**, because that is when its two text lines are removed. Expanded it is named by its own content and is not named twice.
- **The header placeholders use `aria-disabled`, not `disabled`.** A `disabled` button is not focusable, so it could not be discovered by a keyboard user at all, and its focus ring would be suppressed. They carry `data-shell-placeholder`, a label, a title explaining why, `cursor: not-allowed`, and **no handler of any kind** — the harness greps the button's own prop list to prove there is not one.
- They are honest about what they are: each comment names the stored preference to wire into (`DEFAULT_SETTINGS.appearance.theme`, `settings.notifications.email` / `.system`). The theme comment also says plainly that **no dark palette exists in the token file today**, because wiring a toggle to nothing is the failure mode this pass was asked to avoid.

### Persistence: a window property, not a user property

`admin-dashboard.shell-preferences`, via the existing `createStorage(STORAGE_KEY, isValidPreference)` — the same `{ version, data }` envelope, the same `STORAGE_SCHEMA_VERSION`, the same fail-closed behaviour as every other stored resource. Nothing was reimplemented: the file contains no `JSON.parse` and no direct `localStorage` call.

It is deliberately **not** in the Settings store. Settings is user-profile data that belongs to the person and is edited on a page. Whether the sidebar is folded is a property of this browser's window; reapplying it to a different account on the same browser would be wrong.

`AdminLayout` reads it in a `useState` initialiser, so the rail is correct on the first paint, and writes it in an effect guarded by a ref, so the first render does not write back what it just read. The harness round-trips the real module through a fake `localStorage`: corrupt JSON is discarded and removed, a non-boolean is rejected, a future schema version is refused, a second unrelated preference survives, re-saving does not duplicate a key, and a simulated reload reads the stored value rather than a cached one.

### Reduced motion: instant, not merely faster

Three layers, and the third is the one that matters:

1. `base.css` already zeroes `transition-duration` to `0.01ms !important` under `prefers-reduced-motion: reduce`, and nothing can override `!important`.
2. The shell states its own intent in a matching block, so the intent is legible in the file that owns the animation.
3. **`handleNavClick` sets the position synchronously when the preference is set.** A transition of 0.01ms can still paint one frame at the *old* offset, and one frame at the wrong offset is a visible jump. Positioning the highlight in the same event as the route change removes that frame entirely.

### Mobile: the fold does not follow

Below 768px the panel is a `position: fixed` drawer, inset by the same float gap, translated off-canvas when closed and `visibility: hidden` so it leaves the tab order. The drawer **ignores the persisted collapsed state**: it always opens at full width with labels and the light highlight, and the fold toggle is `display: none`. A persisted rail width applied to a drawer would leave the nav unusable, and hiding the toggle while leaving the state applied would be a control that does nothing.

### Judgement calls

1. **`--color-rail-hover` is a step, not a jump** — 1.24:1 against the rail, not 3:1. Hover on the rail is carried by the icon going from muted to full white *as well as* the fill, so the fill only has to be perceptible. An earlier value (1.13:1) was rejected as effectively invisible; 1.24:1 is a perceptible lift, and the muted icons still read at 5.54:1 on it.
2. **The rail avatar is re-tinted, not recoloured.** The default near-white placeholder fill would be a bright chip in a dark panel, so the avatar uses `--color-rail-hover` with a `--color-rail-text-muted` silhouette. This is the only reason `components.css` is in scope at all.
3. **The header placeholders are inert rather than absent.** Part B's position was that a control which does nothing is worse than no control; the owner has since asked for both affordances visibly present. Inert plus labelled plus honest-in-a-tooltip is the compromise, and the wiring points are documented in the file.
4. **`--duration-shell` is 240ms, longer than `--duration-base` (180ms).** Both the width change and the highlight slide are spatial moves the eye has to follow across the panel, not colour fades.
5. **No 3D tilt, no glassmorphism, no glow.** The reference rail is flat and dark; the only elevation anywhere is a shadow on the panel itself.
6. **The active state is weight + `aria-current` + the block.** The 2px left border that Part B had is gone — it was part of the busy treatment the owner rejected.

### What the verification actually did

`package.json` still has no `test` script and there is still no test runner, so "the full existing test suite" remains unrunnable and is not claimed. Four harnesses were run by hand from `/tmp/opencode/`, per this project's convention:

| Harness | Assertions | Covers |
| --- | --- | --- |
| `verify-shell.mjs` | **486** | Tokens, rail contrast, panel geometry, profile pinning, highlight mechanics, reduced motion, rail labelling, header placeholders, persistence round-trip, mobile drawer, server-rendered DOM, git scope |
| `verify-partb.mjs` | 127 | Part B invariants (6 superseded) |
| `render-partb.mjs` | 79 | Server-rendered DOM (4 superseded) |
| `cascade-data.mjs` | 45 | Evaluated cascade at three widths, data layer (2 superseded) |
| **Total** | **737** | **0 failures, 12 superseded** |

Two things about this pass's harness are worth recording, because both had already produced false confidence once:

**A green run was treated as worthless until the harness was shown to fail.** 27 deliberate mutations were injected one at a time — white text on the active rail row, the accent as the rail hover fill, the accent as the active block, a `display: none` group label, dropped vertical padding, a second drop shadow on the highlight, a nav list that cannot shrink, the bar animating `background-color` instead of `transform`, the reduced-motion rule deleted, the reduced-motion click fix removed, persistence bypassed, the shared storage helper swapped for `localStorage`, a click handler on a placeholder, a missing `aria-label`, a missing `aria-expanded`, an absolutely positioned profile card, a hard-coded `7px`, an out-of-scope file touched, four drifted contrast comments, an unverifiable ratio added, and a hover fill too dark to see. **26 of 27 were caught.** The one that was missed turned out to be a bad mutation needle rather than a weak check, and was re-run correctly. A harness that has never been shown to fail is not evidence of anything.

**The defects the harness found in this pass's own work are real and are fixed:**

- **Every contrast figure written into a comment in the three stylesheets was stale.** The comments claimed 16.78, 7.03, 7.69, 8.29 and 2.71 where the tokens actually produce 17.63, 6.88, 8.26, 8.12 and 2.84. They had been written before the values were last adjusted. All are corrected, and the harness now **re-derives every ratio literal from the token values and fails if a file does not contain the recomputed number** — including the pre-existing ones, and it fails if a ratio appears that it cannot account for. An earlier version of that check compared the computed value to a number typed into the harness, which only proved the harness agreed with itself; editing a comment to a wrong value still passed.
- **`--color-rail-hover` at 1.13:1 was too dark to see** and was raised, which in turn changed the muted-on-hover ratio from 6.11:1 to 5.54:1, so that comment was corrected too.

Six further defects were in the *harness* and are recorded because they are the kind that make a suite lie: a CSS parser that did not consume `@media` bodies (so a whole stylesheet could "pass" with the responsive and reduced-motion layers missing); a specificity counter that did not require a leading colon; elements with two classes encoded as two chain entries, which invented a plain `.nav-link` ancestor and let a `:not(.nav-link--active):hover` rule override the active row's colour; ancestor declarations applied to children regardless of inheritance, so the panel's own background appeared on every row; `:hover` and `:focus-visible` treated as structure rather than state, so hover rules won default-state comparisons; and SSR assertions written as literal `class=… href=… aria-label=…` strings, which match nothing because React emits attributes in prop order — they reported **0 named links** and read like a total accessibility failure when the markup was correct.

### Still needs the project owner's decision

1. **No regression suite.** Unchanged and still the most consequential item. 737 assertions have now been written and lost more than once. Without a committed runner, no one can make the claim "the tests pass" about this repository.
2. **No browser pass.** Unchanged. Everything above is computed contrast, an evaluated cascade, real server-rendered DOM and source analysis. **Nothing here is a rendered-pixel claim.** A human should look at the expanded sidebar, the folded rail, the highlight mid-slide during a fold, a short viewport, and a phone-width drawer before this is called done.
3. **A native `title` or a portalled tooltip on the rail?** The native tooltip is free and accessible; a styled one needs a portal because the nav list scrolls. Left as native.
4. **Should the collapsed preference be per-breakpoint?** It is currently a single stored boolean treated as a desktop density choice and ignored on mobile. A user who folds the rail on a large screen and reopens it on a small one gets the folded value back on the large screen, which is the intent, but a per-breakpoint store is a defensible alternative.
5. **The two header placeholders.** Build them (a dark palette does not exist; `settings.notifications` stores two flags that do nothing) or remove them. This pass deliberately did neither.
6. **Notifications and theme remain unimplemented** — carried forward from Part B open item 5.
7. All Part A and Part B open items remain open except the Roboto confirmation, which the owner has now given.

---

## Part D — the rail is light, and the first browser pass (2026-09-30)

**Outcome: the compact sidebar is a light, near-white icon rail in the app's own
palette instead of a dark island, and two defects that only exist in a rendered
browser were found and fixed. 746 assertions pass, `npm run lint` and
`npm run build` are clean.**

### The dark rail was the design, not a bug — and the brief has changed

The premise behind this pass was that something rogue was darkening the compact
sidebar: a leftover dark-mode class, a stale token, or a media query meant for
something else. **None of those was true, and the browser said so directly.**
`html.class` and `body.class` were both empty; the only rule that matched the
panel was `.sidebar.is-collapsed { background: var(--color-rail) }`; and the
painted pixel was `rgb(25, 21, 48)` — exactly `--color-rail`, the value Part C
had introduced on purpose from the "Channel Analytics" reference. The
`max-width: 767px` drawer rules exist but do not apply at 1440px. So this was
not a leak to hunt; it was a design decision being reversed on instruction, and
the work was to reverse it properly rather than to hunt for a phantom.

The rail is now `--color-rail: #f8f6ff` (one step off `--color-surface`, so it
still reads as a distinct object), with the app's own hairline and the same
`--shadow-card` as the expanded panel. It is no longer a special surface.

### The soft lavender active block cannot exist on a light rail

This is the one place where the change could not be a straight substitution, and
the measurement is the whole argument. The expanded sidebar marks the active row
with `--color-accent-subtle` under `--color-text-primary`. Reused on the rail,
that block is **1.08:1 against it** — it carries no state boundary whatsoever,
where WCAG 1.4.11 wants 3:1 of a boundary that identifies a state. The dark rail
had been hiding this: the same light block on `#191530` measured 8.12:1 at its
edge. **The dark rail was not wrong-looking, it was load-bearing for an
accessibility claim that a light rail cannot make.**

So the folded active row is the saturated `--color-accent`, which is 5.79:1
against the rail and 6.20:1 under `--color-text-inverse`. The consequence is
stated rather than smoothed over: **the relationship between block and text is
inverted between the two states.** Expanded is a light block under dark text;
folded it is a saturated block under white text. The active row therefore looks
different after a fold, and that is a real, visible change, not a subtlety.

The focus ring follows the same logic — back to the app's accent (5.79:1) rather
than the white the dark rail required, except on the active row, where an accent
ring on an accent block would be invisible, so it inverts to `--color-text-inverse`.

### Two defects that paper verification could not have found

1. **The rail could not hold its own padding.** The track includes the 12px float
   gap on each side, so the 68px track painted a **44px** panel; minus the
   panel's 16px inline padding and its border, the content box was **10px**. The
   highlight block rendered as a 10px sliver, the row was 16px wide — under the
   24px minimum target size in WCAG 2.5.8 — and every geometry assertion still
   passed, because the harness reasoned about the *track* and the *vertical*
   box, which were both fine. Fixed by widening the track to 76px (a 52px painted
   panel) and giving the collapsed panel 8px inline padding, so the row is 34px.
   Measured after: link 34×34, block 34×34.
2. **The profile avatar hung over its own card.** The default 40px avatar is
   wider than the 34px rail row, so it spilled 3px past the card on each side —
   visible as soon as the card was hovered and tinted. The collapsed card now
   drops its padding and the avatar uses `--control-height-sm`.

Both are now asserted, and the rail geometry is asserted as *painted* width
(track less the float gap) rather than track width, with a comment recording that
the earlier arithmetic on the wrong box is what let the 10px sliver through.

`components.css` is **untouched** again. The dark rail needed one rule there — a
re-tint of the profile avatar, because a near-white fill was a bright chip in a
dark panel — and with a light rail the default is already correct, so the file
returned to pristine and the reasoning moved to the rail tokens, where a "do not
add this back" note now lives.

### What the browser confirmed about the last two features

- **The highlight really slides.** 120ms into a route change the bar's transform
  was `matrix(1, 0, 0, 1, 0, 64)` — mid-transition, not snapped — and it settled
  38px lower with `aria-current` moved to the new item. One element, translated.
- **The fold does not make the bar drift.** Sampled inside the page on a rAF
  timeline across the fold, the active row's height was **34px at every single
  sample** while the panel width interpolated 216 → 58px. The geometry the
  indicator was measured against does not change, which is the whole reason the
  bar stays glued to its row.
- **The placeholders render and are genuinely inert.** Both are 34×34 buttons,
  `aria-disabled="true"`, `data-shell-placeholder` set, `cursor: not-allowed`,
  no `popover`, no handler. Clicking both left the DOM byte-identical
  (22845 → 22845 characters), opened no dialog, and logged nothing.
- **The mobile drawer is unaffected.** At 390px it is still a 240px fixed drawer
  with 16px padding, labels visible, the soft-lavender block and dark active text
  — the rail's 8px padding and its white active text do not leak into it.

### Files changed

- `src/styles/tokens.css` — the rail tokens repointed to the light palette;
  `--sidebar-width-collapsed` 68px → 76px; `--shadow-rail` now aliases
  `--shadow-card`; the avatar-override warning moved here.
- `src/styles/shell.css` — collapsed padding, `width: 100%` on collapsed rows,
  the accent active block with inverse text, the focus-ring inversion, the
  avatar size, and a matching `padding-inline` restore inside the drawer media
  query (the desktop `.sidebar.is-collapsed` rule outranks the drawer's
  `.sidebar` rule on specificity, so without it the drawer would have inherited
  the rail's 8px inset).
- `PROJECT_NOTES.md` — this section.
- `src/styles/components.css` is **not** in the list: it was reverted.

### Verified

746 assertions across four harnesses, 0 failures, 12 superseded Part B checks
(`verify-shell` 495, `verify-partb` 127, `render-partb` 79, `cascade-data` 45);
lint and build clean. The four new rail assertions were mutation-tested —
restoring `#191530` produces 21 failures, the 68px track fails the row-width
check, a soft-lavender block fails three contrast checks, and dropping
`width: 100%` fails the block-span check.

Rendered-pixel measurements were taken by decoding Chromium's own screenshot
output and reading the values, in both states: rail surface `#f8f6ff`, active
block `#5438ff`, block-to-surface 5.79:1, glyph-on-block 6.20:1.

### Flags

1. **The active row now looks different after a fold than before it.** Expanded is
   a soft lavender block under dark text; folded it is a saturated purple block
   under white text. This is forced by 1.4.11, but it is a visible change in the
   relationship between the two states, and the alternative — accepting a 1.08:1
   boundary — was rejected on measurement. Worth an owner's eye.
2. **The expanded active block is still 1.16:1 at its edge**, which is the same
   1.4.11 gap, inherited from Part B/C and left alone deliberately: softening it
   would mean re-introducing the accent left border or the accent-tinted row that
   the owner explicitly rejected. Flagged, not silently changed.
3. **The rail is 1.07:1 against the page canvas**, exactly as the expanded panel
   is 1.00:1. Surfaces in this system are separated by elevation, not by colour,
   and the rail now takes the same card shadow as everything else. The old
   dark-rail assertion that a rail must clear 3:1 against the canvas has been
   replaced with the system rule, which no other surface would have passed either.
4. **`admin-dashboard/opencode.json` appeared in the working tree.** It is the
   Playwright MCP registration, written into the project by the tooling when the
   browser tool was enabled — not application code and not part of this work. It
   is untracked and was deliberately neither committed nor deleted; the scope
   gate now allows it past only while it stays unstaged, and fails if it is
   staged.
5. **Still no committed test suite**, so the four harnesses remain throwaway files
   in `/tmp`. What changed this pass is only that they can now drive a real
   browser, which is a bigger gap than it was.
6. **No visual sign-off.** A real browser was available and was used, but nothing
   here is a human looking at the result. The measurements are painted pixels and
   the screenshots exist; the judgement that the rail now *looks* right is still
   the owner's.
7. All Part A–C open items remain open except as noted above.
