# GrocerGlow — Final Code, GitHub, Quality & IU Readiness Audit (Codex Handoff)

**Project:** GrocerGlow — *Plan your basket. Know your budget.*  
**IU module:** Project Java and Web Development (`DLBCSPJWD01`)  
**Prepared:** 21 October 2026  
**Source reviewed:** `GrocerGlow (2).zip` uploaded by the student, with `server.js`, `database.js`, `public/`, `test/`, `test-support/`, `package.json`, and `README.md`.  
**Purpose:** A complete execution checklist for Codex to audit, TEST, safely CLEAN and STANDARDIZE the *existing* application and its GitHub repository, and make it reproducible, secure, maintainable, accessible, and ready for IU assessment. Do **not** rebuild it.

**Expanded at student request:** The scope now explicitly includes an end-to-end Git/GitHub audit, full codebase cleanup, unnecessary files/dependencies/dead-code removal, professional JavaScript/HTML/CSS practices, security/privacy checks, a clean-clone reproducibility test, and a documented final quality gate. See Sections 11–14.

> **Important:** “100% complete” means every relevant acceptance test and submission requirement below has been *verified with evidence*. A 100% grade cannot be guaranteed. An item in the “check/verify” category is not a confirmed defect.

---

## 0. Instructions to Codex: read first

1. **Audit the actual current working directory**, not only this file or the historical ZIP. Files may have changed since this review.
2. **Do not overwrite, delete, reset, or commit the student's real `grocerglow.db` or its backups.** Before a schema change, create and verify a backup; run tests against temporary databases.
3. Fix actual defects with the smallest safe changes. **Keep vanilla HTML/CSS/JavaScript, Node.js, Express, better-sqlite3, and SQLite.** No React conversion, authentication system, hosting requirement, or unnecessary new dependencies.
4. Preserve the established GrocerGlow green/white visual identity, single-page workflow, independent shopping lists, and backend API behavior.
5. Before substantial changes, show the student a short diagnosis and file-by-file plan. Implement and test, then explain what changed and why, in student-friendly language.
6. Mark each task as **PASS / FIXED / NOT TESTED / NEEDS HUMAN CONFIRMATION**, with test commands and evidence. Do not report unexecuted tests as passing.
7. Respect the student’s academic integrity obligations: the student must understand and be able to explain the submitted code and decisions.
8. Keep **GitHub** for the IU submission. The university instructions explicitly require a **public GitHub repository** in Phase 2 and a GitHub repository plus exported source ZIP in Phase 3. GitHub need not be connected to Codex; removing `.git` from the *submission ZIP* is different from deleting the actual repository.
9. **Clean code, not indiscriminate deletion:** remove unused logic, duplicated functions, outdated workarounds, stale assets, unnecessary dependencies and junk files only after identifying their consumers and passing regression tests. Preserve needed behavior, accessibility and migration compatibility.
10. **Audit GitHub end-to-end**, not just locally: verify remote/branch, latest commits, ignored secrets, repository contents, visibility/link access, clean clone, install/start/test results, and the IU link. Do not push, change visibility, rewrite history, delete the repository or alter remote settings without student approval.
11. Prefer small, reviewable commits or a separate cleanup branch. Report code/files/dependencies removed with reasons, before/after test results, and restore instructions.

---

## 1. Baseline: features already implemented — verify, do not rebuild

The reviewed code contains:

- [x] Responsive HTML/CSS frontend with GrocerGlow branding and navigation.
- [x] Express REST API using JSON and SQLite persistence.
- [x] Add, edit, check/uncheck, and delete grocery items.
- [x] Quantity, optional unit price, totals, budget remaining/over-budget indicator, and warnings about unknown prices.
- [x] Separate shopping lists with individual items, budgets, and currency preferences.
- [x] Shop Again: duplicate a list, reset completion, optionally copy previous price estimates.
- [x] Shopping Mode: larger purchase controls, progress, purchased items moved below remaining items.
- [x] Light/dark mode with browser preference storage.
- [x] Manual currency selection via `GET /api/currencies` and saved per-list settings.
- [x] Optional location detection: browser permission → backend → Nominatim country/settlement lookup → currency suggestion and local-search area.
- [x] Local-price search links that open Google without scraping or importing prices automatically.
- [x] Automatic SQLite migration from the earlier single-list schema, with a backup and integrity checks.
- [x] Node/Express/SQLite automated integration and migration tests.
- [x] Playwright browser test scripts included, **not yet confirmed passing on the student's Windows computer**.

### Reproduced test baseline

From the reviewed ZIP, running `npm test` succeeded: **24 tests passed, 0 failed**, including:

- The previously failing `PATCH` item-edit payload `{ "name": "qq", "quantity": 2, "price": 45 }`.
- `GET /api/currencies` returning the expected currency array.
- Checkbox behavior, budgets, restarts, list separation, Shop Again, currency safeguards, location-response mocking, legacy migration, and backup failure safety.

**Do not confuse these 24 backend tests with complete browser/device testing.** No new major feature is required just to satisfy the course's minimum two dynamic interactions; existing implemented CRUD and settings interactions exceed that minimum.

### Confirmed packaging/version-control concerns in the reviewed ZIP

- The ZIP includes `.git/`, `node_modules/`, `grocerglow.db`, and a legacy database backup. These must not be included in the final **submission source ZIP**.
- The ZIP does **not** contain a working `.gitignore`, although Git metadata in the ZIP indicates `.gitignore` was tracked in an earlier commit.
- The extracted Git status indicated modified source files and untracked README/test files. **This is evidence about the ZIP snapshot, not proof of the student's current online GitHub state.** Verify the real local repository and remote.
- The README's setup example uses a personal Windows path. Make it portable for a lecturer.
- The CSS still contains some small 9–12px text, especially on mobile. Inspect for readability and touch usability; do not blindly replace all sizes.

