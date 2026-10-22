# Architecture

GrocerGlow combines reusable grocery lists, cost estimates and budgets. Development follows an iterative process: define a user workflow and JSON/data contract, implement it, test valid and invalid cases with isolated data, and verify browser behavior. Vanilla JavaScript avoids a frontend build pipeline; Express provides a custom backend; SQLite provides persistence without a database service.

## Components and data flow

```text
Browser (HTML/CSS/JavaScript) → same-origin JSON API → Express → SQLite
                                                    ↓
                                           optional HTTPS geocoder
```

| Component                         | Responsibility                                                          |
| --------------------------------- | ----------------------------------------------------------------------- |
| `public/index.html`, `styles.css` | Semantic controls, navigation, themes and responsive layout             |
| `public/app.js`                   | DOM rendering, fetch requests, workflow state and browser preferences   |
| `public/theme-init.js`            | Restore theme before rendering without inline scripts                   |
| `public/money.js`                 | Shared amount validation and estimate calculations in Node and browser  |
| `server.js`                       | Routing, list ownership, validation, HTTP errors and startup            |
| `database.js`                     | Connection, schema, preserving migration, transactions and foreign keys |
| `location.js`                     | Backend geocoding, cache, timeout and throttling                        |
| `test/`, `test-support/`          | Backend/browser tests using temporary SQLite files                      |
| `scripts/`, `.github/workflows/`  | Repeatable checks, source export and CI                                 |

For example, an item edit sends a PATCH request, persists the supplied values in SQLite and updates the row and budget display from the response. Saving a budget follows a separate PATCH/response flow. Location detection calls Express, which retrieves external geocoding data before returning a settlement and currency suggestion to the browser.

## SQLite schema and persistence

| Table               | Main columns                                              | Relationship/purpose                                               |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `shopping_lists`    | `id`, `name`, `budget`, `currency`, `created_at`          | One row per list with independent settings                         |
| `items`             | `id`, `list_id`, `name`, `quantity`, `price`, `completed` | Many items belong to one list; foreign key with cascading deletion |
| `settings` (legacy) | Original single-list settings                             | Retained when migrating an existing database                       |

Foreign keys are enabled. Prices and budgets may be `NULL`; zero is a known value. Purchased flags use SQLite 0/1 and JSON false/true. Item IDs use `AUTOINCREMENT`. Every item mutation scopes SQL to both item and list IDs; parameters are bound separately from SQL text. The final remaining list cannot be deleted.

The default file is `grocerglow.db` beside `database.js`; `GROCERGLOW_DB_PATH` selects another file. SQLite preserves items, checkmarks and settings across reloads and server restarts. Theme, selected list and research area are optional browser preferences, not database records.

Legacy single-list databases receive a consistent `VACUUM INTO` snapshot in `backups/` before schema changes. Backup failure stops startup. Transactional migration preserves item IDs, ID sequences, amounts, checkmarks and the original settings row, sets schema version 1 and verifies foreign keys. Repeated startup is tested for idempotence. This migration remains necessary for existing installations.

## JSON API

| Method               | Route                                  | Purpose                                                     |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- |
| GET / POST           | `/api/lists`                           | Retrieve/create lists                                       |
| GET / PATCH / DELETE | `/api/lists/:listId`                   | Read, rename or delete a list                               |
| POST                 | `/api/lists/:listId/duplicate`         | Shop Again; optional `copyPrices` boolean                   |
| GET / POST           | `/api/lists/:listId/items`             | Retrieve/add items                                          |
| PATCH / DELETE       | `/api/lists/:listId/items/:id`         | Partial item update/delete                                  |
| GET / PATCH          | `/api/lists/:listId/settings`          | Read settings/save budget                                   |
| PATCH                | `/api/lists/:listId/settings/currency` | Confirmed currency change/reset                             |
| GET                  | `/api/currencies`                      | Runtime-supported currency codes                            |
| POST                 | `/api/detect-currency`                 | Approximate coordinates to country, settlement and currency |

Legacy `/api/items`, `/api/items/:id`, `/api/settings` and `/api/settings/currency` use the oldest remaining list. The frontend uses explicit list IDs, avoiding a global active-list setting.

