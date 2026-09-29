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

No part of the UI depends on a third-party component package. `package.json` runtime dependencies remain exactly: `react`, `react-dom`, `react-router`.

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