---

## 2. P0 — Protect data and establish one clean, correct project

### P0.1 Establish the running project and database

**Inspect:** `package.json`, `server.js`, `database.js`, source folder structure, environment variables, and any running Node.js processes.

- [ ] Confirm there is one authoritative project directory; identify any old extracted ZIP copies.
- [ ] Confirm `npm start` uses that directory's `server.js`; check actual port and log output.
- [ ] Back up the real SQLite DB **before** any migration or potentially destructive operation. Never run acceptance tests against the real DB.
- [ ] Confirm the expected database schema and foreign-key integrity (`PRAGMA foreign_key_check`).
- [ ] Check that starting/restarting the server does not reset data or repeatedly create migration backups.
- [ ] Confirm no secrets, precise GPS, or personal shopping data will be published.

**Acceptance:** The application starts from its documented folder, existing records survive a restart, and tests operate on distinct temporary database files.

### P0.2 Repair source-control hygiene without deleting GitHub

**Inspect:** `.gitignore`, Git status, tracked files, GitHub visibility and contents.

- [ ] Restore or create `.gitignore` in the actual project (recommended entries: `node_modules/`, `*.db`, `*.db-wal`, `*.db-shm`, `backups/`, `.env`, `.env.*`, `*.log`, temporary ZIPs, test output artifacts, and OS-specific files).
- [ ] Confirm `README.md`, `test/`, `test-support/`, `server.js`, `database.js`, `public/`, and package manifests are correctly tracked.
- [ ] Inspect `git status`, `git ls-files`, and the remote; ensure no sensitive files are **tracked**, not merely ignored. If accidentally committed, carefully remove them from the repository and assess any history exposure. Do not erase the student's local database.
- [ ] Ensure all changes are committed on a sensible branch and the intended public IU repository has the latest working code when the student is ready.
- [ ] The final exported ZIP should contain source files, tests, dependency manifests, README and required documentation, but **not** `.git`, `node_modules`, real database files, backups, credentials or build artifacts.

**Acceptance:** A clean source archive can be unpacked into a fresh folder without carrying personal data, and the GitHub repo remains available for the university assessment.

---

## 3. P1 — End-to-end browser behavior: test the REAL app

**Inspect:** `public/app.js`, `public/index.html`, `public/styles.css`, `test-support/browser.cjs`, and `test-support/lists-browser.cjs`.

Run locally on Windows:

```powershell
cd "$HOME\GrocerGlow"
npm ci
npm test
npm run test:browser
npm run test:lists
```

If the chosen browser isn't available, configure `GROCERGLOW_BROWSER=chrome` in PowerShell or install the documented browser dependency; explain any environment-only issue. Do **not** turn off a failing test just to make the report green. Ensure browser suites use temporary SQLite files and a test server, not the production database.

### P1.1 Core item CRUD and original regressions

- [ ] Add an item with a name, positive integer quantity and unknown price.
- [ ] Add an item with a valid zero price; distinguish `0` from `null`.
- [ ] Edit name, quantity and price; backend responds successfully, new values persist and budget recalculates.
- [ ] Specifically verify the historical payload `{ "name": "qq", "quantity": 2, "price": 45 }` on an existing item **through the visible Edit form**.
- [ ] Clear an existing price and confirm it persists as `null`.
- [ ] Toggle purchased/unpurchased status and reload; `completed` is preserved.
- [ ] Confirm toggling purchased status does **not** reduce the overall estimated spend.
- [ ] Delete and reload; verify the item is actually absent from SQLite.
- [ ] Reject empty names, noninteger/negative/zero quantities, negative/nonfinite prices, missing records, malformed JSON and invalid IDs without data loss.
- [ ] Check network failures: show readable feedback, restore UI consistency and avoid a “Saved” message when the save failed.

**Acceptance:** Every action works without a console error and survives refresh/server restart as appropriate.

### P1.2 Multiple lists and Shop Again

- [ ] Create, rename, select and delete lists, confirming protection of the final remaining list.
- [ ] Confirm items, budgets and currencies are independent per list.
- [ ] Confirm list selection after page refresh, including when the previously selected list has been deleted.
- [ ] Confirm Shop Again creates a **new** list, preserves the original, copies names/quantities/budget/currency, resets checkboxes and honors the optional copy-prices choice.
- [ ] Confirm `copyPrices=false` yields unknown prices, not false zeroes.
- [ ] Test stale requests and quick list switches while saves are pending; ensure responses never write to or display under the wrong list.
- [ ] Validate loading, empty, error and confirmation UI states.

### P1.3 Shopping Mode

- [ ] Enter/exit Shopping Mode using the visible navbar action.
- [ ] Display correct completed count and list name.
- [ ] Move completed items to the bottom, with consistent order among items of the same status.
- [ ] Uncheck an item and confirm it returns above completed items.
- [ ] Verify the checked state persists through refresh and a process restart.
- [ ] Verify larger mobile hit targets, keyboard operation, visible focus and no accidental deletion.
- [ ] Verify return to planning works from all intended actions.
- [ ] **Investigate keyboard focus after checking a product:** current `renderItems()` rebuilds the list with `replaceChildren()`. This may discard focus from the checkbox that the user just activated. If reproduced, restore focus to the matching product/checkbox after rerender without introducing stale DOM state.

### P1.4 Budget logic and currency safety

