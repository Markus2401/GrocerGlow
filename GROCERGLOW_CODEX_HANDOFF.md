\# GROCERGLOW — COMPLETE PROJECT SPECIFICATION \& CODEX HANDOFF



\*\*Project:\*\* GrocerGlow  

\*\*Tagline:\*\* Plan your basket. Know your budget.  

\*\*University:\*\* IU International University of Applied Sciences  

\*\*Course:\*\* Project Java and Web Development  

\*\*Course Code:\*\* DLBCSPJWD01  

\*\*Project Type:\*\* Full-stack responsive web application  

\*\*Current Development Stage:\*\* Phase 2 — Development, approximately Lesson 14  

\*\*Last Updated:\*\* 20 October 2026  



\---



\# 0. IMPORTANT INSTRUCTIONS FOR CODEX



You are taking over the technical review, debugging and continued development of an existing university portfolio application called \*\*GrocerGlow\*\*.



\*\*Do not rebuild the application from scratch.\*\*



The student has been developing this application incrementally with ChatGPT. Various replacement ZIP files were supplied during development, and the latest versions may not be consistent with each other.



Your first responsibility is to \*\*inspect the actual code currently present in the local project folder\*\*, identify mismatches and bugs, and make the existing application work correctly before implementing additional functionality.



\## Required approach



1\. Examine the entire existing project directory.

2\. Read every relevant source file, including `server.js`, `database.js`, `public/app.js`, `public/index.html`, `public/styles.css`, and `package.json`.

3\. Understand the existing database structure before changing it.

4\. Identify API routes that are missing, duplicated or incompatible with the frontend.

5\. Fix the currently reproducible bugs.

6\. Preserve existing functionality.

7\. Preserve existing SQLite data.

8\. Test actual frontend–backend–database integration.

9\. Continue implementing the remaining features from the specification.

10\. Keep the project simple, readable, documented and appropriate for a computer science student's university portfolio.



\*\*Prioritize correctness, simplicity and maintainability over unnecessary complexity.\*\*



Do not introduce React, TypeScript, cloud infrastructure, user authentication, microservices or additional frameworks unless there is a compelling reason and explicit student approval.



The student must be able to understand and explain the implementation.



\## Important safety requirements



\- Do not delete or overwrite `grocerglow.db`.

\- Back up the database before performing schema migrations.

\- Do not reset existing shopping items or settings merely to resolve a bug.

\- Do not overwrite working source files without explaining the changes.

\- Do not change API contracts without updating their frontend callers.

\- Do not silently relabel existing prices when the selected currency changes.

\- Do not expose credentials or precise geolocation data.

\- Do not assume a previously generated ZIP represents the current working version.

\- Do not claim a feature is tested unless it has actually been tested.

\- Do not publish the GitHub repository until configuration, private data and generated files have been checked.



\## Your immediate task



\*\*Fix the Lesson 14 item-editing problem and the missing currency-list endpoint.\*\*



The currently observed failures are described in Section 12.



After fixing them, run functional and integration tests and report exactly what changed.



\---



\# 1. PROJECT OVERVIEW



\## 1.1 What is GrocerGlow?



GrocerGlow is a responsive grocery shopping-list and budget-management web application.



Its purpose is to help people organize the items they want to buy while keeping track of their estimated shopping expenses.



Unlike a basic shopping list, GrocerGlow combines item management with budget calculations, price research, shopping progress, reusable lists and currency personalization.



The application should work on desktop computers, tablets and smartphones.



\## 1.2 The problem



Many people write shopping lists to remember what they need but do not know how much their planned purchases will cost.



This can lead to:



\- Exceeding grocery budgets.

\- Forgetting items.

\- Repeatedly creating the same shopping lists.

\- Difficulty estimating the total cost before checkout.

\- Inconvenient price research.

\- Poor visibility of what has already been purchased.



\## 1.3 Our proposed solution



GrocerGlow provides one place to:



\- Create shopping lists.

\- Add grocery items.

\- Enter quantities.

\- Add estimated prices.

\- Calculate estimated totals.

\- Compare spending against a shopping budget.

\- Find possible grocery prices using external web searches.

\- Mark purchased products.

\- Delete or edit products.

\- Reuse previous shopping lists.

\- Select a currency automatically or manually.

\- Use the application comfortably on mobile devices.



\## 1.4 Target users



The planned users include:



1\. Students managing limited budgets.

2\. Individuals organizing regular grocery shopping.

3\. Families preparing household shopping lists.

4\. Budget-conscious consumers.

5\. Anyone who wants an easy way to plan shopping expenses.



The design should remain accessible to nontechnical users.



\## 1.5 Project philosophy



GrocerGlow should feel like a polished everyday application rather than a complex enterprise system.



The key principles are:



\- Easy to understand.

\- Fast to operate.

\- Minimal unnecessary clicks.

\- Responsive.

\- Visually attractive.

\- Reliable data storage.

\- Clear feedback to users.

\- Straightforward code structure.

\- Realistic scope for a university project.



\---



\# 2. WHY WE ARE BUILDING THIS APPLICATION



This project forms part of the IU \*\*Project Java and Web Development (DLBCSPJWD01)\*\* portfolio.



The course requires a functioning web application with both a frontend and a developed backend.



The student chose GrocerGlow because it is:



\- Useful in everyday life.

\- Interesting to program.

\- Manageable in development scope.

\- Suitable for demonstrating full-stack development.

\- Capable of showcasing multiple dynamic interactions.

\- Appropriate for database CRUD operations.

\- Suitable for responsive web design and testing.



The project is intended to demonstrate actual technical competence, not merely a UI mockup.



\## 2.1 University requirements



The authoritative requirements are contained in the course-specific portfolio assignment.



The application must:



1\. Run in a web browser.

2\. Have a frontend developed using HTML, CSS and JavaScript or suitable equivalents.

3\. Include a custom-developed backend.

4\. Have at least \*\*two dynamic frontend–backend interactions implemented through JavaScript\*\*.

5\. Work across different viewport and device sizes.

6\. Send requests between frontend and backend.

7\. Retrieve and store data.

8\. Include understandable code documentation.

9\. Explain technical and methodological choices.

10\. Provide source code and installation information.

11\. Include a README with sufficient setup instructions.

12\. Include the required project presentation, test evidence and demonstration video.



The chosen backend technology is Node.js with Express. Java is not compulsory under this assignment.



\### Third-party API requirement



Any third-party API used for obtaining external data must be accessed through the custom backend and not called directly from frontend JavaScript.



If an API requires credentials, the assessor must be able to run the application without being required to register for a third-party account.



Therefore, external integrations must be optional or otherwise realistically reproducible.



\## 2.2 Grading rubric



The assessment includes these categories:



| Category | Weight |

|---|---:|

| Problem definition and understanding | 10% |

| Methodology and technical choices | 20% |

| Implementation and documentation | 40% |

| Creativity and correctness | 20% |

| Formal criteria | 10% |



The student is targeting a very high grade, but no particular mark is guaranteed.



The highest priority is to deliver a working, properly tested and well-documented application.



\---



\# 3. UNIVERSITY PORTFOLIO PHASES



The project is divided into three sequential phases.



\## Phase 1 — Conception



\*\*Status: Concept presentation prepared; current formal assessment/submission status should be confirmed with the student.\*\*



Phase 1 involves explaining the application concept before implementation.



The presentation contains:



\- Title slide.

\- Problem and project concept.

\- Target users and benefits.

\- Planned functionality.

\- Technical architecture and choices.

\- Development methodology.



The phase-specific requirement is a maximum of five content slides, excluding the title slide.



A GrocerGlow Phase 1 presentation was prepared. The student also entered a written explanation in PebblePad.



The presentation's main advertised functionality was:



1\. Manage shopping lists and items.

2\. Track a budget.

3\. Research prices externally.

4\. Use Shopping Mode.

5\. Reuse shopping lists through Shop Again.

6\. Personalize the appearance and choose any currency.



These commitments should be reflected in the finished application.



\## Phase 2 — Development and reflection



\*\*Current phase.\*\*



The student must:



\- Implement the application.

\- Debug and test its functionality.

\- Publish organized source code in a public GitHub repository.

\- Document the implementation and changes from the original concept.

\- Demonstrate desktop and responsive layouts.

\- Prepare an updated PowerPoint.

\- Include a short screencast demonstrating the application.

\- Describe test procedures and results.



The Phase 2 presentation extends the Phase 1 presentation by up to ten additional slides.



The required demonstration is approximately one to two minutes and should include narration or subtitles and responsive functionality.



The course instructions require the video to be embedded in the PowerPoint when submitting the single presentation file.



Confirm the precise technical submission requirements against the latest course document before submission.



\## Phase 3 — Finalization



