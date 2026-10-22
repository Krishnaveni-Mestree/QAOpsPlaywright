# Generic, Reusable Read/Write Functions — Notes

## Goal of this lecture
Refactor the previous hard-coded read/write code into **two generic, reusable functions**
(`readExcel` + `writeExcelTest`) that take everything — worksheet, search text, replace
text, file path — as **parameters**, so the same code can be reused for any Excel file,
any search term, any replacement, without touching the function bodies.

## The refactor: from hard-coded script → parameterized functions

| Before (hard-coded) | After (generic) |
|---|---|
| `'Banana'` typed directly in the `if` | `searchText` passed in as a function argument |
| `'Republic'` typed directly as the new value | `replaceText` passed in as a function argument |
| `"./excelDownloadTest.xlsx"` typed directly | `filePath` passed in as a function argument |
| `worksheet` built fresh inside the search function | `worksheet` passed in as a function argument |

```js
async function readExcel(worksheet, searchText) {
    let output = { row: -1, column: -1 };
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value === searchText) {
                output.row = rowNumber;
                output.column = colNumber;
            }
        });
    });
    return output;   // <-- KEY: output must be returned, or the caller never sees it
}

async function writeExcelTest(searchText, replaceText, filePath) {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Sheet1');
    const output = await readExcel(worksheet, searchText);   // <-- must await, it's async

    const cell = worksheet.getCell(output.row, output.column);
    cell.value = replaceText;
    await workbook.xlsx.writeFile(filePath);
}

writeExcelTest("Banana", "Republic", "./excelDownloadFresh.xlsx");
```

## Two bugs hit during the refactor (both are classic, interview-worthy mistakes)

1. **"Cannot read properties of undefined"** — forgetting to `return output;` from `readExcel`.
   A function with no explicit `return` implicitly returns `undefined`; the caller (`writeExcelTest`)
   then tries to use `output.row`/`output.column` on `undefined`.
2. **Still getting wrong/undefined values after adding `return`** — forgetting `await` when *calling* `readExcel()`.
   Even though `readExcel` returns the `output` object, because `readExcel` is `async`, calling it
   returns a **Promise**, not the object itself. Without `await`, `output` in `writeExcelTest` is a
   pending Promise, not `{row, column}` — you must `await readExcel(...)` to get the resolved value.

**Lesson:** any time a function is declared `async`, *every* caller of it must either
`await` the call or `.then()` it — forgetting this at any layer (not just the outermost
`readFile`/`writeFile`) reproduces the same "value isn't what I expect yet" class of bug.

## Taking it further — the `change` object: relative coordinate offsets

Real scenario: *"update Mango's price to 350"* — you don't search for the price cell
directly (there's no literal `'299'` to search for reliably), you search for `'Mango'`
and then **navigate relative to that cell** (e.g., "same row, 2 columns to the right").

```js
async function writeExcelTestChange(searchText, replaceText, change, filePath) {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Sheet1');
    const output = await readExcelChange(worksheet, searchText);

    const cell = worksheet.getCell(
        output.row + change.rowChange,       // same row -> rowChange: 0
        output.column + change.columnChange  // 2 cells right -> columnChange: 2
    );
    cell.value = replaceText;
    await workbook.xlsx.writeFile(filePath);
}

writeExcelTestChange("Mango", 350, { rowChange: 0, columnChange: 2 }, "./excelDownloadFresh.xlsx");
```

This is the **same "found coordinates" pattern as `output`**, just applied a second time:
instead of hard-coding "move 2 columns," the offset itself becomes a parameter
(`{ rowChange, columnChange }`), so the function works for *any* "find X, then edit a
cell N rows/columns away from it" scenario — not just price columns.

## Key interview takeaways
1. **Function parameterization** turns a one-off script into a reusable utility — a core
   principle for building Excel helper libraries that plug into automation frameworks
   (Cypress commands, Playwright fixtures, WebdriverIO custom helpers, etc.).
2. **Always `return` from a function whose result you need elsewhere** — an implicit
   `undefined` return is a very common silent bug source.
3. **`async` functions always return a Promise** — calling one without `await`/`.then()`
   gives you the Promise object, not the resolved value. This is true no matter how deep
   in the call chain the `async` function sits (`readExcel` here isn't even doing I/O
   itself, but it's still `async`, so the same rule applies).
4. **Relative/offset-based cell navigation** (`row + rowChange`, `column + columnChange`)
   is a practical pattern for "find an anchor cell, then edit a related cell nearby" —
   common in real spreadsheets where a label (e.g., "Mango") and its associated data
   (e.g., price) live in the same row at a fixed column offset.
5. **Design principle demonstrated**: push *all* variability (file path, search term,
   replacement value, worksheet, and even the offset) up to the function's parameter
   list; keep the function body itself free of literals specific to any one use case.