- [ ] Test normal, exact-budget, over-budget, no-budget and zero-budget cases.
- [ ] Include totals with unknown prices; keep an explicit warning for those missing estimates.
- [ ] Check decimal arithmetic for cases such as `0.1 + 0.2`, larger quantities and repeat edits; decide whether cent-based rounding is needed to avoid visible monetary artifacts. Do not accidentally reinterpret already-saved unit prices.
- [ ] Confirm the numeric price fields make sense for currencies with 0 or 3 decimal minor units; use `Intl` formatting consistently, document the application's input precision policy, and avoid promising true currency conversion.
- [ ] Confirm manual currency dropdown loads from `GET /api/currencies` and that selections persist **per list**.
- [ ] Confirm selecting the current currency leaves saved prices and budget unchanged.
- [ ] Confirm switching to a *different* currency does not silently relabel old monetary values.
- [ ] Verify the current explicit reset-confirmation flow: cancel must preserve data; confirm may clear only that list's monetary values, with a clear warning that it is irreversible. Do **not** alter another list.
- [ ] Test currency operation errors and duplicate interactions; preserve UI and data integrity.

**Acceptance:** Values remain mathematically and semantically correct, including after switching lists and restarting the server.

### P1.5 Location and local price search

- [ ] Test real user-initiated geolocation in Chrome/Edge on the student's machine **and** mocked success/failure cases in automation.
- [ ] Ensure latitude/longitude are rounded **before** they leave the browser and are not saved in localStorage or leaked in price-search URLs.
- [ ] Check that backend Nominatim queries choose a genuine `city`, `town`, `village` or `hamlet`, not a district/municipality mislabeled as a town.
- [ ] If no settlement is available, show the country result and leave the area manually editable; never invent a town name.
- [ ] Test permission denied, location timeout, unsupported browser, external API timeout, rate limit, failed country/currency mapping, and manual fallback.
- [ ] Check that detecting a matching currency **still updates the town** (no early-return bug).
- [ ] Confirm the search-area fields in the sidebar and Settings dialog stay synchronized and persist as a *browser preference*.
- [ ] Check the user can override inaccurate detected locations.
- [ ] Confirm Find Local Prices opens an encoded query for the **current** item, entered area and selected currency, without coordinates or arbitrary executable URLs.
- [ ] If area is missing, give a clear prompt and keyboard-accessible path to enter it.
- [ ] Review actual Nominatim acceptable-use requirements and attribution, including identifiable User-Agent or contact details if needed, cache behavior and rate limits. The current backend uses a static educational User-Agent, per-process memory cache and a 1.1-second throttle; review whether these are appropriate for the intended usage. Do not insert the student's personal email into public source without permission.
- [ ] Never scrape Google or retailer prices automatically unless the requirements change. Users research estimates manually.

---

## 4. P1 — Mobile, accessibility and visual finish

**Inspect:** `public/index.html`, `public/styles.css`, `public/app.js`.

### Responsive verification

- [ ] Test at least **320px, 375/390px, 600px, 768px, 1024px and 1440px** viewport widths. Save screenshots.
- [ ] Check the navbar remains useful and unobstructed on small screens. **Keep it** (My Lists, Budget, Settings, theme and Shopping Mode); do not remove navigation merely to make the screenshot cleaner.
- [ ] Test list picker, create/rename/delete controls, dialog buttons, Edit form, item actions and Shopping Mode with mobile-sized touch targets.
- [ ] Confirm no horizontal scrolling, clipped text, overlapping icons, inaccessible controls or modal content cut off by the on-screen keyboard.
- [ ] Confirm main text, item prices, helper text and warnings are comfortably legible. The current CSS has some 9–12px labels/footnotes; increase **important** mobile text rather than indiscriminately enlarging decorative text.
- [ ] Test long product names, long list names, long location names and currencies with longer symbols/codes.
- [ ] Review dark-mode contrast, hover/active states and percentage bar readability.
- [ ] Add a favicon if the final browser console still requests `/favicon.ico` and receives 404 (low priority).

### Accessible interactions

- [ ] Navigate the whole page with **Tab, Shift+Tab, Enter and Space**, without a mouse.
- [ ] Ensure dialogs trap focus appropriately, close with Escape, and restore focus to the opener when closed; the native `<dialog>` provides some of this, but verify the behavior.
- [ ] Ensure every form field has a visible label, every icon button has a useful accessible name, error messages are announced, and destructive operations are clearly described.
- [ ] Verify keyboard interaction with Find Local Prices (an `<a>` element with no `href` when disabled) and its unavailable-area state.
- [ ] Ensure focus remains visible and the Shopping Mode checkbox rerender does not strand keyboard users.
- [ ] Check semantic heading order, landmark navigation and the skip link.
- [ ] Respect reduced-motion preferences and avoid unnecessary motion.
- [ ] Run a basic automated accessibility audit (for example, axe with Playwright) if it can be added without unnecessary project complexity. Fix actionable problems and document any exceptions.

**Acceptance:** All primary workflows are usable via mouse, touch and keyboard; responsive screenshots demonstrate this.

---

## 5. P1 — Reliability, API and data-integrity review

- [ ] Audit `server.js` routes for duplicate definitions, unreachable handlers, incorrect HTTP statuses and uncaught exceptions.
- [ ] Confirm correct list scoping on **every** item query, update, delete and currency setting; a request for list A must never mutate list B.
- [ ] Confirm parameterized SQL; no user strings interpolated into SQL identifiers or statements.
- [ ] Check request-body type validation, `NaN`/Infinity behavior, extraordinarily large quantities or budgets, and payload limits. Add regression tests for actual discovered weaknesses.
- [ ] Confirm unsanitized names are rendered as **text**, not injected into HTML.
- [ ] Evaluate multi-request concurrency, rapid repeated clicks, network delays, aborted requests and stale frontend state. Fix proven failure cases.
- [ ] Verify database connection startup errors and migration failures are safe and informative.
- [ ] Verify migration idempotence, preserved item ID sequences, backups, foreign-key integrity and cascade-delete behavior using *temporary* legacy databases.
- [ ] Decide whether the development server should bind to `127.0.0.1` by default (rather than all interfaces), because GrocerGlow has no authentication; if changed, preserve configurable hosting and automated tests. Document the choice.
- [ ] Verify fresh installation on a clean Windows environment with **Node.js 22** and `npm ci`, including the actual native SQLite build requirements. Do not assume that a `node_modules` folder transferred from the student's PC will work on the examiner's PC.
- [ ] Avoid dependency churn and overengineering; use `npm audit` as an input, evaluate actual exploitability and make targeted updates only.
- [ ] Add or refine automated tests *only* where meaningful risks are currently uncovered.

