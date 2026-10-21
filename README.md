# GrocerGlow

**Plan your basket. Know your budget.** A local shopping-list and budget planner for IU's Project Java and Web Development module (DLBCSPJWD01).

## Purpose and problem

Grocery planning often separates shopping lists, price estimates and spending limits. GrocerGlow brings them together so users can prepare several trips, estimate costs and track purchases. It supports planning and manual price research rather than selling groceries or providing live retailer prices.

## Main features

- Independent lists with their own items, budgets and currencies.
- Add, edit, delete and mark items purchased; optional estimated unit prices.
- Estimated totals, remaining budgets and warnings about unknown prices or overspending.
- **Shop Again:** create an unchecked copy, optionally including previous estimates.
- **Shopping Mode:** larger purchase controls, progress and purchased items below remaining items.
- Manual currency settings and optional country, town and currency detection.
- **Find Local Prices:** product-and-town Google searches for manual research.
- Responsive layouts, keyboard navigation and light/dark preferences.
- SQLite persistence across refreshes and server restarts.

## Technology stack

Vanilla HTML, CSS and JavaScript run in the browser. A custom Node.js 22 / Express 5 server provides a JSON API. `better-sqlite3` supplies SQLite storage; `country-to-currency` maps country codes. Tests use Node's test runner, Playwright and axe-core. Prettier checks formatting. No frontend build step is required.

## Project structure

```text
GrocerGlow/
├── public/                 # HTML, CSS, browser logic, money rules and favicon
├── test/                   # HTTP, validation, location and migration tests
├── test-support/           # Browser suites, temporary server and shared fixture
├── docs/                   # Decisions, test evidence and IU readiness
│   └── evidence/           # Six selected assessment screenshots
├── scripts/                # Syntax/asset checks and source export
├── .github/workflows/      # GitHub Actions
├── server.js               # Express routes, validation and startup
├── database.js             # SQLite schema and preserving migration
├── location.js             # Geocoding, cache and throttling
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Local databases, installed dependencies and generated test results are ignored. The existing `test/` and `test-support/` names match the package scripts.

## Installation requirements

Use **Node.js 22.x**, npm, Git and a modern browser. Verified locally: Node **22.22.3**, npm **10.9.8**, Windows 11 and Edge **155.0.4283.62**. Browser tests need installed Microsoft Edge, or Chrome selected below.

SQLite is a native dependency. If a suitable prebuilt binary is unavailable, Windows needs Python 3 and Visual Studio C++ Build Tools with the Desktop development with C++ workload and Windows SDK. The direct `node-gyp` development dependency supplies a compatible native-build toolchain. Install development dependencies for the documented checks. macOS/Linux may need Python and C++ build tools; those systems have not been independently verified.

## Installation

```powershell
git clone https://github.com/Markus2401/GrocerGlow.git
cd GrocerGlow
npm ci
```

The repository is currently **private**, requiring authorized GitHub access. Alternatively, extract the source ZIP into a new folder and run `npm ci`. Do not transfer `node_modules` between machines. Public GitHub access remains an IU submission requirement and needs owner approval.

## Start the application

```powershell
npm start
```

Open **http://127.0.0.1:3000**; stop with **Ctrl+C**. Restart after backend changes and refresh after frontend changes. Keep the same browser origin: `localhost` and `127.0.0.1` have separate preferences. Startup reports the folder and port.

Optional PowerShell overrides:

```powershell
$env:PORT = '3001'
# For a deliberately separate demo/test database:
$env:GROCERGLOW_DB_PATH = Join-Path $env:TEMP 'grocerglow-demo.db'
npm start
```

Remove an override with `Remove-Item Env:GROCERGLOW_DB_PATH`. A fresh installation creates its database automatically. Preserve existing databases and backups. For a port conflict, stop your earlier instance or choose another port; do not terminate unrelated processes.

## How to use GrocerGlow

1. Select/create a list under **My Lists**. Rename when needed. Deletion asks for confirmation; the final remaining list is protected.
2. Add an item name, positive whole quantity and optional unit price. **Edit** revises it. Blank price means unknown; zero means a known free item.
3. Enter a budget and leave the field to save it. Review total, unknown-price notice and remaining amount. Failed saves restore the stored budget.
4. Enter your town/city in **Price Search**, or choose **Detect Location**. Settings and sidebar areas stay synchronized. Research with **Find Local Prices**, then enter your own estimate.
5. Choose a currency in **Settings** and read the confirmation when amounts exist.
6. Enter **Shopping Mode** and check purchases. Checkmarks do not reduce the basket estimate. **Shop Again** creates a separate unchecked copy; price copying is optional and off by default.
7. Toggle the moon/sun control for theme. List, area and theme preferences stay in this browser; Shopping Mode preference lasts for the browser session.

## Frontend and backend communication

The browser sends same-origin JSON requests with `fetch`. Express validates input, executes parameterized SQLite statements and returns JSON. The browser updates DOM text. Item editing, list management, budget saving and currency changes are separate dynamic interactions.

```text
Browser → JSON → Express → SQLite
        ← JSON ←         ← persisted records
                   ↘ optional HTTPS geocoder