PATCH validates supplied fields and preserves omissions. For example, `PATCH /api/lists/1/items/7` with `Content-Type: application/json` and `{"name":"Milk","quantity":2,"price":45}` changes those three fields while retaining the purchased flag. A supplied `completed` value must be a boolean. `null` clears a price or budget; it does not mean zero.

Item names allow 120 characters and list names 80. Quantities are whole numbers from 1 to 1,000,000; finite amounts range from 0 to 1,000,000,000. JSON requests must be plain objects and use the correct media type, within a 16KB limit.

Expected errors include 400 for invalid input, 404 for missing resources, 409 for protected operations, 413 for oversized JSON, 415 for wrong media type, 422 for an unmapped location, 429 for throttling and 502 for geocoder failure. Unexpected errors return a generic 500; Express 5 forwards exceptions to the central error handler.

## Shopping workflows, estimates and currency

Shop Again copies a list's names, quantities, budget and currency into a new list with new item IDs and unchecked flags. Prices are unknown unless `copyPrices: true` is supplied. The original is preserved. Transactions make copying and currency resets atomic.

Shopping Mode changes presentation, purchase controls, sorting and progress; it uses the same item records. Purchased flags do not subtract from the basket estimate. Unknown prices are excluded with a warning. Shared money rules round calculated estimates to thousandths, avoiding false floating-point overspends. Inputs support up to three decimal places, including fractional yen; formatting does not rewrite stored prices.

Currency codes come from `Intl` runtime support, with `country-to-currency` supplying country mapping for detection. Changing to the same code preserves amounts. A different code with existing monetary values requires `resetMonetaryValues: true`; it clears only that list's prices and budget, retaining items, quantities and checkmarks. There is no exchange-rate conversion.

## Location and price research

Detection requires a user action and browser permission. The browser rounds coordinates to two decimal places before sending them to Express; the backend rounds again. Only Express contacts Nominatim over HTTPS with an identifying User-Agent and a 10-second provider timeout. Precise GPS is not stored. Only city, town, village or hamlet fields supply a settlement; district-only results retain manual entry.

An in-process cache stores up to 200 approximate locations for 24 hours. New requests are separated by at least 1.1 seconds and overlapping lookups are rejected. Cache clears on restart. `GROCERGLOW_GEOCODER_URL` permits an HTTPS replacement with the same response contract. Wider deployments need an appropriate provider and shared cache/rate limiting; there is no bulk lookup or autocomplete. See the service-policy and attribution links in the README.

The returned town fills both Price Search and Settings, including when the detected currency already matches. Area text remains editable. Permission denial, missing settlements and provider/mapping errors retain manual settings. Find Local Prices opens an encoded Google query containing the item, area and active currency. It does not scrape retailers or automatically import prices. Manual price research was already part of the Phase 1 concept.

## Browser state and accessibility

List controls stay locked during mutations and location permission/lookup so late responses cannot affect another list. A committed currency save and a subsequent refresh are separate outcomes. Failed budget saves restore the saved amount. Browser storage failures do not block core functionality.

DOM updates use text nodes for user values. Row rerendering restores checkbox/Edit focus where appropriate. Dialogs support Tab boundaries, Escape and opener focus. CSS accommodates long names, small viewports and larger Shopping Mode controls, with reduced-motion support. Keyboard and axe checks have defined scope; physical-phone and screen-reader verification remain manual.

## Security and conventions

Loopback binding reflects the absence of authentication. Parameterized SQL, list ownership checks, JSON bounds, generic errors, a same-origin Content Security Policy, `nosniff` and `no-referrer` headers provide safeguards for local use. Public multiuser hosting requires additional authentication and deployment controls. Git and source export exclude databases, backups, secrets and installed dependencies.

Four-space indentation, semicolons, double quotes and Prettier standardize authored files. Modules follow responsibilities rather than a larger application framework. Browser suites share lifecycle fixtures while keeping distinct failure scenarios.

All seven direct packages have a purpose: Express for routing, better-sqlite3 for storage, country-to-currency for mapping, Playwright for browser tests, axe-core for accessibility scans, Prettier for formatting and node-gyp for native builds. `node-gyp` is required during some installations even though application code does not import it. The lockfile defines reproducible dependency versions.