After reviewing feedback:



\- Correct remaining defects.

\- Complete and test the application.

\- Refine documentation.

\- Finalize the GitHub repository.

\- Extend the presentation with final technical reflections and lessons learned.

\- Prepare the required source-code ZIP.

\- Submit the required final evidence.



The finalization presentation extends the previous version by up to ten additional slides.



The final submission must reflect the student's own technical understanding and the tutor's feedback.



\---



\# 4. CURRENT TECHNOLOGY STACK



The existing project uses the following technologies.



| Layer | Technology | Purpose |

|---|---|---|

| Frontend | HTML5 | Application structure |

| Frontend | CSS3 | Visual design and responsive layout |

| Frontend | Vanilla JavaScript | Browser interaction, DOM operations and API requests |

| Backend | Node.js | Executes server-side JavaScript |

| Backend | Express.js | HTTP server and REST API |

| Database | SQLite | Persistent local data storage |

| Database integration | better-sqlite3 | SQL access from Node.js |

| Location lookup | Browser Geolocation API | User-approved device location |

| Geocoding | OpenStreetMap Nominatim | Identifies a country from coordinates |

| Currency mapping | country-to-currency package | Maps country codes to default currencies |

| Currency formatting | Intl.NumberFormat | Formats amounts by currency and locale |

| Source control | Git/GitHub | Version control and assessment evidence |



\## 4.1 Development environment



The student's confirmed environment is:



\- Windows.

\- PowerShell.

\- Visual Studio Code.

\- Node.js v22.22.3.

\- npm v10.9.8.

\- VS Code v1.131.0.



The project is located at approximately:



`C:\\Users\\User\\GrocerGlow`



Codex should discover and verify the actual working directory.



The local development server normally runs at:



`http://localhost:3000`



\## 4.2 Expected project structure



The current project should resemble:



```text

GrocerGlow/

├── public/

│   ├── index.html

│   ├── styles.css

│   └── app.js

├── server.js

├── database.js

├── package.json

├── package-lock.json

├── grocerglow.db

├── node\_modules/

├── .gitignore

└── README.md

```



Not all optional files have necessarily been created in the student's current folder.



The existing project should remain straightforward unless refactoring is necessary.



\### File responsibilities



\*\*server.js\*\*



\- Creates the Express application.

\- Serves static frontend files.

\- Defines REST API routes.

\- Validates user input.

\- Processes database requests.

\- Calls the external country lookup.

\- Returns JSON responses.

\- Starts the HTTP server.



\*\*database.js\*\*



\- Opens the SQLite database.

\- Creates required tables.

\- Handles initial default records.

\- Exports the database connection.



\*\*public/index.html\*\*



\- Contains the shopping-list interface.

\- Contains quantity and price input fields.

\- Contains budget controls.

\- Contains currency and location controls.

\- Contains shopping-list display elements.



\*\*public/styles.css\*\*



\- Contains GrocerGlow's visual appearance.

\- Implements responsive layouts.

\- Styles forms, lists, budgets and buttons.

\- Will eventually include dark mode and Shopping Mode.



\*\*public/app.js\*\*



\- Handles frontend user interactions.

\- Makes requests using `fetch()`.

\- Displays API data.

\- Calculates and renders budget information.

\- Handles adding, editing, checking and deleting items.

\- Handles currency selection and formatting.

\- Handles location detection through the backend.



\*\*package.json\*\*



\- Declares project dependencies.

\- Defines executable scripts such as `npm start` and tests.



\---



\# 5. APPLICATION ARCHITECTURE



The intended design is a straightforward three-tier application.



```text

USER / WEB BROWSER

&#x20;       |

&#x20;       v

HTML + CSS + JAVASCRIPT

&#x20;       |

&#x20;       | HTTP requests / JSON

&#x20;       v

NODE.JS + EXPRESS BACKEND

&#x20;       |

&#x20;       | Parameterized SQL

&#x20;       v

SQLITE DATABASE

```



\## 5.1 Frontend responsibilities



The frontend:



\- Displays the interface.

\- Collects shopping-item data.

\- Shows items returned by the backend.

\- Displays calculated amounts.

\- Presents errors and success messages.

\- Handles shopping actions and theme changes.

\- Requests browser location with permission.

\- Sends data to the application's backend.



The frontend should not execute SQL or call third-party data APIs directly.



\## 5.2 Backend responsibilities



The backend:



\- Receives HTTP requests.

\- Validates submitted data.

\- Reads and updates SQLite records.

\- Applies data-integrity rules.

\- Retrieves application settings.

\- Performs country lookups through external services.

\- Returns consistent JSON responses.



\## 5.3 Database responsibilities



SQLite stores:



\- Shopping items.

\- Item quantities and prices.

\- Completed/purchased states.

\- Shopping budgets.

\- Currency preferences.

\- Eventually multiple shopping lists and their associated items.



The database should survive:



\- Browser refreshes.

\- Browser closures.

\- Node.js restarts.

\- Computer restarts.



The database should not be overwritten during ordinary development.



\---



\# 6. CURRENT DATABASE MODEL



\## 6.1 Items table



The initial implementation uses an `items` table similar to:



```sql

CREATE TABLE IF NOT EXISTS items (

&#x20;   id INTEGER PRIMARY KEY AUTOINCREMENT,

&#x20;   name TEXT NOT NULL,

&#x20;   quantity INTEGER NOT NULL CHECK(quantity > 0),

&#x20;   price REAL CHECK(price IS NULL OR price >= 0),

&#x20;   completed INTEGER NOT NULL DEFAULT 0

&#x20;       CHECK(completed IN (0, 1))

);

```



The exact installed schema must be inspected.



\### Fields



| Field | Meaning |

|---|---|

| id | Unique item identifier |

| name | Grocery item name |

| quantity | Positive whole-number quantity |

| price | Optional estimated unit price |

| completed | Whether the item has been purchased |



\### Important rules



\- An item name cannot be empty.

\- Quantity must be greater than zero.

\- Price may be `NULL` when unknown.

\- A known price may be zero.

\- Negative prices are invalid.

\- Completed status is stored as 0 or 1.

\- API responses should expose completion status as a Boolean.

\- Each item has a stable database ID.



\### Price calculations



For a priced item:



`Item total = quantity × unit price`



For example:



`3 × 12.50 = 37.50`



For an item without a price:



`price = null`



Its cost should remain unknown and should not be falsely represented as zero.



The displayed estimated total is the sum of all known item totals.



The UI should clearly show how many items have unknown prices.



\## 6.2 Settings table



The current application also uses a `settings` table similar to:



```sql

CREATE TABLE IF NOT EXISTS settings (

&#x20;   id INTEGER PRIMARY KEY CHECK(id = 1),

&#x20;   budget REAL CHECK(budget IS NULL OR budget >= 0),

&#x20;   currency TEXT NOT NULL DEFAULT 'ZAR'

);

```



One row currently represents global application settings.



Example:



| id | budget | currency |

|---|---:|---|

| 1 | 1000 | ZAR |



The initial default currency is ZAR.



This global model is adequate for the current single-list educational stage.



However, \*\*multiple shopping lists require a deliberate design decision\*\* about whether budgets and currencies belong to individual lists.



\## 6.3 Planned database evolution for multiple lists



Prefer a simple design similar to:



```text

shopping\_lists

\--------------

id

name

budget

currency

created\_at

updated\_at



items

\-----

id

list\_id

name

quantity

price

completed

created\_at

updated\_at

```



This is a \*\*proposed future schema\*\*, not a claim that these tables already exist.



The `list\_id` should reference `shopping\_lists.id`.



When implementing this:



1\. Back up the existing SQLite database.

2\. Preserve existing items.

3\. Migrate the existing single shopping list into a default list.

4\. Preserve its existing budget and currency.

5\. Assign existing items to the default list.

6\. Verify record counts and data values after migration.

7\. Do not silently delete the legacy data.



Use foreign keys and appropriate constraints.



Avoid introducing unnecessary additional tables.



\---



\# 7. COMPLETE FINISHED APPLICATION REQUIREMENTS



The following describes the target end result.



\## 7.1 Shopping-list management



Users should be able to:



\- Create a shopping list.

\- Give a list a meaningful name.

\- Open an existing list.

\- Add items.

\- Edit items.

\- Delete items.

\- Check or uncheck purchased items.

\- See all changes persist.

\- Switch between lists.



\### Item data



Each item has:



\- Name.

\- Quantity.

\- Optional estimated unit price.

\- Completed status.

\- Database ID.

\- Association with a shopping list once multiple lists are supported.



\### Edit functionality



The user must be able to change:



\- Item name.

\- Quantity.

\- Estimated unit price.



The user must also be able to clear an existing price.



Saving edits should:



