# GrocerGlow

**Plan your basket. Know your budget.** A local shopping-list planner for IU's Project Java and Web Development module, built with vanilla HTML/CSS/JavaScript, Express and SQLite.

## Install and run

Use **Node.js 22.x** (verified: 22.22.3, npm 10.9.8). In a terminal:

```powershell
git clone https://github.com/Markus2401/GrocerGlow.git
cd GrocerGlow
npm ci
npm start
```

The repository is currently private and its published initial commit predates this audit. Until the reviewed changes are published, use the supplied clean source ZIP. Public IU availability and publication remain pending owner approval.

Open **http://127.0.0.1:3000**. Stop with Ctrl+C. Restart after backend edits; refresh after frontend edits. Keep the same browser origin: `localhost` and `127.0.0.1` have separate browser preferences. Startup identifies the source folder and port.

SQLite contains native code. If no suitable prebuilt binary is available, installation compiles it. Windows needs Python 3 and Visual Studio C++ Build Tools with the Desktop development with C++ workload/Windows SDK. The direct **node-gyp 12.1.0** development dependency is intentional: npm's bundled 11.5.0 did not recognize this machine's Visual Studio 2026. On macOS a compiler toolchain/Xcode Command Line Tools may be needed; Linux may need Python, make and a C++ compiler. Those systems were not tested in this audit. Install from the lockfile; do not transfer `node_modules` between machines.

Optional PowerShell configuration, before starting:

```powershell
$env:PORT = '3001'
# For an intentionally separate demo/test database only:
$env:GROCERGLOW_DB_PATH = Join-Path $env:TEMP 'grocerglow-demo.db'
```

Remove an override with `Remove-Item Env:GROCERGLOW_DB_PATH`. A fresh installation creates an empty database automatically. Never delete an existing database to get a clean start. Default `HOST` is **127.0.0.1**; wider access requires deliberate deployment protections because the app has no authentication.

## Everyday use

- **My Lists:** choose/create/rename a list with its own items, budget and currency. Delete asks for confirmation; the final remaining list is protected.
- **Add / Edit / Delete:** item names up to 120 characters; positive whole quantities up to 1,000,000. Blank price means unknown (`null`); zero is a known free price. Checking an item marks it purchased without reducing estimated spend.
- **Budget:** saves when you leave the field. Unknown prices are excluded with a warning. Failed saves restore the saved amount and show an error.
- **Settings:** choose an ISO currency and town/city. There is **no exchange-rate conversion**. A different currency requires confirmation before clearing that list's prices/budget; the same currency and other lists preserve their money.
- **Shop Again:** creates a separate unchecked copy. Names, quantities, currency and budget are copied. Previous price estimates are optional and off by default.
- **Shopping Mode:** larger controls, progress and purchased items below remaining items. Exit, My Lists or Budget returns to planning. Checkbox keyboard focus survives updates.
- **Theme:** the moon/sun button remembers light/dark appearance in this browser.

Amounts are estimates, not accounting. Numeric fields accept **up to three decimal places in any currency**, including fractional yen; formatting retains those fractions rather than hiding them. Three-minor-unit currencies such as KWD work as well. Line totals, total spend and remaining amounts round to thousandths to avoid false zero-value overspends from binary floating point. Historical stored unit prices are not rewritten. API amounts must be finite/nonnegative and at most 1,000,000,000. Ordinary grocery estimates are the intended use, not extremely large accounting totals.

## Location and price research

Detection runs only after a click and browser permission. Coordinates are rounded to two decimals **before leaving the browser**. Only Express contacts the geocoder. GPS is not saved in SQLite or browser preferences; editable town text is remembered locally. Settings and sidebar town fields stay synchronized. Lists remain locked through the permission/lookup operation to prevent late results changing another list.

Only `city`, `town`, `village` or `hamlet` is treated as a settlement. District/country-only results cannot guarantee a town. Permission denial, timeout, rate limiting, unmapped countries and provider errors retain manual entry. Tests use synthetic positions; real accuracy still needs the student's consent-based check.

