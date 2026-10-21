# Test plan and evidence

Audit date: **21 October 2026**. Environment: Windows 11 x64 (build 26200), Node **22.22.3**, npm **10.9.8**, Microsoft Edge **155.0.4283.62**. Tests use independent generated SQLite files, synthetic location and intercepted Google navigation.

## Before changes

- Actual project: `npm test` exited 0 but ran **0 tests**. Both browser commands failed with missing files. This is a failed baseline, not a passing test suite.
- Recovered original suites in an isolated copy, with the current source unchanged: clean `npm ci` passed, **24 backend tests passed**, shopping browser suite **8 groups passed**, list suite **5 groups passed**.
- Targeted browser/HTTP probe reproduced: oversized body returned 500; `0.1 + 0.2` against `0.3` showed “Over budget by R0.00”; checkbox focus fell to body; failed budget save left the unsaved number visible.
- Fresh authenticated GitHub clone of `9c7eea8bc86309a2758ec93cbd451a742881993e`: `npm ci` failed because bundled node-gyp 11.5.0 did not recognize Visual Studio 2026; `npm test` was a failing placeholder, and start/browser/list scripts were absent. This published version is not the tested local candidate.

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
| T21 | Axe WCAG2A/AA and WCAG21AA scans                                                     | No detected violations in tested states                                 | PASS                                                                       | `evidence/accessibility.json`                 |
| T22 | Block localStorage/sessionStorage; stale deleted-list preference                     | App remains usable; valid fallback list                                 | PASS                                                                       | audit browser                                 |
| T23 | KWD0.001 ×3, fractional JPY1.234                                                     | Inputs and displayed precision retained; no conversion                  | PASS                                                                       | audit browser                                 |
| T24 | Malformed/large JSON, wrong media type, excessive numbers                            | 400/413/415, generic errors, no partial data writes                     | PASS                                                                       | hardening                                     |
| T25 | Legacy populated/empty database with sequence99; backup blocked                      | Verified snapshot, rows/IDs/settings preserved; safe abort; idempotence | PASS                                                                       | migration suite                               |
| T26 | Normal server start/restart on tempDB; occupied port; invalid DB path                | Loopback response, persistence, clear startup failure                   | PASS                                                                       | hardening                                     |
| T27 | Syntax, formatting, npm dependency audit                                             | Checks pass; lockfile clean install                                     | PASS locally; see final audit report for clean export verification         | check + format + npm audit                    |
| T28 | Real GPS/physical phone/screen reader; published fresh clone/CI                      | Actual device/provider/remote evidence                                  | PENDING student action                                                     | `IU_READINESS.md`                             |

## Run commands

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

The expanded backend suite has **32 tests**; browser suites report **8 shopping groups**, **5 list groups** and **7 additional audit groups**. Backend parent tests count toward Node's total; these are not 32 browser/device tests. Final output/report records actual post-copy and clean-export results separately.

## Screenshots

Synthetic data only. Long names are deliberate stress cases.

- [320px](evidence/light-320.png), [390px](evidence/light-390.png), [600px](evidence/light-600.png), [768px](evidence/light-768.png), [1024px](evidence/light-1024.png), [1440px](evidence/light-1440.png)
- [Dark desktop](evidence/dark-1440.png), [dark 320px](evidence/dark-320.png), [mobile settings](evidence/settings-mobile.png), [Shopping Mode](evidence/shopping-mode.png)

Screenshots and axe scans do not prove physical-phone keyboard/zoom or screen-reader usability. Real GPS was not requested. The assignment PDF/PPTX/video/submission were not supplied and are not certified by automated tests.