1\. Validate the new input.

2\. Send an update request to Express.

3\. Update SQLite.

4\. Return the updated item.

5\. Update the visible item.

6\. Recalculate the estimated total.

7\. Recalculate the remaining budget.

8\. Preserve the purchased state unless intentionally changed.



If the save fails, the UI should retain the previous known state and display an understandable error.



\*\*This feature is currently broken and is the highest-priority debugging task.\*\*



\## 7.2 Budget tracking



Users can set an optional shopping budget.



The budget tracker displays:



\- Selected budget.

\- Estimated total.

\- Remaining amount.

\- Over-budget amount where applicable.

\- Number of items lacking prices.



\### Calculations



`Estimated total = sum(quantity × unit price)` for all priced items.



`Remaining budget = budget − estimated total`



If the result is negative, display the amount by which the user exceeds the budget.



\### Rules



\- Unknown prices are not silently treated as known zero prices.

\- Deleting a priced item decreases the estimated total.

\- Editing an item's price or quantity recalculates totals.

\- Adding an item recalculates totals.

\- Marking an item as purchased does \*\*not\*\* reduce the estimated total.

\- Unchecking an item does not change its cost.

\- Budget changes are saved in SQLite.

\- The budget survives browser refreshes and server restarts.



In the future multi-list version, each shopping list should preferably have its own budget.



\## 7.3 Local grocery price research



This was one of the student's original feature ideas.



The user wants a button that helps them search the web for realistic grocery prices in their area.



\### Intended behavior



For example:



1\. User enters "Avocados".

2\. User provides an area such as "Cape Town" or "Berlin".

3\. User clicks \*\*Find Local Prices\*\*.

4\. A web search opens for avocado grocery prices in that area.

5\. User compares the available results.

6\. User returns to GrocerGlow.

7\. User manually enters a price.

8\. GrocerGlow saves the price.



\### Important scope decision



\*\*Do not implement automated supermarket-price scraping or a paid grocery-pricing API.\*\*



Those approaches were investigated but rejected because of:



\- Geographic limitations.

\- Inconsistent retailer availability.

\- Unreliable local prices.

\- Authentication or payment requirements.

\- Additional implementation time.

\- Problems allowing a lecturer in Germany to reproduce the application.



An external search link is sufficient for this feature.



Use safely encoded search terms.



The web search may open a search engine or another suitable ordinary web page.



This is not the same as fetching a third-party API directly from the frontend.



If a location or city is unavailable, allow manual area entry.



Never invent product prices or present search results as guaranteed live supermarket prices.



\## 7.4 Shopping Mode



Shopping Mode should provide an easy interface for use inside a supermarket.



Expected behavior:



\- Larger, easy-to-tap controls.

\- Clear item names and quantities.

\- One-tap purchase checkboxes.

\- Purchased items automatically appear below unpurchased items.

\- Clear shopping progress.

\- Responsive design suitable for mobile phones.

\- Completion state saved in SQLite.



\### Important distinction



Checking an item means \*\*purchased\*\*, not \*\*deleted\*\*.



Purchased items must remain part of the list so they can be referenced or reused.



An item should only be deleted when the user deliberately removes it.



Shopping Mode can be a special view of the same data rather than a separate database structure.



\## 7.5 Shop Again



Users should be able to reuse a previous shopping list.



Example:



1\. User opens an old weekly shopping list.

2\. Clicks \*\*Shop Again\*\*.

3\. GrocerGlow creates a fresh list based on the previous items.

4\. The new items are initially unchecked.

5\. The original list remains unchanged.



\### Recommended behavior



\- Copy item names.

\- Copy quantities.

\- Optionally copy previous estimated prices with an explicit indication that they are estimates.

\- Reset purchased status to false.

\- Create a new list instead of destroying the old one.

\- Preserve the original list for reference.



Prices may be outdated, so the user must be able to adjust them.



\## 7.6 Multiple shopping lists



The final application should support multiple independently managed shopping lists.



Examples:



\- Weekly groceries.

\- Weekend barbecue.

\- Household essentials.

\- Monthly shopping.



At minimum, users should be able to:



\- Create a list.

\- Name it.

\- Select it.

\- View its items.

\- Edit its items.

\- Give it its own budget.

\- Delete it with confirmation.

\- Duplicate it through Shop Again.



A simple list selector is enough.



Accounts and real-time collaboration are not required.



\## 7.7 Dark mode



Users should be able to switch between light and dark themes.



The application should:



\- Provide a visible theme toggle.

\- Apply the theme consistently.

\- Maintain readable contrast.

\- Save the preference.

\- Restore the theme on future visits.

\- Work on mobile and desktop.



Use CSS variables or another simple maintainable approach.



Avoid duplicating large amounts of CSS unnecessarily.



\## 7.8 Responsive design



GrocerGlow must work on:



\- Desktop browsers.

\- Laptop screens.

\- Tablets.

\- Smartphones.



Expected behavior:



\- No horizontal overflow.

\- Inputs and buttons remain usable.

\- Text remains readable.

\- Shopping controls remain easily accessible.

\- Cards and forms adjust to small screens.

\- Shopping Mode is especially mobile-friendly.

\- Navigation remains usable with multiple lists.



\## 7.9 User feedback and errors



The application should show clear feedback for:



\- Saving items.

\- Updating items.

\- Deleting items.

\- Saving budgets.

\- Saving currency preferences.

\- Network errors.

\- Invalid user input.

\- Location permission denial.

\- External location lookup failure.



Avoid relying solely on browser alerts for every interaction.



Use clear, accessible status text where practical.



\---



\# 8. AUTOMATIC AND MANUAL CURRENCY SUPPORT



This is a major feature requested by the student.



The requirement changed during development.



Originally, currency selection was going to support EUR and ZAR only.



The student explicitly requested support for \*\*any supported currency\*\*, with automatic selection based on the user's country.



\## 8.1 Automatic detection



The user clicks \*\*Detect My Currency\*\*.



The browser requests permission to access their location.



If permission is granted:



1\. Browser obtains latitude and longitude.

2\. Frontend sends coordinates to the custom Express backend.

3\. Backend validates the coordinates.

4\. Backend sends an approximate location to a reverse-geocoding service.

5\. The service returns a country.

6\. Backend maps the country to its usual currency.

7\. Frontend displays the suggestion.

8\. The selected currency is saved in SQLite.



\### Example mappings



| Country | Currency |

|---|---|

| South Africa | ZAR |

| Germany | EUR |

| United States | USD |

| United Kingdom | GBP |

| Switzerland | CHF |

| Australia | AUD |

| Japan | JPY |

| Canada | CAD |



Some countries use multiple currencies, so automatic detection must be treated as a suggested default, not an infallible rule.



\### Confirmed testing



The student's location-detection implementation initially produced HTTP 404.



After diagnosing the running Express server, the endpoint was successfully found.



A deliberately invalid-coordinate POST request returned HTTP 400, confirming the backend route was registered.



The actual location lookup subsequently identified:



\*\*South Africa\*\*



The student reported successful currency-formatting tests through Lesson 13 Part 3A.



\## 8.2 Manual currency selection



Users must also be able to choose a currency manually.



This is necessary because:



\- Location permission may be denied.

\- Browser location may be inaccurate.

\- Some countries use multiple currencies.

\- Users may shop in another country's currency.

\- The detected currency may not match the user's preference.



\### Desired interface



The currency section should contain:



\- Current selected currency.

\- Manual currency dropdown.

\- Detect My Currency button.

\- Short status message.

\- Brief location-data disclosure.

\- OpenStreetMap attribution where required.



The dropdown should support internationally recognized currency codes available to the application's runtime, rather than only a few hardcoded options.



A reasonable implementation can use:



`Intl.supportedValuesOf("currency")`



where available, with a documented fallback for environments that do not support it.



The backend must independently validate currency selections.



\## 8.3 Currency formatting



Use JavaScript's `Intl.NumberFormat`.



Examples:



\- South African rand: R

\- Euro: €

\- US dollar: $

\- British pound: £

\- Japanese yen: ¥



The correct currency should appear in:



\- Individual item totals.

\- Shopping-list estimated totals.

\- Remaining budget.

\- Over-budget displays.

\- Other monetary summaries.



Currency formatting should be centralized in a reusable function.



Avoid manually concatenating symbols in multiple places.



\## 8.4 Important: Currency formatting is not conversion



If an item costs 25 ZAR, changing the selected currency to EUR must not simply render the same numeric value as €25 without an explicit decision.



There is no automatic foreign-exchange conversion feature in scope.



The application must never silently misrepresent old amounts.



\### Recommended currency-change policy



For the current single-list version:



\- Allow switching when no monetary values exist.

\- If prices or a budget already exist, show a clear warning.

