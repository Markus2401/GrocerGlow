# Technical decisions and student walkthrough

1. **Vanilla browser code, Express, SQLite:** forms/feedback in the browser; request validation in Express; local persistence in SQLite. No build system/cloud account is needed to explain or run the project.
2. **Partial PATCH:** validate only supplied fields and preserve the others. A name/quantity/price edit need not send a checkbox. Tests cover the historical completed-validation error and `/api/currencies` route contract; stale server processes can otherwise make routes appear missing.
3. **List ownership:** every item belongs to a list. Scoped queries and transactional copy/delete/reset preserve other lists. Legacy endpoints choose the oldest remaining list rather than a global active-list variable.
4. **Transactions:** a failed migration/reset cannot leave half-applied changes. A legacy SQLite backup precedes schema changes. Different currency labels require confirmation because labeling is not conversion.
5. **Money comparisons:** binary floating point can make `0.1 + 0.2` slightly larger than `0.3`. Rounding estimates to thousandths avoids “over budget by zero”; stored unit prices are not rewritten. This is estimation, not accounting.
6. **Separate asynchronous outcomes:** a committed currency change remains reflected even if the next refresh fails. Failed budget saves restore the last saved amount. List controls stay locked throughout mutations and geolocation permission, preventing late results acting on another selected list.
7. **Focus survives DOM changes:** rendering replaces rows, so checkbox/Edit handlers explicitly restore the corresponding control. Modal Tab boundaries and Escape/opener restoration are tested. Item/list deletion asks for confirmation.
8. **External data through Express:** approximate, user-triggered location calls are cached/throttled. County/municipality names are not invented as towns. Google research links are navigation, not API consumption, scraping or automatic price import.
9. **Local safety:** loopback default, JSON limits, SQL placeholders, generic errors and a same-origin Content Security Policy suit a local app. Wider multiuser hosting needs separate security work.
10. **Evidence has limits:** backend tests, browser tests, syntax/format checks, axe scans and clean exports cover different risks. Real phone/location, published GitHub, remote CI and university deliverables need separate verification.

## Concept evolution

- Automatic store-price import became user-initiated research links: no retailer account/API/scraping dependency; users save estimates themselves.
- Settlement-aware location added city/town/village/hamlet and country-only/manual fallback.
- Independent lists and Shop Again replaced single-list storage through a preserving migration.
- Shopping Mode and themes improve use without creating separate grocery data.
- This quality audit adds reliability and evidence, not unrelated features.

## Conventions and cleanup

Four-space indentation, semicolons, double quotes and Prettier. Prefer `const` and small named helpers. User strings use `textContent`. SQL values use placeholders; migration table names are internal hard-coded choices. Comments explain preservation, transactions and asynchronous state. Express 5 forwards synchronous exceptions to one error handler, replacing seven repetitive catches. Migration's separate rollback/close handler remains because it has a different purpose. Browser suites share startup/cleanup helpers with timeouts instead of duplicating child-process/database lifecycle code.
