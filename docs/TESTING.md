# Testing

## Methodology and results

The tests exercise real HTTP requests and SQLite persistence, browser workflows, failure handling and responsive layout. Each suite creates temporary databases and synthetic records. Geocoding uses controlled fixtures and price-search navigation is intercepted; automated tests do not use personal shopping data or real GPS.

Verified **22 October 2026** on Windows 11 x64, Node **22.22.3**, npm **10.9.8** and Edge **155.0.4283.62**: syntax and formatting checks, **32 backend tests** (including parent tests), all three browser suites and the dependency audit passed. The browser scripts report **8 shopping**, **5 list** and **7 additional groups**. A clean GitHub clone installed with `npm ci`, passed the same checks and started normally; separate test records survived a server restart. No known dependency vulnerabilities were reported at verification time.

[GitHub Actions](https://github.com/Markus2401/GrocerGlow/actions/workflows/check.yml) repeats installation, checks, all suites and the dependency audit on Windows/Node 22. Check the run's revision and conclusion when evaluating a later change; local success alone does not establish CI success.

## Test cases

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
| T28 | Real GPS, physical phone and screen reader                                           | Actual device/provider evidence                                         | PENDING manual check                                                       | Manual checks below                           |

## Run the checks

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

Playwright uses installed Edge. Select Chrome with `$env:GROCERGLOW_BROWSER = 'chrome'`. Missing suite files cause failure. Tests manage their own temporary servers and database cleanup.

| Suite                            | Coverage                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `test/integration.test.cjs`      | Real HTTP CRUD, partial PATCH, currencies, list isolation, copy/delete and persistence                   |
| `test/migration.test.cjs`        | Legacy populated/empty data, snapshots, ID sequences, idempotence and safe backup failure                |
| `test/location.test.cjs`         | Provider failures, caching, timeout contract, throttling, concurrency and HTTPS configuration            |
| `test/hardening.test.cjs`        | Invalid/large JSON, media types, bounds, IDs, headers, money precision and real entry-point failures     |
| `test-support/browser.cjs`       | Shopping, encoded research links, manual/detected area, settings, Shopping Mode and themes               |
| `test-support/lists-browser.cjs` | List management, optional prices, isolation, delayed/failed requests and responsive controls             |
| `test-support/audit-browser.cjs` | Edit/reload, keyboard focus/dialogs, asynchronous errors, precision, storage fallback, long text and axe |

The suites cover different failure modes. In particular, partial edits preserve omitted purchased flags, currency changes isolate resets to the selected list, and migration tests verify existing records and safe failure when a snapshot cannot be written.

## Responsive and accessibility evidence

The browser tests check long names, both themes and widths of **320, 390, 600, 768, 1024 and 1440px**; other suites also use 375/1280px. Keyboard tests cover checkbox focus, dialog Tab boundaries, Escape and opener focus. Axe scans cover **13 states** using WCAG 2 A/AA and 2.1 AA tags, with no detected violations in the verified runs. These results do not certify complete accessibility.

`npm run test:audit` writes generated screenshots and `accessibility.json` to ignored `test-results/`. Six representative screenshots with synthetic data are retained here:

- [Light desktop](evidence/light-1440.png) and [light 320px](evidence/light-320.png).
- [Dark desktop](evidence/dark-1440.png) and [dark 320px](evidence/dark-320.png).
- [Mobile settings](evidence/settings-mobile.png) and [Shopping Mode](evidence/shopping-mode.png).

Each retained image shows a distinct layout or state. Inspect freshly generated output when reproducing the tests.

## Fresh-install and persistence check

1. Clone the repository into a new empty directory and run `npm ci` with Node 22; do not transfer `node_modules`.
2. Run every check above and inspect the exit codes and suite counts.
3. Set `GROCERGLOW_DB_PATH` to a new demonstration database and start with `npm start` on loopback. Verify the homepage, create an item and another list, stop the server, restart with the same demonstration database and verify both persisted.
4. Check the intended revision's Actions run. A source export should contain no databases, backups, credentials, installed dependencies or generated results.

Tests and demonstration runs must use separate databases. Existing personal data must not be deleted or reset. Database preservation can be checked with before/after file hashes and read-only SQLite integrity/foreign-key checks without exposing records.

## Manual checks still needed

- Real GPS and OS/browser permissions: verify town/country, denial, manual override and currency confirmation on an actual device. Provider fixtures do not establish live service accuracy.
- Physical phone: verify touch targets, navigation, dialogs, on-screen keyboard, orientation and zoom.
- Screen reader: verify labels, status/error announcements, dialog flow and purchase checkmarks.
- Browser permission-timeout duration has not been independently timed. macOS/Linux installation has not been independently verified.

For each manual check, record the device/browser, steps, expected and actual result, and any issue found. Keep private shopping data and precise coordinates out of evidence. Software tests do not establish completion of presentation, video, tutor-feedback or university submission requirements.
