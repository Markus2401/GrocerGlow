# Architecture, methodology and technical decisions

## Problem and procedure

GrocerGlow combines reusable grocery lists, cost estimates and budgets. Development follows an iterative procedure: identify a user workflow, define the JSON/data contract, implement a small change, test valid and invalid cases with isolated data, then verify browser behavior and document limitations. Existing data and familiar workflows take priority over additional features.

## Responsibility boundaries

| Component                         | Responsibility                                                             |
| --------------------------------- | -------------------------------------------------------------------------- |
| `public/index.html`, `styles.css` | Semantic controls, navigation, themes and responsive layout                |
| `public/app.js`                   | DOM rendering, fetch requests, workflow state and browser preferences      |
| `public/theme-init.js`            | Restore theme before rendering without inline scripts                      |
| `public/money.js`                 | Shared amount validation and estimate calculations in Node and browser     |
| `server.js`                       | Express routing, list ownership, input validation, HTTP errors and startup |
| `database.js`                     | Connection, schema, preserving migration, transactions and foreign keys    |
| `location.js`                     | Backend-only geocoding, cache, timeout and throttling                      |
| `test/`, `test-support/`          | Backend/browser cases with temporary SQLite files                          |
| `scripts/`, `.github/workflows/`  | Repeatable checks, source export and CI                                    |

Vanilla browser code avoids a build pipeline and keeps event handling inspectable. Express provides a custom backend; SQLite provides persistence without a database account. Modules follow responsibilities rather than an extensive framework architecture.

## Data and API design

Items, budgets and currencies belong to lists. Every item mutation scopes SQL to both item and list IDs. Parameterized SQL separates values from SQL syntax. Transactions make copying, currency resets and migrations atomic. The final remaining list cannot be deleted.

PATCH validates supplied fields and preserves omissions. `null` represents an unknown price or unset budget. SQLite booleans translate between 0/1 and JSON false/true. Legacy endpoints choose the oldest remaining list, supporting earlier clients without a global active-list setting.

Migration backs up a legacy database before schema changes, preserves IDs and sequences, retains the legacy settings row and verifies foreign keys. This code and its tests protect existing data; they remain necessary even after a fresh installation succeeds.

## Estimates and currencies

A different currency code cannot safely relabel amounts. Confirmation therefore clears only the selected list's prices and budget. There is no conversion and other lists remain unchanged. Shared money rules round calculated estimates to thousandths; zero and unknown remain distinct. Grocery estimation is the intended scope rather than accounting.

## Asynchronous behavior and accessibility

List controls stay locked during mutations and location permission/lookup to prevent late responses affecting a different list. A committed currency save and subsequent refresh are separate outcomes. Failed budget saves restore the saved amount. Browser storage failures do not block core functionality.

DOM updates use text nodes for user values. Row rerendering restores checkbox/Edit focus where appropriate. Dialogs support Tab boundaries, Escape and opener focus. Responsive CSS accommodates long names, small viewports and larger Shopping Mode controls. Reduced-motion preferences are respected.

## External services and local safeguards

The browser shares rounded coordinates only after detection and permission. Express contacts Nominatim using a timeout, identifying User-Agent, bounded cache and throttle. Genuine settlement fields populate the town; manual entry remains available. Google research is encoded navigation rather than scraping or automatic price import. Attribution and service-policy links appear in the app and README.

Loopback binding reflects the absence of authentication. JSON size/type limits, parameterized SQL, generic errors and a same-origin Content Security Policy provide safeguards for local use. Public multiuser hosting needs further security work.

## Concept evolution

- Manual price research replaces automatic store-price import, avoiding an unavailable retailer API and letting users judge estimates.
- Settlement-aware detection fills a genuine town when available and allows manual correction.
- Multiple lists and Shop Again support repeated trips while preserving single-list data through migration.
- Shopping Mode and themes adapt interaction without introducing separate grocery records.

Explain these decisions alongside the student's original Phase 1 concept in the presentation.

## Conventions and dependencies

Four-space indentation, semicolons, double quotes and Prettier standardize authored files. Prefer named helpers and `const`; comments explain preservation, transactions and asynchronous state. Express 5 forwards exceptions to a central error handler. Browser suites share lifecycle helpers while retaining distinct scenarios.

All seven direct packages have a purpose: Express for routing, better-sqlite3 for storage, country-to-currency for mapping, Playwright for browser tests, axe-core for accessibility scans, Prettier for formatting, and node-gyp for native builds including the verified Windows toolchain. node-gyp is needed during installation even though application files do not import it. The lockfile remains authoritative.

## Documentation scope

README explains setup/use; this document explains design; TEST_PLAN records executable evidence; IU_READINESS maps requirements and remaining academic work. Obsolete assistant handoffs and generated test output are excluded from source. Six selected screenshots show distinct assessment states. Git history preserves prior development without carrying old assistant instructions in the current tree.