---

## 6. P2 — Installation documentation, code comments and testing evidence

### README improvements

- [ ] Replace `cd C:\Users\User\GrocerGlow` with a generic folder/path example.
- [ ] Document exact supported Node.js version, Windows/macOS/Linux caveats, `npm ci`, `npm start`, app URL, optional `PORT`, and how to stop/restart the server.
- [ ] Explain the backend/frontend/database architecture in plain English and show a small request-flow diagram.
- [ ] Document the API routes and example request/response payloads, especially item edit and per-list settings.
- [ ] Document per-list budgeting, zero versus unknown prices, Shop Again, Shopping Mode, dark mode, and currency-change safeguards.
- [ ] Explain why local prices are found via **user-initiated Google search**, not a retailer pricing API; note search results are not guaranteed live prices.
- [ ] Explain consent-based location detection, country/city limitations, Nominatim terms/attribution, and the manual fallback.
- [ ] Document SQLite location, migration-backup behavior, temporary test DBs, Git ignore rules and clean setup from zero data.
- [ ] Include all working test commands and common troubleshooting steps, especially port conflicts, stale Node processes and browser permission failures.
- [ ] State known limitations accurately. Do not claim live currency conversion or accurate live supermarket prices.

### Testing evidence

- [ ] Save results of `npm test`, `npm run test:browser`, and `npm run test:lists` on Windows, including exact versions of Node.js and the browser.
- [ ] Create `docs/TEST_PLAN.md` (or equivalent) showing **test ID, scenario, steps/test data, expected result, actual result, PASS/FAIL, evidence**.
- [ ] Include desktop and mobile screenshots, error-state screenshots where useful, and a list of resolved bugs.
- [ ] Include tests for the previous editing-HTTP-400 and currency-HTTP-404 regressions.
- [ ] Include a brief `docs/TECHNICAL_DECISIONS.md` or an equivalent README section explaining Node/Express, SQLite, vanilla JS, REST, validation, third-party APIs via backend, currency decisions and iterative migration.
- [ ] Add only helpful code comments explaining tricky logic; don't drown simple code in comments.
- [ ] Record any concept changes since Phase 1, and *why* (for example: Google price-search links instead of automatic store-price import, settlement location detection, multi-list storage).

---

## 7. P2 — IU deliverables (not necessarily code changes)

**Authoritative source:** `Assignments Portfolio_DLBCSPJWD01.pdf` supplied for this project. The student or tutor should confirm the active assignment version and any later instructions.

### Assignment technical checks

- [ ] A real **browser-running** application, not just mockups: **implemented; verify by demonstration**.
- [ ] HTML/CSS/JavaScript frontend: **implemented**.
- [ ] A custom backend: **Node.js + Express implemented**.
- [ ] At least two dynamic frontend–backend interactions: **more than two implemented**, including item CRUD, list management and budget updates. Show them in the demo.
- [ ] Responsive at different screen sizes: **CSS exists; collect verified mobile/desktop evidence**.
- [ ] Persistence and retrieval: **SQLite implemented and backend-tested**.
- [ ] External data API consumption through the **backend only**: verify Nominatim remains backend-only; external search navigation is not frontend API data consumption.
- [ ] Document design choices, code intent and setup in README.
- [ ] Public GitHub repo and installable/exportable source files.
- [ ] Short desktop **and responsive** screencast, **no more than two minutes**; for Phase 2 the 1–2-minute demo should include voice-over or subtitles.

### Phase 2 presentation and submission

- [ ] Keep the **original Phase 1 presentation** and extend it by **no more than 10 additional slides** for Phase 2 (rather than starting an unrelated presentation).
- [ ] Add the **public GitHub repository link to the title slide**.
- [ ] Explain actual final frontend/backend technologies and the architecture.
- [ ] Include annotated screenshots of desktop and responsive views.
- [ ] Explicitly identify what changed from the initial concept and why, or say there were no changes.
- [ ] Demonstrate tested functionality and include test cases if they aren't already coded.
- [ ] Record a 1–2-minute application demonstration with narration or subtitles, including the responsive view; integrate it with the presentation in the form required by current PebblePad/course instructions.
- [ ] Enter the public GitHub URL in the PebblePad submission text field as required.
- [ ] Save final PPTX and inspect it in PowerPoint before submission.

### Phase 3 finalization (after tutor feedback)

- [ ] Incorporate tutor feedback; document what changed.
- [ ] Extend the existing presentation by **no more than 10 additional slides** for Phase 3, emphasizing solution breakdown, development process and lessons learned.
- [ ] Submit the updated PPTX, GitHub link and a clean exported **source-code ZIP** through PebblePad according to instructions.

**Codex can prepare code, documentation, a slide outline and a recording script, but it must not claim that the student recorded a video, submitted via PebblePad, obtained tutor feedback, or validated a phone/browser without actually doing so.**

### IU grading categories to keep visible

| Category | Weight |
| --- | ---: |
| Problem solving / objective | 10% |
| Methodology / ideas / procedure | 20% |
| Implementation quality and documentation | 40% |
| Creativity and correctness | 20% |
| Formal submission requirements | 10% |

Focus on **tested correctness, explained decisions and complete submission evidence** rather than adding unrelated features.

---

## 8. What NOT to do

