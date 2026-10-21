# IU assessment readiness — DLBCSPJWD01

Reviewed **21 October 2026** against the supplied assignment requirements and project checklist. The original assignment PDF, presentation, tutor feedback and PebblePad submission were not available for independent inspection. Confirm the active assignment instructions and formal limits with the tutor.

## Technical requirements

| Requirement                                        | Status and evidence                                                                                                                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functioning browser frontend                       | Implemented: `public/`; shopping, list and audit browser suites                                                                                                             |
| Custom backend                                     | Implemented: Node.js/Express in `server.js`                                                                                                                                 |
| At least two dynamic frontend/backend interactions | Implemented: item CRUD, list management, budget saving, currencies and optional geocoding                                                                                   |
| Persistent storage                                 | Implemented: SQLite; restart persistence and migration tests                                                                                                                |
| Responsive design                                  | Automated viewport checks at 320–1440px; screenshots in TEST_PLAN                                                                                                           |
| Input validation/error handling                    | Backend rejection cases, browser feedback and simulated failure tests                                                                                                       |
| Understandable code/documentation                  | Responsibility boundaries, README setup, decisions and test cases                                                                                                           |
| Reproducible installation                          | Published `main` clean GitHub clone installed, started and passed; cleaned 37-file source also installed, started and passed all suites independently                       |
| Meaningful tests                                   | 32 backend tests; three browser suites covering 8, 5 and 7 groups                                                                                                           |
| Backend consumption of external data               | Nominatim through `location.js`; Google navigation is separate                                                                                                              |
| GitHub publication/CI                              | Application on `main` at `8736aec`; [Actions passed](https://github.com/Markus2401/GrocerGlow/actions/runs/39568677971). Cleanup publication and a new run require approval |
| Public GitHub for submission                       | **Pending owner approval:** repository remains private                                                                                                                      |

## Manual technical checks still required

- Real GPS detection with consent: correct town/country, browser/OS permission, denial/manual override and currency confirmation. Automation uses synthetic locations.
- Physical phone: navigation, touch targets, dialogs, on-screen keyboard and zoom.
- Screen reader: labels, status/error announcements, dialog flow and purchase checkmarks. Keyboard/axe results do not replace this check.

Record device/browser, steps, expected/actual results and fixes before claiming these checks passed. Keep private grocery data and precise coordinates out of evidence.

## Phase 2 deliverables — outstanding

1. Preserve the Phase 1 presentation and extend it with the final problem/solution, architecture, methodology and concept changes. The supplied checklist specifies at most ten additional slides; verify the current brief.
2. Include annotated desktop/responsive screenshots and meaningful test results. Explain browser-to-Express-to-SQLite data flow and backend geocoding.
3. Obtain approval to publish this cleanup and separately to make the repository public. Verify signed-out access, source and passing Actions afterward. Put the public link on the title slide and in the required PebblePad field.
4. Record desktop/responsive demonstration with narration or subtitles. The supplied checklist specifies 1–2 minutes, no longer than two minutes; follow the active instructions.
5. Integrate the demonstration as required, inspect the PPTX in PowerPoint and submit through PebblePad. Repository tests do not perform these actions.

## Phase 3 — future work

Collect and address tutor feedback. Extend the existing presentation with solution breakdown, development process and lessons learned; the supplied checklist specifies at most ten further slides. Export and test the source ZIP, then submit it with the updated PPTX and GitHub link according to current instructions. Tutor feedback and final submission are not complete.

## Assessment evidence map

| Area                         | Evidence                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Problem/objective            | README purpose and planning workflow                                                  |
| Methodology/decisions        | TECHNICAL_DECISIONS; relate choices to the original concept                           |
| Implementation/documentation | Source, API, schema, setup and tests                                                  |
| Creativity/correctness       | Shop Again, Shopping Mode, list isolation and estimate safeguards                     |
| Formal submission            | Student-reviewed slides/video, public link, required files and PebblePad confirmation |

Technical success does not complete university deliverables. GrocerGlow is not declared 100% complete while public access, manual checks and submission materials remain outstanding.