\- Do not silently clear user data.

\- Do not automatically wipe budgets or prices.

\- Require explicit user action to resolve a mismatch.

\- Prefer preserving existing data until the user decides what to do.



For the eventual multiple-list implementation:



\- Store a currency with each list.

\- Keep each list's prices in that currency.

\- Allow creation of a new list using a different currency.

\- Avoid mixing currencies within the same list unless a conversion system is deliberately implemented.



Codex should inspect the current currency-change behavior and improve it if existing monetary values are unnecessarily cleared.



\## 8.5 Geolocation and privacy



Location should be requested only after an explicit user action.



Use approximate coordinates where practical.



The frontend must not directly call the external geocoding API.



The external API is accessed through Express.



If detection fails, users must still be able to use GrocerGlow manually.



Do not log unnecessary location details.



\### OpenStreetMap Nominatim



The current project uses Nominatim for reverse geocoding.



The public service has usage restrictions.



Codex should verify compliance with its usage policy, including identifiable requests, caching, request limits and attribution.



If a contact identifier is required by the chosen usage arrangement, configure it appropriately without exposing secrets.



Do not depend on the public service for essential core application functionality.



The user previously requested removal of excessive currency explanations.



The UI should therefore include only concise privacy information and attribution rather than repeated long paragraphs.



\---



\# 9. CURRENT AND EXPECTED REST API



Codex must inspect the actual routes in the current `server.js`.



The table below represents the planned and previously implemented API contracts.



| Method | Endpoint | Purpose | Current status |

|---|---|---|---|

| GET | `/api/items` | Retrieve items | Previously working |

| POST | `/api/items` | Create item | Previously working |

| PATCH | `/api/items/:id` | Change purchased status | Previously working |

| PATCH | `/api/items/:id` | Edit name, quantity and price | Currently broken |

| DELETE | `/api/items/:id` | Delete item | Previously working |

| GET | `/api/settings` | Retrieve budget and currency | Previously working |

| PATCH | `/api/settings` | Save budget | Previously working |

| PATCH | `/api/settings/currency` | Save selected currency | Previously implemented |

| POST | `/api/detect-currency` | Identify country/currency | Previously working |

| GET | `/api/currencies` | Retrieve currency choices | Currently returns 404 |



Additional list-related routes are still planned.



\## 9.1 GET /api/items



Should return an array of items.



Example:



```json

\[

&#x20; {

&#x20;   "id": 7,

&#x20;   "name": "Milk",

&#x20;   "quantity": 2,

&#x20;   "price": 24.99,

&#x20;   "completed": false

&#x20; }

]

```



\## 9.2 POST /api/items



Example request:



```json

{

&#x20; "name": "Avocados",

&#x20; "quantity": 3,

&#x20; "price": 12.5

}

```



Successful response:



`201 Created`



The response should contain the generated ID and saved item.



\## 9.3 PATCH /api/items/:id — Checkbox update



Example request:



```json

{

&#x20; "completed": true

}

```



This updates purchased status and returns the updated item.



\## 9.4 PATCH /api/items/:id — Edit item details



Example request:



```json

{

&#x20; "name": "Fresh Milk",

&#x20; "quantity": 2,

&#x20; "price": 45

}

```



This should update the item's editable fields while preserving its existing `completed` status.



It must not require `completed` to appear in a name/quantity/price edit request.



\### Recommended implementation rule



The backend should distinguish the intended operation through the request's actual properties.



For example:



\- `completed` Boolean request → completion update.

\- Name/quantity/price request → item-detail update.



Alternatively, use separate routes such as:



\- `PATCH /api/items/:id/completed`

\- `PATCH /api/items/:id`



However, do not change this API design without updating all frontend callers and tests.



\### Validation



\- Name must be a nonempty string.

\- Quantity must be a positive whole number.

\- Price must be null or a finite nonnegative number.

\- Completed must be a Boolean when supplied for completion updates.

\- An item ID must be valid.

\- Missing records should return 404.

\- Invalid input should return 400.

\- Database failures should return 500.

\- Successful edits should return the updated record.



\### Important



Do not bypass this problem by adding a fake `completed` field to the frontend request.



The backend must correctly support editing.



\## 9.5 DELETE /api/items/:id



Should remove the item from SQLite.



Successful response:



`204 No Content`



The item must remain deleted after browser and Node.js restarts.



\## 9.6 GET /api/settings



Example response:



```json

{

&#x20; "budget": 1000,

&#x20; "currency": "ZAR"

}

```



\## 9.7 PATCH /api/settings



Example request:



```json

{

&#x20; "budget": 1500

}

```



The budget must be saved without changing unrelated settings.



\## 9.8 PATCH /api/settings/currency



Example request:



```json

{

&#x20; "currency": "EUR"

}

```



The backend validates the currency.



The operation must follow the application's monetary-data safety policy.



\## 9.9 POST /api/detect-currency



Example request structure:



```json

{

&#x20; "latitude": 0,

&#x20; "longitude": 0

}

```



The coordinates shown are placeholders.



The real request is generated after user-approved browser geolocation.



The backend validates the input and uses a reverse-geocoding service to obtain country information.



Example successful response:



```json

{

&#x20; "country": "South Africa",

&#x20; "countryCode": "ZA",

&#x20; "currency": "ZAR"

}

```



\## 9.10 GET /api/currencies



\*\*This endpoint currently returns HTTP 404 in the user's browser.\*\*



The frontend expects a list of supported currencies.



Codex must inspect the frontend's expected JSON response structure before implementing or correcting the endpoint.



Do not invent an incompatible response format.



Possible responsibilities include:



\- Provide recognized ISO currency codes.

\- Provide readable currency names.

\- Provide useful labels.

\- Validate that returned codes can be formatted by the runtime.

\- Support the manual currency dropdown.



If the frontend and backend use different response shapes, standardize the contract and update both sides.



\## 9.11 Planned shopping-list endpoints



A possible future REST structure is:



```text

GET    /api/lists

POST   /api/lists

GET    /api/lists/:id

PATCH  /api/lists/:id

DELETE /api/lists/:id



GET    /api/lists/:id/items

POST   /api/lists/:id/items



POST   /api/lists/:id/duplicate

```



These endpoints are proposed.



Codex can select a simpler consistent design while preserving the established frontend and data.



\---



\# 10. COMPLETE DEVELOPMENT LESSON HISTORY



The application has been developed incrementally.



\## Lesson 1 — Project setup



Tasks completed:



\- Verified Node.js installation.

\- Verified npm installation.

\- Verified VS Code installation.

\- Created GrocerGlow project directory.

\- Initialized the Node.js project.

\- Installed Express.

\- Opened the project in VS Code.



Concepts learned:



\- Project directories.

\- npm.

\- `package.json`.

\- Dependencies.

\- Node.js project initialization.



\## Lesson 2 — First Express server



Tasks completed:



\- Created `server.js`.

\- Created the Express application.

\- Started the server on port 3000.

\- Added the initial GET route.

\- Displayed a welcome message in Chrome.



Concepts learned:



\- Node.js runtime.

\- Express application.

\- HTTP server.

\- Routes.

\- Requests and responses.

\- Ports.



\## Lesson 3 — Basic HTML frontend



Tasks completed:



\- Created `public/index.html`.

\- Built application header.

\- Added shopping-item input.

\- Added Add Item button.

\- Displayed example shopping items.

\- Used Express static middleware to serve the page.



Concepts learned:



\- HTML structure.

\- Semantic elements.

\- Forms and inputs.

\- Static files.

\- Frontend versus backend.



\## Lesson 4 — CSS and responsive design



Tasks completed:



\- Created `public/styles.css`.

\- Linked CSS to the HTML page.

\- Styled green header, white cards, inputs and buttons.

\- Added media queries.

\- Tested desktop responsiveness.



A stylesheet filename typo was found and corrected during this lesson.



Concepts learned:



\- CSS selectors.

\- Box model.

\- Flexbox.

\- Styling.

\- Responsive design.

\- Media queries.



\## Lesson 5 — Add items with JavaScript



Tasks completed:



\- Created `public/app.js`.

\- Added a submit-event listener.

\- Read the user's input.

\- Created DOM elements.

\- Added shopping items without reloading.

\- Cleared the form.



Concepts learned:



\- DOM.

\- Event listeners.

\- `preventDefault()`.

\- Input values.

\- `createElement()`.

\- `appendChild()`.



This initial version did not save items permanently.



\## Lesson 6 — Checkboxes and Delete



Tasks completed:



\- Added purchase checkboxes.

\- Crossed out completed items.

\- Added Delete buttons.

\- Removed DOM elements dynamically.



Concepts learned:



\- Checkbox events.

\- Boolean values.

\- CSS classes.

\- `classList.toggle()`.