- [ ] **Do not delete GitHub** merely because Codex no longer uses it. It is an IU submission requirement. You may disconnect Codex's GitHub access if desired while retaining the repository.
- [ ] Do not put `.git`, `node_modules`, local databases, database backups, precise coordinates, personal data or credentials in the final source ZIP.
- [ ] Do not discard existing code or rewrite the app in another framework.
- [ ] Do not silently wipe user prices/budgets during currency changes, migrations or debugging.
- [ ] Do not simulate real shop prices, exchange rates, city names or completed tests.
- [ ] Do not add paid APIs or requirements for the examiner to create third-party accounts.
- [ ] Do not spend time inventing features beyond the university scope before the current app is fully tested.
- [ ] Do not alter the user's GitHub repository, publish personal data, or make destructive data changes without clear authorization.

---

## 9. Final acceptance matrix (all must have evidence)

| ID | Requirement | Evidence of completion |
| --- | --- | --- |
| A01 | Clean install and start | Fresh `npm ci` + `npm start`, screenshot/log |
| A02 | Existing SQLite data preserved | Before/after database integrity checks |
| A03 | Item CRUD and previous edit regression | HTTP and browser tests pass |
| A04 | Independent multiple lists | Create/edit/delete/switch tests pass |
| A05 | Shop Again | Default and copy-prices scenarios pass |
| A06 | Budgets and unknown-price notices | Unit/integration and browser test results |
| A07 | Manual currencies and no fake conversion | Reset/cancel/per-list safeguards verified |
| A08 | City/country detection and manual fallback | Real machine check + mocked tests |
| A09 | Local price search | Verified encoded URLs and browser actions |
| A10 | Shopping Mode and persistence | Desktop/mobile and keyboard tests |
| A11 | Light and dark themes | Screenshot, contrast, persisted preference |
| A12 | Responsive interface | 320–1440px screenshots with no overflow |
| A13 | Accessibility | Keyboard path and documented audit |
| A14 | API/database test suite | `npm test` passes in clean environment |
| A15 | Browser test suites | Both Playwright suites pass on student's PC |
| A16 | Privacy and deployment safety | Ignored data, clean ZIP, safe binding/policy review |
| A17 | README and technical decisions | Reproducible documented setup |
| A18 | Public GitHub ready for IU | Student verifies public URL and latest source |
| A19 | Phase 2 presentation and demo | Student-reviewed PPTX and 1–2 min video |
| A20 | Phase 3 readiness | Defined feedback follow-up and ZIP process |
| A21 | Codebase quality and cleanup | Static checks, code review, removed-dead-code inventory, regression test results |
| A22 | Dependency hygiene | Dependency inventory, explicit keep/remove decisions, lockfile/`npm ci` verification |
| A23 | GitHub repository functionality | Remote/branch/history verified, GitHub URL opens with intended access, latest commit present |
| A24 | Fresh-clone reproducibility | Fresh clone, `npm ci`, `npm start`, backend and browser tests documented |
| A25 | No personal data in current repo/history | Tracked files and history assessed; remediation plan if previously exposed |
| A26 | Clean release/export package | Inspected manifest and extraction + startup test without excluded material |
| A27 | Code quality automation | `npm run check`/lint/format or justified equivalents running on the actual source |
| A28 | GitHub workflow/CI | Existing Actions checked or minimal appropriate CI established with real passing runs; otherwise marked pending |

**Definition of done:** Every code-related item is `PASS` or `FIXED + PASS`, and every human-dependent university item is explicitly marked as completed by the student or left as `PENDING STUDENT ACTION`. No fabricated “100%” completion report.

---

## 10. Required output from Codex

Before changes:
1. **Repository audit:** what actually exists now, which tests were run, and which issues are verified vs suspected.
2. **Prioritized plan:** P0 safety and packaging → P1 real-browser quality/reliability → P2 documentation and submission support.

After changes:
1. **Root-cause report** for every verified defect, with file names and relevant line references.
2. **Change log** with the precise files edited and the user-visible effect.
3. **Test report** with commands, environment, pass/fail counts, screenshots/logs where appropriate, and anything not tested.
4. **Data-protection statement** confirming whether any migration took place and whether any real user database was touched.
5. **IU readiness report** separating completed technical criteria from still-pending screenshots, videos, GitHub publication, PPTX or PebblePad work.
6. **Student walkthrough** explaining the key technical decisions, in straightforward terms.
7. **Clean source ZIP instructions** and a check that its contents match the README.
8. **Code health report:** dead code, duplicated behavior, dependencies kept/removed, style/validation tooling and refactor tests.
9. **GitHub validation report:** repo URL, branch/commit SHA, remote divergence, public access status, fresh-clone result, workflow/CI status, tracked/ignored data, and any permissions blockers.
10. **Deletion/cleanup register:** each removed file, dependency or code path, rationale, and how replacement behavior was verified.

## 11. P0/P1 — Professional code cleanup, standards, and removal of unnecessary material

**This is an explicit required deliverable, not optional cosmetic polish.** Inspect the **real** repository, not only the uploaded snapshot. The goal is a smaller, cleaner, more consistent and maintainable version of the *same working app*.

### 11.1 Establish a safety baseline before refactoring

- [ ] Record `git status --short`, `git branch --show-current`, current commit SHA, Node/npm versions, existing source-file sizes, package versions, baseline test counts and current visible functionality.
- [ ] Check for uncommitted student work. Do **not** overwrite it, run `git reset --hard`, `git clean -fd`, force-push or erase history as a shortcut.
- [ ] Protect the existing SQLite database and backups; do not read/write real-user records as part of cleanup tests unless needed and explicitly approved.
- [ ] Create a reviewable feature/cleanup branch if doing a substantial refactor; preserve a simple rollback path.
- [ ] Classify findings as **confirmed defect**, **confirmed unnecessary**, **style/readability opportunity**, **risk requiring test**, or **intentional design**. Don't conflate these.