```

| Method               | Route                                  | Purpose                                                     |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- |
| GET / POST           | `/api/lists`                           | Retrieve/create lists                                       |
| GET / PATCH / DELETE | `/api/lists/:listId`                   | Read, rename or delete a list                               |
| POST                 | `/api/lists/:listId/duplicate`         | Shop Again, optional `copyPrices` boolean                   |
| GET / POST           | `/api/lists/:listId/items`             | Retrieve/add items                                          |
| PATCH / DELETE       | `/api/lists/:listId/items/:id`         | Partial update/delete                                       |
| GET / PATCH          | `/api/lists/:listId/settings`          | Read settings/save budget                                   |
| PATCH                | `/api/lists/:listId/settings/currency` | Confirmed currency change/reset                             |
| GET                  | `/api/currencies`                      | Runtime-supported currency codes                            |
| POST                 | `/api/detect-currency`                 | Approximate coordinates to country, settlement and currency |

Legacy `/api/items`, `/api/items/:id`, `/api/settings` and `/api/settings/currency` use the oldest remaining list. The frontend uses explicit list IDs.

Example: `PATCH /api/lists/1/items/7`, with `Content-Type: application/json` and `{"name":"Milk","quantity":2,"price":45}`. Omitted fields, including `completed`, retain their saved values.

Item names allow 120 characters; list names 80. Quantities range from 1 to 1,000,000; finite amounts from 0 to 1,000,000,000. Flags require booleans. Errors include 400 invalid input, 404 missing resource, 409 protected operation, 413 oversized JSON, 415 wrong media type, 422 unmapped location, 429 throttling and 502 provider failure. Unexpected database errors return a generic 500.

## SQLite storage

The default `grocerglow.db` is beside `database.js`; `GROCERGLOW_DB_PATH` selects another file. `shopping_lists` holds list names, budgets, currency codes and creation dates. `items` holds names, quantities, optional prices and purchased flags with a foreign key to the owning list. Transactions protect copying, currency resets and migrations.

Legacy single-list databases receive a consistent `VACUUM INTO` backup in `backups/` before migration. Backup failure stops startup. Migration preserves IDs, sequences, amounts, checkmarks and legacy settings, and is tested for repeated startup. The old settings row is retained for preservation. Do not delete the database to repair installation tooling. Tests use temporary databases; Git and source export exclude personal databases and backups.

## Automatic location detection

Detection starts after a click and browser permission. Coordinates are rounded to two decimal places **before** reaching Express. Only Express contacts Nominatim over HTTPS; precise GPS is not stored. The returned town/city fills both Price Search and Settings, even when the suggested currency already matches. Area text is editable and remembered locally.

Only city, town, village or hamlet counts as a settlement. District-only results do not invent a town. Denial, timeout, mapping/provider errors and missing settlements retain manual entry. Browser location generally requires a secure context; loopback supports local development. Real GPS accuracy still requires manual verification.

The per-process cache holds up to 200 approximate locations for 24 hours. New requests are separated by at least 1.1 seconds and overlapping lookups are rejected. Cache clears on restart. `GROCERGLOW_GEOCODER_URL` selects an HTTPS provider with the same JSON contract. Review the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) before use/deployment. Wider deployments need an appropriate provider and shared cache/rate limiter. There is no autocomplete or bulk/background lookup.

## Currency settings and estimates

Currencies belong to individual lists. `Intl` supplies codes and localized formatting; detection suggests a country's currency. **No exchange-rate conversion occurs.** The same currency preserves amounts. A different currency with existing prices/budget requires confirmation and clears those monetary values only in the selected list, retaining items, quantities and checkmarks.

Unknown prices are excluded with a warning. The UI accepts estimates to three decimal places, including fractional yen and three-decimal currencies. Shared rules round calculated estimates to thousandths to avoid false floating-point overspends; display does not rewrite stored prices. This is a planning tool rather than an accounting system.

## All automated checks

```powershell
npm run check
npm run format:check
npm test
npm run test:browser
npm run test:lists
npm run test:audit
npm audit
```

The backend reports **32 tests**, including parent tests. Browser suites cover **8 shopping**, **5 list** and **7 additional audit groups**. `check` verifies syntax, HTML IDs and local assets. Prettier checks formatting; `npm run format` applies it. Browser suites use installed Edge; select Chrome with `$env:GROCERGLOW_BROWSER = 'chrome'`.

Tests use synthetic data, stubbed geocoding and intercepted search navigation. Generated screenshots/accessibility JSON go to ignored `test-results/`; selected assessment images remain in `docs/evidence/`. See [testing evidence](docs/TEST_PLAN.md).

GitHub Actions runs installation, checks, all suites and the dependency audit on Windows/Node 22 for `main`, `audit/**` and pull requests. The published application passed [run 39568677971](https://github.com/Markus2401/GrocerGlow/actions/runs/39568677971). A new cleanup revision needs its own run after approved publication.

## Responsive design and accessibility

Layouts stack for small screens and adapt item actions and dialogs. Tests cover 320–1440px, long text and both themes. Landmarks, visible labels, skip link, visible focus, status messages, dialog keyboard handling and reduced-motion support aid navigation. Shopping Mode has larger purchase controls.

Keyboard/axe checks passed within tested states; they do not certify complete accessibility. Physical-phone, on-screen keyboard, zoom and screen-reader checks remain manual work.

## Known limitations

- Local single-user use: no accounts, authentication or cloud synchronization. Default `HOST` is `127.0.0.1`. Wider deployment needs authentication, HTTPS and appropriate safeguards.
- Google results are third-party pages, not guaranteed live retailer prices. Estimates are entered manually; there is no scraping or price API.
- Location is approximate and permission/provider-dependent. Manual area/currency settings remain available.
- No exchange-rate conversion or accounting-grade precision.
- macOS/Linux and real-device/assistive-technology behavior are not independently verified.
- Public repository access, Phase 2 presentation/video and Phase 3 submission/tutor feedback remain outstanding; see [IU readiness](docs/IU_READINESS.md).

## Third-party acknowledgments

Location data: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright), with applicable ODbL terms; geocoding uses Nominatim. Google Search is a user-initiated external destination. Express, better-sqlite3, country-to-currency, Playwright, axe-core, Prettier and node-gyp retain their respective package licenses. Manual use needs no paid API or third-party account. A project-wide license grant has not been selected; `private: true` prevents accidental npm publication and is separate from GitHub visibility.

## Documentation and export

- [Architecture, methodology and decisions](docs/TECHNICAL_DECISIONS.md)
- [Testing and results](docs/TEST_PLAN.md)
- [IU requirements and outstanding deliverables](docs/IU_READINESS.md)

With PowerShell 7, export to a new filename outside the project:

```powershell
pwsh -File scripts/export.ps1 -DestinationPath ../GrocerGlow-source.zip
```

The explicit manifest includes source, tests, docs and workflow/config files. It excludes Git history, dependencies, databases/backups, credentials and generated results. Existing ZIPs are not overwritten. Extract into a new folder, run `npm ci` and the documented checks.