\- `remove()`.



The student asked why both checkboxes and Delete buttons were needed.



The distinction was established:



\- Checkbox means purchased.

\- Delete means no longer needed.



Purchased items must remain available for Shop Again.



\## Lesson 7 — Quantities and prices



Tasks completed:



\- Added quantity input.

\- Added optional unit-price input.

\- Calculated item totals.

\- Displayed prices.

\- Supported unknown prices.



Concepts learned:



\- Numeric conversion.

\- Validation.

\- `null`.

\- Multiplication.

\- Ternary operators.

\- Decimal formatting.



\## Lesson 8 — Live budget tracker



Tasks completed:



\- Added budget input.

\- Added estimated total.

\- Added remaining-budget calculation.

\- Added over-budget feedback.

\- Added warnings for missing item prices.

\- Updated totals when items were added or deleted.



Concepts learned:



\- Application state.

\- `let` and `const`.

\- Numeric aggregation.

\- Functions.

\- Event-driven calculations.



At this stage, budget data was not saved persistently.



\## Lesson 9 — First REST API



Tasks completed:



\- Added `GET /api/items`.

\- Added `POST /api/items`.

\- Stored items in a temporary backend array.

\- Tested the API using PowerShell.



Concepts learned:



\- REST.

\- HTTP methods.

\- JSON.

\- Express request bodies.

\- HTTP status codes.

\- Server-side validation.



\## Lesson 10 Part 1 — Frontend GET requests



Tasks completed:



\- Used `fetch()`.

\- Retrieved server data from the browser.

\- Parsed JSON.

\- Inspected Chrome's Network tab.

\- Verified HTTP 200 responses.



Concepts learned:



\- Asynchronous JavaScript.

\- `async`.

\- `await`.

\- `fetch()`.

\- Promises.

\- JSON responses.

\- Error handling.



\## Lesson 10 Part 2 — Frontend POST requests



Tasks completed:



\- Connected Add Item to the backend.

\- Sent JSON with POST requests.

\- Displayed backend-confirmed items.

\- Loaded items on page refresh.

\- Preserved budget calculations.



Concepts learned:



\- API integration.

\- JSON serialization.

\- Reusable rendering functions.

\- Successful and failed requests.

\- Separation of responsibilities.



\## Lesson 11 — PATCH and DELETE



Tasks completed:



\- Created PATCH route for purchased state.

\- Created DELETE route.

\- Connected checkboxes to the backend.

\- Connected Delete buttons to the backend.

\- Verified that these changes survived browser refreshes.



Concepts learned:



\- CRUD.

\- Route parameters.

\- Database identifiers.

\- HTTP PATCH.

\- HTTP DELETE.

\- Response handling.



At this stage, data was still in the backend's memory.



\## Lesson 12 — SQLite persistence



Tasks completed:



\- Installed `better-sqlite3`.

\- Created `database.js`.

\- Created the `items` table.

\- Replaced the temporary array with SQLite queries.

\- Implemented database CRUD operations.

\- Tested persistence after a server restart.



Concepts learned:



\- Relational databases.

\- SQL.

\- `SELECT`.

\- `INSERT`.

\- `UPDATE`.

\- `DELETE`.

\- Primary keys.

\- Constraints.

\- Parameterized queries.

\- Persistent storage.



The student reported that all ten SQLite tests passed.



\## Lesson 13 Part 1 — Save budgets



Tasks completed:



\- Created settings storage.

\- Added GET settings endpoint.

\- Added PATCH budget endpoint.

\- Connected the budget field to the backend.

\- Saved budgets in SQLite.

\- Restored saved budgets when loading the page.



The student reported completing this part successfully.



\## Lesson 13 Part 2 — Country and currency detection



Tasks completed:



\- Added browser geolocation.

\- Added backend reverse-geocoding endpoint.

\- Integrated country-to-currency mapping.

\- Added a Detect My Currency button.

\- Saved the detected currency.

\- Tested automatic country detection.



Initial problems:



\- `/api/detect-currency` returned HTTP 404.

\- The backend process and route were investigated.



Later:



\- The endpoint returned HTTP 400 for invalid coordinates.

\- Country detection successfully identified South Africa.

\- The app suggested ZAR.



\## Lesson 13 Part 3A — Currency formatting



Tasks completed:



\- Added currency formatting through `Intl.NumberFormat`.

\- Formatted shopping-item totals.

\- Formatted budget totals.

\- Formatted remaining-budget amounts.

\- Applied the saved currency.

\- Reduced unnecessary currency warnings.



The student reported passing all seven tests.



\## Lesson 13 Part 3B — Manual currency selection



The student requested the complete updated source code instead of continuing through individual coding exercises.



Replacement ZIP files were supplied that attempted to:



\- Add manual currency selection.

\- Retrieve currency choices.

\- Save currency preferences.

\- Integrate automatic location detection.

\- Preserve budgets and items.

\- Reduce redundant privacy notices.



\*\*The exact installed combination of these files is not independently verified.\*\*



A current browser error confirms that `/api/currencies` is missing or unavailable in the running backend.



\## Lesson 14 — Edit shopping items



A replacement ZIP was supplied to add:



\- Edit button.

\- Editing item name.

\- Editing item quantity.

\- Editing item price.

\- Updating SQLite.

\- Recalculating the budget.



The implementation was tested in a simulated browser/API environment before being supplied.



However, the actual installed version fails when saving edits.



\*\*Lesson 14 is not complete until the real application passes integration testing.\*\*



\## Lesson 15 — Local price search



\*\*Planned, not yet implemented.\*\*



Add external price-search functionality using the user's selected area.



Users manually enter any discovered prices afterward.



\## Lesson 16 — Shopping Mode



\*\*Planned, not yet implemented.\*\*



Provide a mobile-friendly shopping interface and automatically move purchased items to the bottom.



\## Lesson 17 — Multiple lists and Shop Again



\*\*Planned, not yet implemented.\*\*



Support multiple shopping lists and duplication of previous lists.



\## Lesson 18 — Dark mode and final UI



\*\*Planned, not yet implemented.\*\*



Implement dark mode, improve design consistency and finalize responsive behavior.



\## Lesson 19 — Testing and portfolio documentation



\*\*Planned, not yet completed.\*\*



Perform full testing, finalize GitHub, write documentation and prepare the Phase 2 presentation and screencast.



Lesson 19 is a target milestone, not a guarantee that no further debugging will be necessary.



\---



\# 11. CURRENT DEVELOPMENT STATUS



| Feature | Status |

|---|---|

| Node.js server | Working previously |

| Express static frontend | Working previously |

| Basic HTML/CSS design | Working previously |

| Add shopping items | Working previously |

| Quantity and price entry | Working previously |

| Item budget calculation | Working previously |

| Check/uncheck items | Working previously |

| Delete items | Working previously |

| SQLite persistence | Passed student tests |

| Saved shopping budget | Passed student tests |

| Country detection | Successfully identified South Africa |

| Automatic currency selection | Previously implemented |

| Currency formatting | Passed student tests |

| Manual currency selection | Implemented in supplied code; requires revalidation |

| Edit item details | Broken in current application |

| Currency-list endpoint | HTTP 404 |

| Local price search | Not yet implemented |

| Shopping Mode | Not yet implemented |

| Multiple lists | Not yet implemented |

| Shop Again | Not yet implemented |

| Dark mode | Not yet implemented |

| Final GitHub repository | Not yet confirmed |

| Final automated test suite | Not yet confirmed |

| Phase 2 presentation/video | Not yet completed |



Do not represent planned features as complete.



\---



\# 12. CONFIRMED CURRENT BUGS



\## BUG 1 — Editing an item returns HTTP 400



\*\*Priority: Critical\*\*



\### User action



The student clicks Edit on an existing shopping item, changes its name, quantity or price, and clicks Save.



\### Actual frontend request



Captured in Chrome Developer Tools:



```json

{

&#x20; "name": "qq",

&#x20; "quantity": 2,

&#x20; "price": 45

}

```



\### Request



A PATCH request to an existing item, for example:



`PATCH /api/items/7`



\### Actual response



HTTP status:



`400 Bad Request`



JSON response:



```json

{

&#x20; "error": "Completed must be true or false."

}

```



\### Expected result



The backend should accept the item-details edit, update SQLite and return the updated record.



The frontend should display the new name, quantity and price, and recalculate the budget.



\### Analysis



The frontend's payload is valid for an item-details edit.



The response indicates that the running backend is applying checkbox validation to a request that does not contain `completed`.



Potential causes include:



1\. A legacy checkbox-only PATCH route is still registered.

2\. Duplicate routes exist for the same path.

3\. The running Node.js process is using an older source version.

4\. The student edited a different copy of `server.js` than the one actually running.

