# Finding & Updating Cell Values with ExcelJS — Notes

## Goal of this lecture
Two related tasks, both built on the same row/cell traversal from the previous lecture:
1. **Search** the sheet for a specific value (`'Apple'`) and report its **coordinates** (row number, column number).
2. **Update** a cell's value in place and **persist** the change back to the `.xlsx` file (`'Banana'` → `'Republic'`).

## 1. Finding a value — `toFindApple()`
Same nested `eachRow` / `eachCell` loop as before, but now with an `if` check:
```js
if (cell.value === 'Apple') {
    console.log(rowNumber)   // which row it was found on
    console.log(colNumber);  // which column it was found on
}
```
Because `rowNumber`/`colNumber` are the loop's own index arguments, the moment the loop lands on the matching cell, those two variables **already hold the exact coordinates** of that match — no extra bookkeeping needed to just print them.

## 2. Reading/writing an arbitrary cell — `worksheet.getCell(row, col)`
Once you know *where* a value is, ExcelJS gives direct (non-iterating) access to any single cell:
```js
const cell = worksheet.getCell(row, column);
cell.value;            // read
cell.value = 'iPhone';  // write (in memory only, not saved yet)
```
This is the 4th worksheet-level method pattern (after workbook→worksheet, worksheet→rows, row→cells): **worksheet → direct cell by coordinate**.

## 3. Persisting the change — `workbook.xlsx.writeFile(path)`
Setting `cell.value = ...` only changes the **in-memory** workbook object. To actually save it to disk:
```js
await workbook.xlsx.writeFile("./excelDownloadTest.xlsx");
```
Mirrors the read side exactly: `readFile()` loads workbook → file, `writeFile()` saves workbook → file. Both are **async**, so both need `await` (or `.then()`).
⚠️ Close the Excel file in Excel/any viewer before running the script — an open file can cause write/lock issues or a "repaired" warning when reopened (ExcelJS rewrites the full zip/XML structure, which can look different enough that Excel flags it, but the data itself is correct).

## 4. Avoiding hard-coded coordinates — the `output` object pattern
Problem: `rowNumber`/`colNumber` inside the `eachRow`/`eachCell` callbacks are **block-scoped** — they don't exist outside the loop. You can't just reference them after the loop ends.

Fix: declare a plain object **outside** the loop with default/sentinel values, and mutate its properties from inside the loop:
```js
let output = { row: -1, column: -1 };   // note: your file currently names this `otput` — likely a typo for `output`

worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
        if (cell.value === 'Banana') {
            output.row = rowNumber;
            output.column = colNumber;
        }
    });
});

const cell = worksheet.getCell(output.row, output.column);
cell.value = 'Republic';
```
This is a very common JS pattern: **"capture a value found deep inside a callback/loop by writing it onto an object declared in the outer scope"** — since objects are passed by reference, mutating `output.row` inside the callback is visible outside it, unlike a primitive `let row` re-declared inside the loop.

## Current file note
[82_read-update.js](82_read-update.js) has `toFindApple()` and `toGetOrReplaceCellValue()` as two separate functions (cleaner than the transcript's single-script-with-globals approach) — this already anticipates next lecture's refactor into separate reusable read/write functions.

## Key interview takeaways
1. **Mutating a cell object doesn't save the file** — ExcelJS keeps an in-memory representation; `writeFile()`/`readFile()` are the only disk I/O points.
2. **`getCell(row, col)` vs `eachRow`/`eachCell`**: use `eachRow`/`eachCell` to *search/scan* all data; use `getCell` to *jump directly* to a known coordinate once you have it.
3. **Scope leak / closure pattern**: when you need a value computed inside a callback to survive after the callback ends, assign it to a property of an object declared in the enclosing scope — don't rely on loop-local `let`/`const` variables outside their block.
4. **Dynamic vs hard-coded cell references**: hard-coding `getCell(3, 2)` is brittle (breaks if the sheet's data order changes); searching first and feeding the found coordinates into `getCell()` makes the code data-driven and reusable for different source values (e.g., find-and-replace for any arbitrary term).
5. **Read + Write round trip = 4 async steps**: `new Workbook()` → `readFile()` (await) → mutate `cell.value` → `writeFile()` (await). All file I/O is async; forgetting `await` on either read or write reproduces the same "undefined"/corrupt-file class of bugs seen in the previous lecture.