### 11.2 JavaScript/Node.js structure and coding conventions

**Inspect:** `server.js`, `database.js`, `public/app.js`, test scripts. The reviewed snapshot's `public/app.js` is about **835 lines**; size alone does not prove a defect.

- [ ] Map responsibility and dependencies of every module and large function. Identify unused functions, unreachable branches, stale fallback paths, duplicated validation, repeated event listeners, obsolete migration workarounds and accidental console/debug statements.
- [ ] Remove proven dead code and obsolete comments; first search for call sites, HTML IDs, CSS classes, route consumers and test references to avoid breaking dynamic behavior.
- [ ] Keep frontend state and DOM rendering understandable. Separate unrelated concerns into small, appropriately named functions/modules **only if it improves clarity**; avoid turning a student project into a large architecture.
- [ ] Audit async functions for missing `await`, unhandled rejections, stale state after rapid user actions, double submissions, event-listener accumulation, and correct loading/error/reset behavior.
- [ ] Audit route handlers for repeated validation/error handling, duplicate endpoints, overly broad `try/catch`, swallowed exceptions and inconsistent HTTP/JSON response formats.
- [ ] Verify robust parsing of IDs, prices, quantities, budgets and currency codes. Check edge cases including `null`, empty strings, `0`, non-finite numbers and incorrect types.
- [ ] Use descriptive names, consistent casing, consistent semicolons/quotes/indentation, `const` where possible, and no unused imports or variables. Avoid arbitrary code-style rewrites that obscure useful Git history.
- [ ] Keep SQL organized and parameterized; protect correct per-list isolation, transaction boundaries and migration paths.
- [ ] Keep existing browser compatibility with Node 22 and common current browsers. Do not introduce framework/bundler requirements without explicit need.
- [ ] Add concise comments to explain **why** complicated logic exists (migration, currency safeguards, location limitations), not line-by-line narrations of obvious statements.
- [ ] If extracting modules from `app.js`, verify initialization order, bundling/ES module support and script loading in `index.html`; don't break plain static serving.

### 11.3 HTML/CSS/UI consistency

- [ ] Audit `index.html` for obsolete/duplicated elements, missing `id` targets, unused `data-*` attributes, duplicate IDs, inaccessible control labels, broken links and conflicting modal markup.
- [ ] Audit CSS for unused selectors **carefully**: classes may be added dynamically by JavaScript. Search JS code and all UI states before removing a selector.
- [ ] Consolidate clearly duplicated declarations, unnecessarily overridden rules and repeated magic colors into simple CSS custom properties where beneficial.
- [ ] Keep green/white branding, contrast, responsive layouts, and the useful navbar; clean styles without a wholesale redesign.
- [ ] Remove outdated prototype UI, accidental placeholder text, debug widgets and obsolete buttons only after confirming they are not promised features.
- [ ] Verify no image/icon/font reference points to a nonexistent asset. Add a small favicon if useful and license-safe.
- [ ] Preserve semantic HTML, keyboard access, error feedback and dialogs after any UI cleanup.

### 11.4 Dependency, package and toolchain hygiene

**Current snapshot:** Express 5, `better-sqlite3`, `country-to-currency`, Playwright, and a direct development dependency on `node-gyp` (verify whether it is actually needed).

- [ ] Run `npm ls --depth=0` and inspect direct dependencies against their actual imports and script usage.
- [ ] **Specifically investigate `node-gyp`** in `devDependencies`: keep only if explicitly necessary for reproducible native builds or project scripts; do not remove solely because it looks unusual.
- [ ] Check whether Playwright must remain a dev dependency for the included browser suites (likely yes); do not remove test tooling simply to reduce package count.
- [ ] Run `npm audit` and interpret findings based on severity, actual exposure and compatibility. Avoid disruptive blind `npm audit fix --force` updates.
- [ ] Remove packages that are conclusively unused; update `package.json` and regenerate `package-lock.json` consistently.
- [ ] Fill meaningful `package.json` metadata (description, scripts, package entry) and review the default `ISC` license field so it does not misstate the student's intended licensing. Do **not** add a license commitment without approval.
- [ ] Provide useful and reliable commands for `start`, `test` and, where valuable, `check`, `lint` and `format:check` (or explain why lightweight equivalents were chosen).
- [ ] Prefer ESLint and Prettier **only if their ongoing value outweighs added complexity**; configure rules for genuine defects and consistency. Do not add hundreds of noisy rules for no benefit.
- [ ] Validate lockfile integrity with `npm ci` in a clean directory and rerun tests after changes. Do not commit `node_modules`.
- [ ] Keep test code isolated and concise; remove duplicate test utilities only if equivalent regression coverage remains.

### 11.5 Cleanup inventory — inspect before deleting

- [ ] Identify and remove **generated/unneeded** local export artifacts and old release ZIPs from the intended source tree, but don't delete personal project backups or historical deliverables without approval. Put them outside the repository if the student wants to retain them.
- [ ] Exclude `.git/`, `node_modules/`, `*.db`, SQLite `-wal` and `-shm`, database backups, `.env*`, browser test traces/videos, cache directories, OS temp files, IDE caches, logs, coverage reports and local generated ZIPs from any source distribution, **unless a specific non-sensitive fixture is required and documented**.
- [ ] Confirm `.gitignore` exists and works; remember `.gitignore` does **not** automatically untrack previously committed files.
- [ ] Detect stale README copies, temporary scripts, unused images, unreferenced CSS/JS and historical prototypes; document why each is needed or safe to remove.
- [ ] Search for exposed keys, contact information, personal paths, precise coordinates, database content, `.env` secrets, backup files and accidental browser artifacts across tracked files.
- [ ] Verify the completed project still supports fresh installs, legacy database migration and all promised IU features after deletion.
- [ ] Provide a **cleanup register**: path/package/symbol removed, reason, safety check, rollback pointer.