5\. Backend routing or validation prioritizes the wrong request shape.

6\. An intermediate middleware or handler is rejecting requests incorrectly.



These are hypotheses, not confirmed causes.



\### Previous attempted fixes



The assistant supplied an updated PATCH handler intended to distinguish:



\- Checkbox updates using `completed`.

\- Item-detail updates using `name`, `quantity` and `price`.



The student applied or attempted the fix, but the same error persisted.



A second replacement handler was also supplied, and the problem remained.



\### Instructions to Codex



\*\*Do not blindly paste another PATCH route.\*\*



Instead:



1\. Inspect the exact `server.js` in the student's working directory.

2\. Search for every occurrence of `/api/items/:id`.

3\. Check for duplicate Express PATCH handlers.

4\. Check whether the old completed-only validator remains registered anywhere.

5\. Inspect route registration order.

6\. Confirm how the server is launched.

7\. Check `package.json` scripts and working directory.

8\. Identify the process currently listening on port 3000.

9\. Restart the correct server after correcting the source.

10\. Test the endpoint using the same real-world payload.

11\. Confirm HTTP 200.

12\. Retrieve the item afterward and verify its updated values.

13\. Restart Node.js and confirm the edit persists in SQLite.

14\. Confirm checkbox updates still work.

15\. Confirm budget calculations update after editing.



If possible, add an automated integration test that would have caught this regression.



\### Critical acceptance test



Send:



```json

{

&#x20; "name": "qq",

&#x20; "quantity": 2,

&#x20; "price": 45

}

```



to a valid existing item's PATCH endpoint.



Expected:



\- HTTP 200.

\- Updated name = `qq`.

\- Updated quantity = `2`.

\- Updated price = `45`.

\- Previously saved completion state preserved.

\- SQLite row updated.

\- UI total recalculated.

\- Changes survive server restart.



\## BUG 2 — Missing currency endpoint



\*\*Priority: High\*\*



\### Browser error



`GET /api/currencies`



returns:



`404 Not Found`



The frontend console reported:



`Error: The server returned HTTP 404.`



Related frontend functions were associated with loading currency options and initialization.



\### Possible causes



\- The backend does not define `/api/currencies`.

\- The route exists in a replacement ZIP but not in the running source.

\- The frontend expects a different endpoint.

\- The backend responds using an incompatible structure.

\- The running server is outdated.



\### Required fix



Inspect both frontend and backend contracts.



Ensure the currency dropdown can obtain and display supported currency codes.



Test that manual currency selection saves correctly.



Retest currency detection and currency formatting afterward.



\### Acceptance tests



\- GET `/api/currencies` returns HTTP 200.

\- Response format matches frontend expectations.

\- Manual selector displays supported currencies.

\- Selecting an appropriate currency succeeds.

\- Preference survives browser refresh.

\- Preference survives server restart.

\- Existing monetary values are not silently misrepresented.



\## BUG 3 — Favicon returns HTTP 404



\*\*Priority: Low\*\*



The browser reports:



`GET /favicon.ico`



returning HTTP 404.



This is not related to shopping-item editing.



Optional resolution:



\- Add an actual favicon and link it in HTML, or

\- Ignore the harmless missing-icon request until final UI polishing.



\## BUG 4 — Frontend/backend version synchronization



\*\*Priority: High\*\*



Multiple replacement ZIP files were supplied during development.



Some ZIPs contained:



\- server.js

\- database.js

\- app.js

\- styles.css



Other ZIPs contained additional files.



This created potential compatibility problems because:



\- `app.js` can expect a backend route that is missing.

\- `server.js` can still have old validation behavior.

\- `index.html` can lack a new frontend element.

\- Currency controls may be dynamically injected.

\- Changes can be applied to only some files.

\- An older Node.js process may remain running.



Codex should inspect all source files together and establish one internally consistent version.



\## Earlier resolved issue — Detect Currency 404



An earlier error affected:



`POST /api/detect-currency`



Diagnostic testing later confirmed the route responded correctly.



The student successfully detected South Africa afterward.



Do not assume that endpoint is still broken merely because historical error screenshots exist.



\---



\# 13. DEBUGGING PROCEDURE FOR CODEX



Use a disciplined process.



\## 13.1 Inspect the working directory



Confirm the project root.



Identify all copies of:



\- server.js

\- database.js

\- app.js

\- index.html

\- styles.css



Look for accidental duplicate project folders or extracted ZIP directories.



Determine which source directory is actually being served.



\## 13.2 Inspect the running Node.js process



The student previously used this PowerShell diagnostic:



```powershell

$connection = Get-NetTCPConnection `

&#x20;   -LocalPort 3000 `

&#x20;   -State Listen `

&#x20;   -ErrorAction SilentlyContinue |

&#x20;   Select-Object -First 1



if ($connection) {

&#x20;   $serverProcessId = \[int]$connection.OwningProcess



&#x20;   Get-CimInstance Win32\_Process `

&#x20;       -Filter "ProcessId = $serverProcessId" |

&#x20;       Select-Object ProcessId, ExecutablePath, CommandLine

}

```



At one earlier point, it returned a Node.js process running `server.js`.



That historical process ID must not be assumed to remain current.



\## 13.3 Examine API registrations



Find all occurrences of:



```text

/api/items

/api/items/:id

/api/settings

/api/settings/currency

/api/currencies

/api/detect-currency

```



Check method, order, handler implementation and validation.



Pay special attention to duplicate PATCH routes.



\## 13.4 Check syntax and dependencies



Useful commands:



```powershell

node --check server.js

node --check database.js

node --check public/app.js

npm install

```



Check `package.json` for incorrect entry points or missing scripts.



Ensure `npm start` launches the intended backend.



\## 13.5 Inspect SQLite



Read the existing schema.



Determine whether data migrations are required.



Back up the database before modifying schema.



Check table names, column names, constraints and record counts.



Do not drop and recreate populated tables as a debugging shortcut.



\## 13.6 Test the API independently



Before relying on browser behavior, use:



\- Automated tests.

\- PowerShell HTTP requests.

\- curl or similar tools.

\- Direct inspection of responses.



Verify GET, POST, PATCH and DELETE.



Only after the backend passes should frontend integration be tested.



\## 13.7 Test in the browser



Inspect Chrome Developer Tools:



\- Console.

\- Network.

\- Request Payload.

\- Response.

\- Status codes.



Verify that the exact request JSON matches the backend's accepted contract.



\---



\# 14. AUTOMATED TESTING REQUIREMENTS



The project should include meaningful tests.



Do not add a huge test framework merely for appearances.



Use lightweight tests appropriate to Express, JavaScript and SQLite.



The Node.js built-in test runner is a reasonable option.



\## 14.1 Item API tests



Test:



1\. Retrieve empty list.

2\. Create valid item.

3\. Create item with no price.

4\. Reject missing name.

5\. Reject blank name.

6\. Reject zero quantity.

7\. Reject negative quantity.

8\. Reject noninteger quantity.

9\. Reject negative price.

10\. Edit item name.

11\. Edit quantity.

12\. Edit price.

13\. Remove an existing price.

14\. Preserve completion status during item-detail edits.

15\. Check purchased item.

16\. Uncheck purchased item.

17\. Delete item.

18\. Confirm deletion.

19\. Reject invalid ID.

20\. Return 404 for missing item.



\## 14.2 Budget tests



Test:



\- Empty budget.

\- Zero budget.

\- Positive budget.

\- Invalid negative budget.

\- Adding priced items.

\- Adding unpriced items.

\- Editing prices.

\- Deleting items.

\- Checking items without changing totals.

\- Exceeding the budget.

\- Saving the budget.

\- Restoring the budget after restart.



\## 14.3 Currency tests



Test:



\- Automatic detection for a supported country using mocked external responses.

\- Manual currency selection.

\- Invalid currency code.

\- Unsupported currency code.

\- Saving a currency.

\- Restoring the saved currency.

\- Formatting known currencies.

\- Preventing unintended relabelling of existing monetary amounts.

\- Permission-denied location fallback.

\- External API failure fallback.

\- Proper privacy notice and attribution.



Avoid depending on live Nominatim responses during automated tests.



Mock the external HTTP request.



\## 14.4 Database tests



Test:



\- Database initialization.

\- Default settings creation.

\- Existing database preservation.

\- Item persistence.

\- Budget persistence.

\- Currency persistence.

\- Checkbox persistence.

\- Edit persistence.

\- Delete persistence.



Use an isolated temporary test database, not the student's real database.



\## 14.5 Browser tests



Test:



\- Add an item.

\- Edit an item.

\- Delete an item.

\- Check and uncheck an item.

\- Set a budget.

\- Change currencies.

\- Refresh.

\- Restart.

\- Navigate between lists.

\- Shop Again.

\- Shopping Mode.

\- Dark mode.



\## 14.6 Responsive tests



Test at least:



\- A desktop-width viewport.

\- A tablet-width viewport.

\- A narrow mobile-width viewport.



Verify:



\- No horizontal overflow.

\- Readable text.

\- Usable form controls.

\- Accessible buttons.

\- No overlapping elements.

\- Shopping Mode suitability.



\## 14.7 Security and correctness checks



Check:



\- Parameterized SQL queries.

\- Server-side validation.

\- Client-side validation.

\- Safe DOM text rendering.

\- No direct HTML insertion of untrusted product names.

\- No unsafe external URL construction.

\- Safe handling of missing or malformed JSON.

\- Appropriate error status codes.

\- No exposed secrets.

\- No accidental public distribution of personal SQLite data.



\---



\# 15. VISUAL DESIGN REQUIREMENTS



The visual identity was established in the Phase 1 presentation.



\## Branding



Application name:



\*\*GrocerGlow\*\*



Tagline:



\*\*Plan your basket. Know your budget.\*\*



\## Design direction



A modern grocery-planning dashboard.



The design should be:



\- Minimal.

\- Fresh.

\- Green-themed.

\- Friendly.

\- Professional.

\- Easy to navigate.

\- Legible.

\- Responsive.



\## Existing approximate colors



The initial CSS uses values similar to:



| Usage | Example |

|---|---|

| Dark-green header | `#184d37` |

