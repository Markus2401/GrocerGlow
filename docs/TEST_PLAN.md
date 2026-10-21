# Test plan and verified results

Reviewed **21 October 2026**. Local environment: Windows 11 x64, Node **22.22.3**, npm **10.9.8**, Edge **155.0.4283.62**. Tests create independent SQLite files, use synthetic locations and intercept external search navigation. No suite uses the student's database or requests real GPS.

## Published application evidence

GitHub `main` commit **8736aec62c073e7f12e353cf1174b049085b8bd6** was cloned from the actual private repository into a new directory. Clean `npm ci`, syntax/format checks, **32 backend tests**, **three browser suites**, dependency audit, normal startup and restart persistence passed. The [main Actions run 39568677971](https://github.com/Markus2401/GrocerGlow/actions/runs/39568677971) passed on Windows/Node 22.22.3, including installation, all suites and the audit. These are results for the published application, not an unpublished cleanup commit.

## Cleanup validation

Before and after cleanup, syntax, formatting, all 32 backend tests and all three browser suites passed. Dependency audit reported zero known vulnerabilities. A freshly exported 37-file cleaned source installed with `npm ci` and passed those same checks, all suites and the audit. Actual `npm start` served the homepage, accepted item/list creation and preserved both across restart in its separate test database. The personal SQLite file retained its exact SHA-256 hash, passed a read-only integrity check and had no foreign-key violations. All application features, scenarios and dependencies are retained. Generated browser output is separated from selected assessment images. A new remote run can only be verified after approved publication; the accompanying cleanup report records exact commands and source identity.

## Executable cases

| ID  | Scenario and steps/data                                                              | Expected                                                                | Actual / status                                                            | Evidence                                      |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| T01 | GET `/api/currencies`                                                                | Supported ISO array, 200                                                | PASS                                                                       | integration suite                             |
| T02 | Create item; PATCH `{name:"qq",quantity:2,price:45}` without completed; restart      | Edit accepted, omitted state preserved, total90                         | PASS HTTP + visible browser Edit                                           | integration + audit browser                   |
| T03 | Mixed/partial edit, zero, null price, invalid body/types/IDs                         | Preserve omissions, zero differs from unknown, invalid writes rejected  | PASS                                                                       | integration + hardening                       |
| T04 | Check/uncheck, reload/restart                                                        | Stored boolean; estimated total unchanged                               | PASS                                                                       | integration + both shopping browser suites    |
| T05 | Delete item; reload; inspect temporary database                                      | Item absent, other data intact                                          | PASS                                                                       | integration + browser                         |
| T06 | Create/rename/select/delete lists; protect final list                                | Independent items/budgets/currencies; scoped cascade                    | PASS                                                                       | integration + list browser                    |
| T07 | Shop Again, copyPrices false/true incl zero/null                                     | New IDs, unchecked, optional estimates; original untouched              | PASS                                                                       | integration + list browser                    |
| T08 | Normal/exact/over/no/zero budgets; unknown price; 0.1+0.2                            | Correct warnings/remaining/percentage; no false overspend               | PASS                                                                       | shopping browser + money test + audit browser |
| T09 | Switch same/different currency; cancel/confirm                                       | No fake conversion; confirmed reset only selected list                  | PASS                                                                       | integration + browser suites                  |
| T10 | Currency PATCH succeeds, next GET fails                                              | New currency/cleared amounts remain visible; refresh warning            | PASS                                                                       | audit browser                                 |
| T11 | Budget save returns503                                                               | Error, restore last saved budget                                        | PASS                                                                       | audit browser                                 |
| T12 | Delay save, attempt list switch; failed list GET                                     | Locked during save, failed load retains old list                        | PASS                                                                       | list browser                                  |
| T13 | Hold geolocation callback, then supply rounded position                              | Selected list cannot change while permission is pending                 | PASS                                                                       | audit browser                                 |
| T14 | City/town/village/hamlet; municipality/county-only                                   | Genuine settlement or manual fallback                                   | PASS mocked                                                                | integration/location/browser                  |
| T15 | Denied/unavailable geolocation; provider timeout/bad JSON/unknown country/rate limit | Manual fallback; bounded cache/throttle, no overlapping requests        | PASS mocked/service tests; real permission timeout UI not separately timed | location + browser                            |
| T16 | Item/area punctuation and script-like text; open search                              | Safe text, encoded Google query with active currency, no GPS            | PASS                                                                       | shopping browser                              |
| T17 | Empty area, keyboard search                                                          | Guidance and area-input focus                                           | PASS                                                                       | shopping browser                              |
| T18 | Shopping Mode; Space check/uncheck and sorting                                       | Progress/persistence, focus stays on corresponding checkbox             | PASS                                                                       | shopping + list + audit browser               |
| T19 | Theme toggle/reload; long names; six viewport widths                                 | Saved theme, no horizontal overflow                                     | PASS                                                                       | screenshots + audit browser                   |
| T20 | Dialog Enter/Tab/Shift+Tab/Escape                                                    | Trap boundary and return to opener                                      | PASS                                                                       | audit browser                                 |
| T21 | Axe WCAG2A/AA and WCAG21AA scans                                                     | No detected violations in tested states                                 | PASS                                                                       | generated `test-results/accessibility.json`   |
| T22 | Block localStorage/sessionStorage; stale deleted-list preference                     | App remains usable; valid fallback list                                 | PASS                                                                       | audit browser                                 |
| T23 | KWD0.001 ×3, fractional JPY1.234                                                     | Inputs and displayed precision retained; no conversion                  | PASS                                                                       | audit browser                                 |
| T24 | Malformed/large JSON, wrong media type, excessive numbers                            | 400/413/415, generic errors, no partial data writes                     | PASS                                                                       | hardening                                     |
| T25 | Legacy populated/empty database with sequence99; backup blocked                      | Verified snapshot, rows/IDs/settings preserved; safe abort; idempotence | PASS                                                                       | migration suite                               |
| T26 | Normal server start/restart on tempDB; occupied port; invalid DB path                | Loopback response, persistence, clear startup failure                   | PASS                                                                       | hardening                                     |
| T27 | Syntax, formatting, npm dependency audit                                             | Checks pass; lockfile clean install                                     | PASS; clean installation checked separately                                | check + format + npm audit                    |
| T28 | Real GPS, physical phone and screen reader                                           | Actual device/provider evidence                                         | PENDING student action                                                     | `IU_READINESS.md`                             |

## Reproduce the checks

```powershell
npm ci
npm run check
npm run format:check
npm test
npm run test:browser
npm run test:lists
npm run test:audit
npm audit
```

The backend reports **32 tests**, counting parent tests. Browser suites report **8 shopping**, **5 list** and **7 audit groups**. Missing suite files cause failure. Playwright uses installed Edge; select Chrome with `$env:GROCERGLOW_BROWSER = 'chrome'`.

| Suite                            | Distinct coverage                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `test/integration.test.cjs`      | Real HTTP CRUD, partial PATCH, currencies, list isolation, copy/delete and persistence                   |
| `test/migration.test.cjs`        | Legacy populated/empty data, backups, ID sequences, idempotence and safe backup failure                  |
| `test/location.test.cjs`         | Provider failures, cache, timeout contract, throttling, concurrency and HTTPS configuration              |
| `test/hardening.test.cjs`        | Invalid/large JSON, media type, bounds, IDs, headers, money precision and real entry-point failures      |
| `test-support/browser.cjs`       | Shopping, safe research links, manual/detected area, settings, mode and themes                           |
| `test-support/lists-browser.cjs` | List management, optional prices, isolation, delayed/failed requests and responsive controls             |
| `test-support/audit-browser.cjs` | Edit/reload, keyboard focus/dialogs, asynchronous errors, precision, storage fallback, long text and axe |

The suites remain because their failure modes differ. Axe scans cover 13 states using WCAG 2 A/AA and 2.1 AA tags, with no detected violations in verified runs. This does not certify complete accessibility.

## Generated output and selected evidence

`npm run test:audit` writes its full screenshot set and `accessibility.json` to ignored **`test-results/`**, preventing tests from rewriting assessment evidence. All six widths remain tested: **320, 390, 600, 768, 1024 and 1440px**. Other suites also exercise 375/1280px. Inspect newly generated output when reproducing results.

Six retained screenshots show distinct assessment states with synthetic data; long names deliberately stress wrapping:

- [Light desktop](evidence/light-1440.png) and [light 320px](evidence/light-320.png)
- [Dark desktop](evidence/dark-1440.png) and [dark 320px](evidence/dark-320.png)
- [Mobile settings](evidence/settings-mobile.png) and [Shopping Mode](evidence/shopping-mode.png)

Intermediate-width images and machine-generated accessibility JSON remain reproducible output rather than duplicate source evidence. No viewport assertions or scans were removed.

## Clean installation and data-safety procedure

1. Clone the intended published revision, or export the reviewed source with `scripts/export.ps1` and extract into a new empty directory.
2. Verify Node 22 and run `npm ci` without transferring dependencies.
3. Run every check above; record exit codes and suite counts.
4. Run `npm start` with a separate test database and loopback port. Verify homepage, item/list creation and persistence across a restart.
5. Inspect the export: no Git directory, dependencies, databases/backups, credentials or generated results. Compare source files with the tested revision.
6. Verify actual Actions conclusion and commit SHA after publication; local success does not prove remote CI.

## Remaining manual verification

Real GPS/OS permission flow, physical-phone touch/keyboard/zoom and screen-reader navigation remain pending. Browser permission-timeout duration was not independently timed. Provider failures are simulated rather than tested against the public geocoder. The original assignment PDF, presentation, video and submission are not certified by these tests. See IU_READINESS for student actions.
