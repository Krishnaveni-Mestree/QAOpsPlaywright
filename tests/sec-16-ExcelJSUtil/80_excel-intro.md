# Excel Automation with ExcelJS — Section Intro Notes

## What this section covers
This section teaches **reading, writing, and modifying Excel data using pure JavaScript**
(no Cypress/Playwright/Selenium/Postman involved yet). The idea: learn the core
JS logic first, then plug it into *any* JS-based automation framework later
(Cypress, Playwright, WebdriverIO, Postman scripts, etc.).

**Why it matters for your career:** Excel validation (reading test data, writing
results/reports) is a very common requirement in real test automation frameworks.
Interviewers at the "upskilling to next level" stage often ask how you handle
data-driven testing from Excel — knowing the raw JS mechanics (not just a
framework wrapper) shows deeper understanding.

## The tool: ExcelJS
- npm package: `exceljs` (search "npm js excel js" / npmjs.com/package/exceljs)
- Lets you **read, manipulate, and write** both `.xlsx` Excel files and JSON.
- Install: `npm install exceljs` (or `npm install exceljs --save-dev`)

## Practice data
- Source: `rahulshettyacademy.com` → "Upload Download" test page → download the sample Excel file.
- Renamed locally to something like `Excel-download-test.xlsx` for practice.

## Step-by-step project setup (what was demonstrated)
1. **Create a project folder** first, e.g. `ExcelJSUtil`.
2. **`cd` into that folder** before running any npm commands.
   - ⚠️ Common beginner mistake shown in the transcript: running `npm init`
     *before* `cd`-ing into the folder creates `package.json` in the wrong
     (parent) directory.
3. **`npm init`** — initializes a Node.js project.
   - Walks you through prompts (package name, version, description, entry point, etc.) — you can just press Enter to accept defaults.
   - Creates **`package.json`**, which is required before you can add any external dependency (npm packages) to a Node project.
4. **Open the folder in VS Code** to write/organize your JS files.
5. **`npm install exceljs`** — downloads the ExcelJS package and its dependencies into `node_modules/`.
   - Plain `npm install <pkg>` installs the package but does **not** automatically record it in `package.json` dependencies in some npm configurations/older npm behavior (as demonstrated) — though in modern npm (v5+) it does add it to `dependencies` by default.
6. **`npm install exceljs --save-dev`** — explicitly adds the package as a **dev dependency** entry in `package.json` (`devDependencies` section).
   - This is what makes the project **portable/shareable**: anyone who receives the project (zipped or via git) can run plain `npm install` and npm will read `package.json` and auto-download *every* listed dependency — no need to remember individual package names.
7. Delete `node_modules` and re-run `npm install` to prove this — confirms that as long as `package.json` has the dependency entries, `node_modules` can always be regenerated from scratch.
8. Create your working file, e.g. `excel-demo.js`, where you'll write the actual read/write code (covered in the *next* lecture).

## Key concepts to remember for interviews

| Concept | Explanation |
|---|---|
| `package.json` | Manifest file for a Node project — lists metadata + dependencies. Required before adding any npm package. |
| `npm init` | Scaffolds `package.json` interactively (or `npm init -y` to skip prompts with defaults). |
| `node_modules/` | Folder where all installed packages (and their transitive dependencies) physically live. Not committed to git — regenerated via `npm install`. |
| `npm install <pkg>` | Downloads a package. Modern npm versions (≥5) add it to `dependencies` automatically. |
| `npm install <pkg> --save-dev` (or `-D`) | Installs the package **and** records it under `devDependencies` — used for packages only needed in development/testing (not runtime production code), e.g. test utilities, linters, Excel helpers used only in test scripts. |
| `dependencies` vs `devDependencies` | `dependencies` = needed to run the app in production; `devDependencies` = only needed for building/testing. For test automation frameworks, most npm packages (Playwright, ExcelJS used in tests, etc.) are typically `devDependencies`. |
| `package-lock.json` | Locks exact installed versions (including transitive deps) for reproducible installs across machines/CI. |
| Portability | Sharing a project without `node_modules` (just `package.json` + `package-lock.json`) + running `npm install` recreates the exact dependency tree — standard practice, keeps repos small (`node_modules` is gitignored). |

## Where this is heading (next lecture)
- Actual code: using `exceljs` to **read** cell/row/column values from the downloaded `.xlsx` file, and later **write/update** values back.
- After mastering plain JS read/write, the course will show integrating this into Cypress/Playwright/WebdriverIO test frameworks for data-driven testing (e.g., reading test data rows from Excel, or writing execution results back to Excel).

## Possible interview questions this section prepares you for
1. How do you read data from an Excel file in a JavaScript-based test automation framework?
2. What's the difference between `npm install` and `npm install --save-dev`?
3. Why is `package.json` required, and what happens if it's missing?
4. How would you implement data-driven testing using an Excel sheet as the data source?
5. Why don't we commit `node_modules` to version control?
6. How do you handle reading/writing `.xlsx` files vs `.csv` — what library would you use and why (ExcelJS vs `xlsx`/`csv-parse`)?
