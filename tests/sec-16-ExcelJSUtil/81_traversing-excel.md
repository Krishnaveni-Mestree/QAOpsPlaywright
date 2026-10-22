# Traversing (Reading) an Excel File with ExcelJS — Notes

## Goal of this lecture
Read every cell of every row in an Excel sheet and print it to the console,
using the `exceljs` library. Also understand **why** async handling (`.then` /
`async-await`) is mandatory here.

## Step-by-step object model (library → workbook → worksheet → row → cell)

```
require('exceljs')              -> the whole library (a class/module)
        │
new ExcelJs.Workbook()           -> an "object" (instance) of the Workbook class
        │                           gives access to workbook-level methods (e.g. .xlsx)
workbook.xlsx.readFile(path)     -> loads an .xlsx file INTO that workbook object (async!)
        │
workbook.getWorksheet('sheet1')  -> pick ONE sheet out of possibly many in the workbook
        │
worksheet.eachRow((row, rowNumber) => {...})   -> outer loop: iterates every row that has data
        │
row.eachCell((cell, colNumber) => {...})       -> inner loop: iterates every cell in that row
        │
cell.value                        -> the actual value held in that single cell
```

Think of it exactly like **nested for-loops**:
- Outer loop = rows (`eachRow`)
- Inner loop = cells/columns within the current row (`eachCell`)
- For row 1, every cell is printed first, **then** row 2 starts, and so on, until all 7 rows are done.

`rowNumber` / `colNumber` are just index trackers passed as the 2nd argument — handy if you need to know "which row/column am I on" instead of just the value.

## The async problem (core interview topic!)

`workbook.xlsx.readFile(path)` is **asynchronous** — reading a file from disk takes time (even if just milliseconds), and JavaScript does **not** wait by default. It fires off the read operation and immediately moves to the next line of code.

**What goes wrong if you don't handle it:**
```js
const workbook = new ExcelJs.Workbook();
workbook.xlsx.readFile("./excelDownloadTest.xlsx");   // kicks off async read, doesn't wait
const worksheet = workbook.getWorksheet('sheet1');     // runs immediately — file isn't loaded yet!
```
Result: `Cannot read properties of undefined (reading 'eachRow')` — because `worksheet` is `undefined` (the workbook had no sheets loaded yet when `getWorksheet` ran).

### Two ways to fix it — both shown in [81_traversing-excel.spec.js](81_traversing-excel.spec.js)

**1. Promise `.then()` (callback style)**
```js
workbook.xlsx.readFile(path).then(function () {
    // guaranteed to run only AFTER the file is fully read
    const worksheet = workbook.getWorksheet('sheet1');
    ...
});
```
`readFile()` returns a Promise; `.then()` registers a callback that only runs once that promise resolves (i.e., once the file is actually loaded).

**2. `async` / `await` (modern, more readable style)**
```js
async function traverseExcel() {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(path);   // pauses HERE until the read completes
    const worksheet = workbook.getWorksheet('Sheet1');
    ...
}
traverseExcel();   // you must CALL the function — defining it alone does nothing
```
Key rule: **`await` can only be used inside a function declared `async`.** You can't sprinkle `await` into normal top-level code (well — top-level `await` exists in ES modules, but in plain CommonJS `.js` test files like this one, wrap it in an `async function`).

Also important: a function definition (`async function traverseExcel() {...}`) just *declares* the function — nothing executes until you explicitly **call** it (`traverseExcel();`) at the bottom of the file.

## Running the file
```bash
node 81_traversing-excel.spec.js
```
Plain Node execution — no test runner needed yet, this is pure JS.

## Key interview takeaways
1. **Why is file reading async in Node.js?** I/O operations (disk, network) are non-blocking by design so the event loop isn't frozen waiting on slow operations.
2. **`.then()` vs `async/await`** — functionally equivalent (both consume Promises), `async/await` is just syntactic sugar that reads more like synchronous code.
3. **Common bug pattern:** "Cannot read properties of undefined" right after a file-read/API-call line is a classic sign of **missing await/`.then()`** — the next line ran before the async operation resolved.
4. **`eachRow` / `eachCell`** only iterate over **non-empty** rows/cells — skips blank ones, iterates only populated data.
5. **Nested iteration pattern**: worksheet → rows → cells is the standard traversal model for any spreadsheet library (ExcelJS, SheetJS/xlsx, etc.) — same mental model applies elsewhere.