### 11.6 Automated checks and change validation

- [ ] Run `node --check` on every authored JS/CJS file after refactoring.
- [ ] Apply a consistent formatter or verify formatting manually; don't reformat unrelated code unless there is real value.
- [ ] If linters/formatters are introduced, add documented scripts and verify clean runs.
- [ ] Run `npm test`, `npm run test:browser` and `npm run test:lists` **before and after** important refactors, plus targeted tests for defects discovered.
- [ ] Check the application manually on desktop/mobile for regressions caused by changed classes, event handlers or script loading.
- [ ] Audit browser console and server output for unexpected errors; remove temporary diagnostics while retaining useful actionable errors.
- [ ] Compare before/after size and complexity only as context; success means **simpler working code**, not the fewest lines.

**Code-cleanup acceptance:** A reviewer can follow major functions, understand the data flow, run documented checks, and identify no known duplicate/dead code or unnecessary direct dependencies. All original and new regression tests pass. Any deliberate residual issues are documented.

---

## 12. P0/P1 — Git and GitHub must be tested end-to-end

**GitHub remains part of the IU submission even if Codex works locally.** A successful `git push` or 'Everything up-to-date' message alone does **not** prove that the correct source is published or that a fresh user can install it. Verify **both the local repo and the actual GitHub repository**.

**Known intended repository URL (confirm owner, spelling and current status):** `https://github.com/Markus2401/GrocerGlow`. This was supplied earlier by the student; do not infer that it is public or currently accessible.

### 12.1 Local repository integrity

- [ ] Run `git status --short`, `git branch -vv`, `git remote -v`, `git log -5 --oneline --decorate`, `git rev-parse HEAD` and check current branch.
- [ ] Run `git fetch origin` where credentials/connectivity permit, then check divergence from `origin/main` using `git status -sb` or `git rev-list --left-right --count main...origin/main`.
- [ ] Check for modified/untracked working files, ignored files that should be tracked, and tracked junk/private data that should not be tracked.
- [ ] Run `git ls-files` to confirm all required application/test/documentation files are present and no unwanted binaries or backups are tracked.
- [ ] Verify `.gitignore` ignores intended files with `git check-ignore -v PATH` where practical, and add missing patterns.
- [ ] Check branch naming, default branch and whether the README's installation instructions match that branch.
- [ ] Avoid unnecessary Git LFS, submodules, giant binaries and historical ZIP copies inside the source repository.

### 12.2 Remote GitHub verification — perform real remote checks

- [ ] Authenticate through the available GitHub integration or Git CLI if permitted. If authentication fails, report **NOT VERIFIED — PERMISSION NEEDED** rather than guessing.
- [ ] Verify the repo exists, belongs to the intended account, and is not a wrong or duplicate repository.
- [ ] Verify that the current remote branch, commit SHA, file tree and README match the working code expected for the IU assignment.
- [ ] Verify HTTPS remote clone/read access and identify whether the repository is currently private or public.
- [ ] **Test the repository URL while signed out** (browser/incognito or equivalent non-authenticated request) when preparing the IU public submission. A private repository may be intentional during development; don't change its visibility without the student's permission.
- [ ] Verify the README renders cleanly on GitHub, links work, and images/screenshots actually exist when linked.
- [ ] Verify the GitHub repository contains the test suites, source, package manifests, `.gitignore` and documentation. Ensure no required source is omitted by `.gitignore`.
- [ ] Check accidental committed databases, `.env`, credentials, local paths or other personal data in the **current HEAD and relevant Git history**. If exposed, stop and propose safe remediation; do not rewrite public history or rotate credentials without approval/coordination.
- [ ] Check repository size and large tracked files. Remove redundant archives from future commits after student approval, but preserve meaningful assignment evidence.
- [ ] Review GitHub Actions/workflow results if any, including actual logs for failures and environment-specific problems.
- [ ] For a currently private repo, confirm there is a clear student-approved path to making it public before IU Phase 2 submission.

### 12.3 Fresh-clone reproducibility test (required)

- [ ] With authorization and access, clone the actual remote repository into a **new empty temporary directory**. Do not run this test within the student's existing project tree.
- [ ] Inspect that clone for precisely the expected files and no sensitive material.
- [ ] Use the documented Node version, `npm ci`, database initialization, and `npm start`; confirm the app responds at the documented URL.
- [ ] Run `npm test`, `npm run test:browser`, and `npm run test:lists` in the clone. If browser binaries need installation, follow/document legitimate prerequisites rather than disabling tests.
- [ ] Verify initial blank-database behavior, creation of an item/list, refresh persistence and meaningful error handling **using only the clone's temporary database**.
- [ ] Run `npm audit` as a diagnostic; capture actionable results and any exceptions.
- [ ] Compare the test clone's commit SHA to the latest intended commit and record it in the GitHub report.
- [ ] Record OS, Node/npm versions, exact commands, exit codes and pass/fail counts. No 'works on GitHub' claim without this evidence.

### 12.4 Optional but valuable: GitHub Actions CI

- [ ] Inspect whether `.github/workflows/` already has test automation. If present, fix obsolete scripts and validate actual runs.
- [ ] If lightweight and appropriate, add one GitHub Actions workflow that runs on pull requests and pushes to `main`, uses Node.js 22 and `npm ci`, and executes reliable lint/syntax and backend tests.
- [ ] Add headless browser tests to CI only if Playwright browser installation is reproducible and runtime acceptable; otherwise keep them as documented local acceptance tests.
- [ ] Ensure CI uses **test-only databases**, not a copied real database or any sensitive project secret.
- [ ] Review actual workflow outcomes on the remote. Merely writing workflow YAML does not mean CI passes.
- [ ] Do not add deploy credentials, unnecessary secrets, paid CI integrations, branch protections or complicated release pipelines for this university project.