| Primary green | `#218653` |

| Pale background | `#f4f8f5` |

| Light-green panels | `#e5f2e9` |

| Dark text | `#24382c` |

| Secondary text | `#64796b` |



These are illustrative established palette values.



Codex can refine the design while preserving its recognizable identity.



\## Ideal finished interface



A polished final interface should include:



\### Application header



\- GrocerGlow branding.

\- Current list name.

\- Theme toggle.

\- Currency indicator/settings.



\### List navigation



\- Select an existing list.

\- Create a new list.

\- Access Shop Again.



\### Budget panel



\- Shopping budget.

\- Estimated total.

\- Remaining/over-budget amount.

\- Budget progress visualization.

\- Warning about items without prices.



\### Add Item form



\- Product name.

\- Quantity.

\- Optional price.

\- Add Item action.



\### Shopping list



Each product should include:



\- Checkbox.

\- Name.

\- Quantity.

\- Formatted price.

\- Edit action.

\- Delete action.

\- Find Local Prices action.



\### Shopping Mode



\- Mobile-friendly layout.

\- Large checkboxes.

\- Purchased items moved down.

\- Progress indication.



\### Settings



\- Detect My Currency.

\- Manual currency dropdown.

\- Dark mode.

\- Selected area for price searches, where relevant.



Keep the interface uncluttered.



\---



\# 16. USER WORKFLOWS AND ACCEPTANCE CRITERIA



\## Workflow A — First-time shopping



1\. Open GrocerGlow.

2\. Select or create a shopping list.

3\. Set a budget.

4\. Add Milk, quantity 2, unit price 24.99.

5\. Add Avocados, quantity 3, unit price 12.50.

6\. Add Bread with no price.

7\. View the estimated total.

8\. See a warning that Bread has no price.

9\. Refresh.

10\. Confirm all data persists.



Expected estimated total:



`49.98 + 37.50 = 87.48`



\## Workflow B — Edit an item



1\. Open an existing list.

2\. Click Edit beside an item.

3\. Change its name, quantity and price.

4\. Save.

5\. Confirm the item changes immediately.

6\. Confirm the budget updates.

7\. Refresh.

8\. Confirm the edited values remain saved.



This workflow is currently failing and must be fixed first.



\## Workflow C — Purchase an item



1\. Tick Milk.

2\. Milk becomes visibly completed.

3\. Estimated total remains unchanged.

4\. Refresh.

5\. Milk remains checked.



\## Workflow D — Delete an item



1\. Click Delete.

2\. Confirm deletion if the UI uses confirmation.

3\. Item disappears.

4\. Estimated total updates.

5\. Refresh.

6\. Item stays deleted.



\## Workflow E — Automatic currency



1\. Click Detect My Currency.

2\. Grant location permission.

3\. Backend identifies country.

4\. Currency is suggested.

5\. User accepts the appropriate selection.

6\. Selected currency is saved.

7\. Monetary displays use the appropriate formatting.

8\. Refresh.

9\. Currency remains selected.



\## Workflow F — Manual currency



1\. User declines location permission.

2\. Opens currency selector.

3\. Chooses a supported currency.

4\. Preference is saved.

5\. The app handles existing monetary data safely.

6\. Refreshing retains the choice.



\## Workflow G — Price search



1\. User adds Avocados.

2\. User specifies an area.

3\. Clicks Find Local Prices.

4\. Search page opens.

5\. User researches prices.

6\. Returns to GrocerGlow.

7\. Uses Edit to enter a chosen estimate.

8\. Budget recalculates.



\## Workflow H — Shop Again



1\. Open an old shopping list.

2\. Click Shop Again.

3\. A fresh list is created.

4\. Original items remain unchanged.

5\. New items start unchecked.

6\. New list can be edited.



\## Workflow I — Shopping Mode



1\. Open a shopping list.

2\. Activate Shopping Mode.

3\. Tick purchased products.

4\. Purchased products move to the bottom.

5\. Progress changes appropriately.

6\. Refresh.

7\. Completed states remain saved.



\---



\# 17. FEATURES DELIBERATELY OUT OF SCOPE



Do not add these without explicit approval:



\- Account registration.

\- Login and password management.

\- Real-time collaborative shopping lists.

\- Paid supermarket API integrations.

\- Automatic grocery-price scraping.

\- Automatic price comparison across retailers.

\- Exchange-rate conversion.

\- Payment processing.

\- E-commerce checkout.

\- Native Android application.

\- Native iOS application.

\- Complex cloud architecture.

\- Large frontend frameworks.

\- AI-generated shopping recommendations.



The goal is an excellent, working and maintainable university portfolio project.



Do not expand scope merely to make the application appear technologically impressive.



\---



\# 18. EXPECTED FINAL PROJECT DELIVERABLES



\## 18.1 Working application



All committed core features must function correctly.



The app must run locally with documented setup instructions.



\## 18.2 Source code



Organized and readable source files.



Meaningful comments for nonobvious logic.



Avoid redundant, misleading or excessive comments.



\## 18.3 GitHub repository



A public GitHub repository containing:



\- Application source code.

\- package.json.

\- Lockfile.

\- README.

\- Any necessary installation/configuration instructions.

\- Appropriate tests.

\- Documentation.



Do not commit:



\- `node\_modules`.

\- Personal shopping data.

\- Sensitive database files.

\- Credentials.

\- `.env` files containing secrets.

\- Unnecessary generated artifacts.



\## 18.4 README.md



The README should explain:



1\. Application purpose.

2\. Key features.

3\. Technology stack.

4\. Node.js version requirements.

5\. Installation.

6\. Starting the application.

7\. How the database is initialized.

8\. How to use the application.

9\. How to run tests.

10\. Currency and location functionality.

11\. External API dependencies and limitations.

12\. Known limitations.

13\. Project architecture.

14\. Relevant acknowledgments.



The lecturer must be able to run the application without registering for a third-party service.



\## 18.5 Testing documentation



Record:



\- Test case.

\- Expected result.

\- Actual result.

\- Pass/fail status.

\- Any defects.

\- Fixes applied.



Include meaningful test evidence in the portfolio.



\## 18.6 Screenshots



Capture desktop and mobile layouts.



Useful examples:



\- Main dashboard.

\- Shopping list.

\- Budget tracker.

\- Item-edit dialog.

\- Currency selection.

\- Shopping Mode.

\- Multiple lists and Shop Again.



\## 18.7 Demonstration video



Approximately one to two minutes.



Demonstrate:



\- Opening the app.

\- Creating a list.

\- Adding an item.

\- Editing a price.

\- Budget updating.

\- Checking and deleting items.

\- Saved data after refreshing.

\- Shopping Mode.

\- Responsive mobile layout.

\- Currency selection.



The video should match actual working functionality.



\## 18.8 Phase 2 presentation



Extend the conception presentation.



Document:



\- Final technology choices.

\- Implemented application.

\- Architecture.

\- Screenshots.

\- Functionality.

\- Testing.

\- Changes from the original proposal.

\- Reasons for any changes.

\- Demonstration video.



\## 18.9 Phase 3 finalization



Address tutor feedback.



Prepare the final presentation and required ZIP in the university's specified format.



Do not assume the project is academically complete simply because the code runs.



\---



\# 19. ACADEMIC INTEGRITY AND AI USE



