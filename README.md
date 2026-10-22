# GrocerGlow

**Plan your basket. Know your budget.** GrocerGlow is a local shopping-list and budget planner developed for IU's Project Java and Web Development course (DLBCSPJWD01).

Grocery planning often separates lists, estimated prices and spending limits. GrocerGlow brings them together so users can prepare shopping trips, research prices and track purchases.

## Features

- Multiple shopping lists, each with its own items, budget and currency.
- Add, edit, delete and mark items purchased, with optional estimated unit prices.
- Basket totals, remaining budgets and warnings for unknown prices or overspending.
- **Shopping Mode:** larger purchase controls, progress and purchased items below remaining items.
- **Shop Again:** create an unchecked copy of a list, optionally including its prices.
- Manual currency selection and optional country, town and currency detection.
- **Find Local Prices:** open a product-and-town Google search for manual research.
- SQLite persistence, responsive layouts, keyboard navigation and light/dark themes.

## Technologies

The frontend uses HTML, CSS and JavaScript without a build step. A custom Node.js 22 / Express 5 backend serves the frontend and a JSON API. SQLite stores lists and items through `better-sqlite3`; `country-to-currency` maps country codes. Tests use Node's test runner, Playwright and axe-core. Prettier checks formatting.

## Requirements and installation

Install **Node.js 22.x**, npm and Git. Browser tests use installed Microsoft Edge; Chrome can be selected instead. Windows 11, Node 22.22.3 and npm 10.9.8 are the verified environment.

```powershell
git clone https://github.com/Markus2401/GrocerGlow.git
cd GrocerGlow
npm ci
npm start
```

Open **http://127.0.0.1:3000**. Stop the server with **Ctrl+C**. A fresh installation creates its SQLite database automatically. Restart after backend changes and refresh after frontend changes. Keep the same browser origin: `localhost` and `127.0.0.1` have separate preferences.

SQLite is a native dependency. If no suitable prebuilt binary is available, Windows needs Python 3 and Visual Studio C++ Build Tools with the Desktop development with C++ workload and Windows SDK. The included `node-gyp` development dependency supports native compilation. macOS/Linux may need Python and C++ build tools; installation on those systems has not been independently verified. Install development dependencies to run the documented checks.

## Usage

1. Open **My Lists** to create, select, rename or delete a list. The final remaining list is protected.
2. Add an item name, positive whole quantity and optional unit price. Use **Edit** to revise it. A blank price means unknown; zero is a known free item.
3. Enter a budget and leave the field to save it. Review the basket estimate, remaining amount and any unknown-price warning.
4. Enter your town/city in **Price Search**, or choose **Detect Location**. Detection fills the area in both Price Search and Settings. Open **Find Local Prices**, research the results and enter your own estimate.
5. Choose a currency in **Settings**. A different currency requires confirmation when monetary values exist and clears that list's prices and budget. No exchange-rate conversion occurs.
6. Enter **Shopping Mode** and check purchases. Checkmarks do not reduce the basket estimate. **Shop Again** makes a separate unchecked copy; copying prices is optional and off by default.
7. Use the moon/sun control to change theme. List, area and theme preferences are remembered in this browser; Shopping Mode preference lasts for the browser session.

Location detection runs only after a click and browser permission. Coordinates are rounded to two decimal places before reaching the backend. Express contacts Nominatim over HTTPS to find a country and settlement; precise GPS is not stored. Denial, unavailable services or missing town data leave manual entry available. Real GPS behavior still needs manual verification.

## Configuration and data

| Variable                  | Default                              | Purpose                                                 |
| ------------------------- | ------------------------------------ | ------------------------------------------------------- |
| `HOST`                    | `127.0.0.1`                          | Bind address; keep loopback for local use               |
| `PORT`                    | `3000`                               | HTTP port                                               |
| `GROCERGLOW_DB_PATH`      | `grocerglow.db` beside `database.js` | SQLite file path                                        |
| `GROCERGLOW_GEOCODER_URL` | Nominatim reverse-geocoding endpoint | Optional HTTPS provider with the same response contract |