**Nominatim restrictions:** review its [current usage policy](https://operations.osmfoundation.org/policies/nominatim/) before location use/deployment. This app is for modest, user-triggered local use: one process, no overlapping lookups, at least 1.1 seconds between new requests, an identifying GrocerGlow User-Agent and a bounded 200-entry, 24-hour memory cache. No autocomplete, bulk/background lookups or multiple instances against the public service. Cache clears on restart. Change provider with `GROCERGLOW_GEOCODER_URL`, an HTTPS reverse endpoint with the same JSON address contract. Wider deployments need a shared cache/rate limiter and suitable provider; access may be withdrawn. No personal email is embedded in code. Data: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright), subject to applicable ODbL terms.

**Find Local Prices** opens a normal encoded Google search in a new tab using the current product, entered area and currency. Coordinates are excluded. No Google/retailer scraping or price API is used. Results can be outdated; return to Edit to enter an estimate. Manual use needs no paid API/account.

## Architecture and data safety

```text
Browser: HTML + CSS + app.js
  → JSON → Express: validation + list-scoped routes
             → parameterized SQLite queries → JSON → DOM text
             → optional location.js → HTTPS geocoder (after consent)
```

`server.js` owns routing/validation; `database.js` owns schema/migration; `location.js` owns external lookups/cache/throttling; `public/money.js` shares small numeric rules. User text uses DOM `textContent`. There is no framework, bundler or frontend build step.

The default `grocerglow.db` is beside `database.js`. Items reference a shopping list with `ON DELETE CASCADE`. A legacy single-list schema gets a consistent SQLite `VACUUM INTO` backup in `backups/` **before** migration. Failed backup stops startup. A transaction preserves IDs, sequences, names, quantities, prices/checkmarks and settings; foreign keys are verified. Repeated startup does not repeat migration. The legacy settings row is retained as history. This audit changes no schema and does not run the app against the student's database.

Tests use generated temporary databases. Ignore rules exclude databases/backups, dependencies, secrets and traces. Ignore rules cannot remove previously committed data; reachable history was inspected separately.

The server defaults to loopback because there is no authentication. Configurable `HOST` permits deliberate testing, but broader deployment needs authentication/authorization, HTTPS and deployment-specific safeguards. Do not expose it directly on the internet. JSON mutations, a 16 KB body limit, parameterized SQL, generic errors and a same-origin Content Security Policy provide proportionate local safeguards; no production multiuser security claim is made.

## API

| Method               | Route                                  | Behavior                                                     |
| -------------------- | -------------------------------------- | ------------------------------------------------------------ |
| GET / POST           | `/api/lists`                           | List/create; POST `{name, currency?}`                        |
| GET / PATCH / DELETE | `/api/lists/:listId`                   | Read/rename/delete; PATCH `{name}`                           |
| POST                 | `/api/lists/:listId/duplicate`         | `{name, copyPrices?: boolean}`                               |
| GET / POST           | `/api/lists/:listId/items`             | List/add; POST `{name, quantity, price?: number or null}`    |
| PATCH / DELETE       | `/api/lists/:listId/items/:id`         | Partial update/delete scoped to the list                     |
| GET / PATCH          | `/api/lists/:listId/settings`          | Read/settings; PATCH `{budget: number or null}`              |
| PATCH                | `/api/lists/:listId/settings/currency` | `{currency, resetMonetaryValues?: boolean}`                  |
| GET                  | `/api/currencies`                      | Runtime-supported currency-code array                        |
| POST                 | `/api/detect-currency`                 | `{latitude, longitude}` → country, city, currency suggestion |

Legacy `/api/items`, `/api/items/:id`, `/api/settings` and `/api/settings/currency` use the oldest remaining list. The browser uses explicit list IDs. IDs are positive decimal safe integers. List names allow 80 characters. Flags require JSON booleans.

Historical edit example (existing item 7 in list 1):

```http
PATCH /api/lists/1/items/7
Content-Type: application/json

{"name":"qq","quantity":2,"price":45}
```

```json
{ "id": 7, "name": "qq", "quantity": 2, "price": 45, "completed": false }
```

Only supplied fields change; omitted `completed` is preserved. Successful statuses are 200/201/204. Errors: validation 400, missing record/route 404, currency/final-list conflict 409, oversized body 413, wrong content type 415, unmapped location 422, throttle 429, provider failure 502. Database failures return generic 500 without SQL/body details.

## Quality checks

```powershell
npm run check
npm run format:check
npm test
npm run test:browser
npm run test:lists
npm run test:audit
npm audit
```

`check` verifies every authored JS/CJS file's syntax, duplicate HTML IDs and missing local assets. Prettier standardizes JS/CSS/HTML/JSON/Markdown; `npm run format` applies it. No large lint-rule collection/build system is introduced. Syntax/formatting complement semantic review and tests.

The 32 backend tests cover real HTTP/Express/SQLite CRUD, process restarts, list/currency isolation, copying/deletion, location failures and legacy migration/backup safety. Test file paths are explicit: missing suites fail instead of silently passing with zero discovered tests.

Playwright uses installed **Microsoft Edge** by default. Select installed Chrome with `$env:GROCERGLOW_BROWSER = 'chrome'`. The first two browser suites cover shopping/list workflows; `test:audit` adds the visible edit regression, asynchronous failures, keyboard access, blocked storage, currency precision and axe WCAG A/AA checks. Synthetic screenshots/results go in `docs/evidence/`. Nominatim is stubbed and Google navigation intercepted. Automation never requests real GPS or uses personal shopping data. It cannot replace screen-reader/physical-phone testing.

The prepared Windows/Node22 workflow in `.github/workflows/check.yml` has **not run on GitHub**. Remote Actions were empty at audit time. Local passing tests do not prove remote CI.

## Troubleshooting and export

- **Port conflict/stale server:** stop the earlier instance with Ctrl+C or choose `PORT`. Check the source folder in its log; old running code may lack current API routes. Do not terminate unrelated Node processes.
- **SQLite installation failure:** verify Node 22, Python and C++ tools; install with development dependencies. Preserve the database while repairing tooling.
- **Database failure:** check the filename, folder permissions and backup access. Keep the existing database/backups.
- **Location failure:** allow browser/Windows permission, retry after the throttle delay or enter a town. Clearing site preferences does not erase SQLite.
- **Private GitHub 404:** request authorized access or use the source ZIP. Public visibility requires owner approval.

Export using **PowerShell 7**, from the project folder:

```powershell
pwsh -File scripts/export.ps1 -DestinationPath ../GrocerGlow-source.zip
```

Choose a new filename; existing ZIPs are not overwritten. An explicit manifest includes source, tests, docs, package manifests and workflow/config files. It excludes `.git`, `node_modules`, databases/backups, credentials, logs and old archives. Extract into a new folder, run `npm ci`, checks and `npm start`; never copy personal data into the distribution.

See [test evidence](docs/TEST_PLAN.md), [technical decisions](docs/TECHNICAL_DECISIONS.md) and [IU actions](docs/IU_READINESS.md). This audit chooses no license: default ISC metadata was removed and `private: true` prevents accidental npm publication. Confirm licensing separately before wider distribution.