The student supplied IU's \*\*Guideline for the Use of AI-Supported Systems in Studies\*\*, version 1.0, dated 28 June 2025.



The guideline generally permits and encourages responsible AI assistance.



Examples of permitted assistance include:



\- Brainstorming.

\- Project planning.

\- Outlining.

\- Drafting and revising.

\- Code generation assistance.

\- Debugging.

\- Optimization.

\- Presentation design assistance.



However:



\- The student remains responsible for all submitted material.

\- AI-generated content must be critically reviewed.

\- Independent academic performance remains necessary.

\- Students must understand the code they submit.

\- Source references must be verified.

\- Plagiarism and academic integrity rules continue to apply.

\- Individual assignment restrictions take precedence.

\- AI must not replace activities explicitly requiring independent human performance.



Codex should therefore:



1\. Explain significant changes.

2\. Keep code readable.

3\. Avoid unnecessarily obscure abstractions.

4\. Document technical decisions.

5\. Provide tests.

6\. Help the student understand the result.



The project must genuinely reflect the student's technical understanding and contributions.



\---



\# 20. CODE QUALITY PRINCIPLES



Apply these consistently:



\## Correctness



\- No broken buttons.

\- No missing endpoints.

\- No conflicting request schemas.

\- No data lost unexpectedly.

\- No misleading currency values.

\- No incorrect budget arithmetic.



\## Maintainability



\- Prefer small, named functions.

\- Avoid repeated API-fetch logic.

\- Centralize currency formatting.

\- Centralize input validation where appropriate.

\- Keep route definitions organized.

\- Avoid duplicate route registrations.

\- Avoid duplicate event listeners.

\- Use one reliable state-management strategy.



\## Database consistency



\- Use parameterized SQL.

\- Maintain stable IDs.

\- Use transactions for multi-step migrations or duplication.

\- Preserve referential integrity.

\- Validate numeric values.

\- Handle null prices correctly.



\## Frontend consistency



\- Render backend-confirmed data.

\- Show errors when requests fail.

\- Update totals after changes.

\- Avoid optimistic UI changes that leave the screen inconsistent after request failure.

\- Maintain accessible labels and controls.

\- Avoid unsafe DOM insertion.



\## User experience



\- Fast response.

\- Clear messaging.

\- Minimal clutter.

\- Good keyboard behavior.

\- Good mobile behavior.

\- Appropriate confirmation for destructive actions.



\## Reliability



\- Application should start consistently.

\- README should match actual commands.

\- Tests should run without modifying the student's real database.

\- Geolocation failures must not break grocery management.



\---



\# 21. PRIORITIZED DEVELOPMENT PLAN FOR CODEX



Do the following in order.



\## Priority 1 — Fix existing integration problems



\*\*Do this before implementing Lesson 15.\*\*



1\. Inspect the actual local files.

2\. Identify and fix PATCH item-edit validation.

3\. Confirm checkbox PATCH still works.

4\. Fix `/api/currencies` 404.

5\. Verify currency UI and backend contracts.

6\. Run integration tests.

7\. Confirm no existing data was lost.



Deliver a short diagnostic explaining the actual root cause.



\## Priority 2 — Stabilize the codebase



1\. Clean up duplicate or obsolete code.

2\. Ensure `package.json` scripts work.

3\. Standardize API responses.

4\. Improve errors.

5\. Add automated tests for existing functionality.

6\. Ensure the README accurately describes the application.

7\. Preserve the established visual design.



Avoid unnecessary rewrites.



\## Priority 3 — Implement Lesson 15



Build the external local-price-search feature.



Use ordinary web-search navigation and manual price entry.



Do not implement unnecessary retailer API integrations.



\## Priority 4 — Implement Lesson 16



Build Shopping Mode.



Keep items linked to the same stored data.



Purchased items should move to the bottom without being deleted.



\## Priority 5 — Implement Lesson 17



Implement multiple shopping lists and Shop Again.



Use a safe SQLite migration.



Preserve existing data.



\## Priority 6 — Implement Lesson 18



Add dark mode and final responsive styling.



Polish the UI without sacrificing usability.



\## Priority 7 — Implement Lesson 19



Complete:



\- Automated tests.

\- Manual test cases.

\- Browser tests.

\- Responsive tests.

\- README.

\- GitHub readiness.

\- Screenshots.

\- Phase 2 documentation support.



Do not automatically mark the project complete until acceptance tests pass.



\---



\# 22. WHAT CODEX SHOULD REPORT BACK



After inspecting the repository, provide:



\## A. Repository audit



A concise description of:



\- Project structure.

\- Main entry point.

\- Available routes.

\- Database schema.

\- Implemented features.

\- Missing features.

\- Duplicate or obsolete logic.



\## B. Root cause of current bugs



Explain the actual cause of:



1\. PATCH item-edit HTTP 400.

2\. GET currencies HTTP 404.



Provide file names and relevant code locations.



\## C. Fix summary



For every changed file:



\- Explain what changed.

\- Explain why.

\- Confirm whether other files depended on that change.



\## D. Tests executed



List commands and results.



Clearly distinguish:



\- Passed tests.

\- Failed tests.

\- Tests not executed.

\- Tests requiring the student's browser.



\## E. Data preservation



Confirm that:



\- The existing SQLite file was not deleted.

\- Existing data was preserved.

\- Migrations, if any, were safe.



\## F. Remaining work



Provide an honest updated checklist of remaining Lesson 15–19 features.



\## G. Student explanation



Explain the important fixes in straightforward language so the student understands them.



\---



\# 23. RECOMMENDED FINAL DEMONSTRATION SCENARIO



A complete demonstration could follow this sequence:



1\. Launch GrocerGlow.

2\. Open the default grocery list.

3\. Show the clean dashboard.

4\. Set a budget of 1000 in the chosen currency.

5\. Add Milk, quantity 2, estimated price 24.99.

6\. Add Avocados, quantity 3, price 12.50.

7\. Add Bread without a price.

8\. Show the estimated total and missing-price notice.

9\. Edit the avocado quantity and observe the updated total.

10\. Use Find Local Prices for Bread.

11\. Enter a manually researched price.

12\. Check Milk as purchased.

13\. Switch to Shopping Mode and show Milk at the bottom.

14\. Create a fresh list through Shop Again.

15\. Demonstrate manual currency selection on an appropriate list.

16\. Show automatic country-based currency detection.

17\. Toggle dark mode.

18\. Refresh and demonstrate persistence.

19\. Show the app on a narrow mobile viewport.



This is a complete functional acceptance scenario, not necessarily the exact sequence to fit in the university's short video.



The actual screencast should be edited to show representative features within the required duration.



\---



\# 24. DEFINITION OF DONE



GrocerGlow should only be considered development-complete when:



\- All Phase 1 committed functionality is implemented or any changes are explicitly documented.

\- Every main button works.

\- Item editing works.

\- Item deletion works.

\- Purchased status persists.

\- Budgets persist.

\- Currency settings persist.

\- Multiple lists work.

\- Shop Again works.

\- Price search works.

\- Shopping Mode works.

\- Dark mode works.

\- The application is responsive.

\- SQLite survives server restarts.

\- The application works without requiring external service registration.

\- Relevant API tests pass.

\- Relevant browser tests pass.

\- Installation instructions are accurate.

\- Source code is organized and documented.

\- No critical console or API errors remain.

\- GitHub repository is prepared.

\- The university's Phase 2 evidence is prepared.

\- The student understands and can explain the implementation.



Phase 3 remains a separate academic stage involving final feedback and submission.



\---



\# 25. FINAL DIRECT REQUEST TO CODEX



\*\*Please inspect the actual GrocerGlow project currently open in your working directory.\*\*



Start by resolving these confirmed problems:



\*\*Problem 1\*\*



Editing an item sends:



```json

{

&#x20; "name": "qq",

&#x20; "quantity": 2,

&#x20; "price": 45

}

```



to:



`PATCH /api/items/7`



but receives HTTP 400:



```json

{

&#x20; "error": "Completed must be true or false."

}

```



\*\*Problem 2\*\*



The frontend requests:



`GET /api/currencies`



and receives HTTP 404.



Determine the real root causes by inspecting the current files, duplicate route definitions, frontend payloads and running server configuration.



Fix both issues while preserving working shopping-list functionality, automatic location detection, manual currency selection, saved budgets and SQLite data.



Afterward, run appropriate tests and report what passed.



Do not proceed to Lesson 15 until these two integration errors have been fixed and verified.



Once the application is stable, continue developing GrocerGlow according to the remaining features and academic requirements in this document.



\*\*Preserve the existing application, keep the implementation understandable, and help the student learn from the changes.\*\*



\---



\*\*END OF GROCERGLOW PROJECT HANDOFF\*\*