### 12.5 Git workflow and consent rules

- [ ] Keep changes in small meaningful commits with messages such as `Fix currency validation`, `Refactor item rendering`, `Improve browser tests`, and `Document clean setup`.
- [ ] Prefer a cleanup branch/PR for substantial refactors so the student can inspect changes before merging.
- [ ] If Codex can only edit local files, provide exact safe commands to stage, review, commit and push; report which remote checks require the student.
- [ ] Never force-push, delete branches/repositories, change GitHub visibility, merge a PR, push to the student's repository or publish data **without permission**.
- [ ] If the student elects to disconnect Codex from GitHub, do so independently of the IU-required repository; the source repo must remain available.

**GitHub acceptance:** The student and IU assessor can open the intended public URL (when approved), see current source and README, clone it afresh, install it and reproduce the documented tests. The remote branch/commit and any CI status are explicitly verified. There are no known sensitive files in the published tree.

---

## 13. P1/P2 — Security, privacy, error handling, and release hardening

- [ ] Perform a targeted security review of all Express endpoints: validation, path parameter scoping, unexpected request bodies, malformed JSON, large payloads, error responses and potential information leaks.
- [ ] Verify safe handling of user-entered product names, list names and location values in the DOM and external-search links; avoid `innerHTML` with untrusted content.
- [ ] Confirm only expected backend calls external geocoding providers, with a timeout, reasonable rate limits, caching, attribution and user-approved location sharing.
- [ ] Avoid exposing the unauthenticated development server on the public internet or local network without explicit deployment protections; document local-only use.
- [ ] Review sensitive console/server logging and remove raw precise coordinates or personal data where not needed.
- [ ] Check error-state accessibility, disabled/loading states and recovery when network requests fail.
- [ ] Validate fresh database setup, read-only/unwritable-database failures, backup errors and graceful startup messages.
- [ ] Test safe handling of browser storage being unavailable, stale preferences and user-cleared browser data.
- [ ] Keep secrets out of the repo, docs, code examples and GitHub Actions logs.
- [ ] Perform `npm audit`; document any remaining vulnerabilities and why they're not fixed. Do not claim 'secure' based only on no audit warnings.
- [ ] Keep deliberate product limitations documented: not authenticated, not an online retailer-price database, not an FX conversion tool, and not a production multiuser service.

**Acceptance:** No known high-risk avoidable defect remains in intended local-use scope; vulnerabilities and limitations are explained and reproducible tests still pass.

---

## 14. Mandatory final evidence and completion gate

Codex must deliver the following **in addition to** the general report in Section 10:

1. **Code cleanup inventory:** exact deleted files/lines/imports/dependencies, removed duplicates, reason for each removal, and how regression was ruled out.
2. **Coding standards report:** JS/HTML/CSS style conventions applied, linter/formatter or rationale, check command(s), lint result and any deliberate exceptions.
3. **Dependency report:** before/after direct dependencies, `node-gyp` decision, lockfile sync, `npm ci` result and `npm audit` assessment.
4. **Repository report:** actual GitHub URL, Git remote, default branch, published commit SHA, access/visibility, contents check, any history exposure concern and whether student approval is still needed.
5. **Fresh-clone report:** path to temporary clone (not published), install/start/test commands, test totals, browser environment and any blockers.
6. **CI report:** existing or created workflows, actual remote run links/status or a clear statement that CI was not configured and why.
7. **Functional report:** pre/post-refactor regression tests including item edit, multi-list separation, currency safety, Shopping Mode, local price search and migration.
8. **Accessibility/mobile report:** viewport coverage, screenshots, keyboard check, findings and fixes.
9. **Data and privacy report:** state of real database, backup integrity, ignored/tracked files, sensitive data in current tree/history and any unperformed checks.
10. **IU evidence report:** exactly which Phase 2/3 technical and formal requirements are verifiably complete, versus those requiring student input (video, tutor feedback, PebblePad and public visibility approval).
11. **Simple student walkthrough:** summarize the architecture and 5–10 highest-impact improvements so the student can explain their own work.
12. **Final pass/fail matrix:** mark every A01–A28 criterion **PASS**, **FIXED + PASS**, **FAIL**, **NOT TESTED**, or **PENDING STUDENT ACTION**, including evidence/commands. No unchecked item may be silently called 100% complete.

**Final delivery threshold:** Do not claim the code is 100% ready unless every relevant code/test/GitHub criterion is verified. If external permissions, real-device testing, release visibility or university materials remain pending, explain them as explicit blockers rather than hiding them.

---

### Copy/paste prompt to start Codex

> Read `GROCERGLOW_CODEX_FINAL_COMPLETION_CHECKLIST_V2.md` completely, especially Sections 11–14. Inspect the actual current GrocerGlow code and my GitHub repository. **Do a real professional cleanup of unnecessary/dead/duplicated code, obsolete files, CSS, comments and unneeded npm dependencies; standardize coding style without overengineering or breaking working features.** Inspect and TEST GitHub end-to-end: remote branches, tracked files, published commit, visibility, security hygiene, a fresh clone, clean install, all test suites and appropriate GitHub Actions if useful. **Preserve my SQLite data, existing design, features and migration behavior.** Establish a baseline, make reviewable changes, run tests before and after, and explain every significant removal/refactor. Do not claim success without actual evidence. Do not delete my GitHub repository because IU requires it. Obtain my approval before publishing, force-pushing, changing repo visibility or performing destructive actions. Return the required PASS/FAIL/NOT TESTED matrix, cleanup register, GitHub report, test evidence and remaining IU tasks.

---

*End of GrocerGlow V2 final completion handoff — includes repository, coding standards and safe cleanup.*