For a separate demonstration database or a port conflict:

```powershell
$env:PORT = '3001'
$env:GROCERGLOW_DB_PATH = Join-Path $env:TEMP 'grocerglow-demo.db'
npm start
```

Remove an override when finished, for example `Remove-Item Env:GROCERGLOW_DB_PATH`. Preserve existing database files and backups; do not reset them to repair an installation problem. Personal databases, backups, dependencies and generated test output are excluded from Git.

The browser sends same-origin JSON requests with `fetch`. Express validates input, performs parameterized SQLite operations and returns JSON for DOM updates. Item editing, list management, budget saving and currency changes are dynamic frontend–backend interactions. Lists and items are related through a foreign key; transactions protect copying, currency resets and legacy migrations. See [Architecture](docs/ARCHITECTURE.md) for the API and schema.

## Tests

```powershell
npm run check
npm run format:check
npm test
npm run test:browser
npm run test:lists
npm run test:audit
npm audit
```

The suites cover **32 backend tests**, including parent tests, and **8 shopping**, **5 list** and **7 additional browser groups**. Tests use temporary databases, synthetic locations and intercepted search navigation. Screenshots and accessibility scan output are generated in ignored `test-results/`.

Playwright uses Edge by default. Select Chrome in PowerShell with `$env:GROCERGLOW_BROWSER = 'chrome'`. `npm run check` checks JavaScript syntax, HTML IDs and local assets; `npm run format` applies Prettier formatting.

[GitHub Actions](https://github.com/Markus2401/GrocerGlow/actions/workflows/check.yml) runs installation, syntax and formatting checks, all test suites and a dependency security audit on Windows/Node 22. See [Testing](docs/TESTING.md) for cases, results and manual checks.

## Project structure

```text
GrocerGlow/
├── public/                 # HTML, CSS, browser code and assets
├── test/                   # Backend, persistence, location and migration tests
├── test-support/           # Browser suites and shared test fixtures
├── docs/
│   ├── ARCHITECTURE.md      # Design, database, API and technical decisions
│   ├── TESTING.md           # Methodology, test cases and verified results
│   └── evidence/            # Six representative application screenshots
├── scripts/                # Syntax/asset checks and source export
├── .github/workflows/      # Automated checks
├── server.js               # Express API and startup
├── database.js             # SQLite schema and migration
├── location.js             # Backend geocoding, cache and throttling
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

With PowerShell 7, create a source ZIP outside the project:

```powershell
pwsh -File scripts/export.ps1 -DestinationPath ../GrocerGlow-source.zip
```

The export includes source, tests, documentation and configuration. It excludes Git history, installed dependencies, databases/backups, credentials and generated results. Existing ZIPs are not overwritten. Extract into a new folder and run `npm ci` and the checks above.

## Accessibility and limitations

The layout adapts from 320px to desktop widths. It includes semantic landmarks, visible labels and focus, a skip link, status messages, keyboard-operated dialogs and reduced-motion support. Browser checks cover long text, both themes and several viewport sizes. Automated accessibility checks do not replace physical-phone, zoom, on-screen keyboard or screen-reader testing; those checks remain pending.

- Intended for local single-user use; no accounts, authentication or cloud synchronization. Public hosting needs authentication, HTTPS and appropriate deployment safeguards.
- Price research opens third-party search results. There is no live retailer price API, automatic price import or scraping.
- Location depends on permission, approximate coordinates and an external provider. Manual area and currency settings remain available.
- Estimates use up to three decimal places. This is a planning tool without exchange-rate conversion or accounting-grade precision.

## Acknowledgments

Location data: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright), with applicable ODbL terms; geocoding uses Nominatim. Review the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) before deployment. Google Search is a user-initiated external destination. Third-party packages retain their respective licenses. No project-wide license grant has been selected; the package's `private: true` prevents npm publication and is separate from GitHub visibility.

AI tools assisted implementation, debugging, regression tests and documentation. This assistance should be disclosed in the student's submission according to the applicable IU academic-integrity guidance; automated checks do not replace personal understanding or review.
