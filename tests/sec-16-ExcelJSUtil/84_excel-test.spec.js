const ExcelJS = require('exceljs');
const { test, expect} = require('@playwright/test');


//update mango price to 350
//scans every row/cell of the downloaded sheet looking for the cell whose VALUE equals searchText
//(e.g. "Mango") and returns its row+column position - this is how we locate a row without knowing its
//row number in advance, since download order/row count can vary.
async function readExcelChange(worksheet, searchText){
    let output={row:-1,column:-1}
     worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if(cell.value===searchText){
                output.row=rowNumber
                output.column=colNumber
            }
        });
    });
    return output;
}

async function writeExcelTestChange(searchText, replaceText, change, filePath) {
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet('Sheet1'); // name is case-sensitive, actual sheet is "Sheet1"
    const output = await readExcelChange(worksheet, searchText);

    //rowChange/columnChange = OFFSET from the found cell, not an absolute position - e.g.
    //{rowChange:0, columnChange:2} means "same row, 2 columns to the right", which for Fruit Name (col 2)
    //lands exactly on Price (col 4), matching the site's 5-column layout (S.No, Fruit, Color, Price, Season).
    const cell=worksheet.getCell(output.row+change.rowChange, output.column+change.columnChange)
    cell.value=replaceText
    //rewriting
    //ExcelJS edits are in-memory until writeFile() - this overwrites the SAME downloaded file on disk
    //with the modified price, so the next upload step reads back our tampered value.
    await workbook.xlsx.writeFile(filePath);
}
//writeExcelTestChange("Mango", 350,{rowChange:0,columnChange:2},"./excelDownloadFresh.xlsx");



test('@Web upload download excel validation', async ({page}) => {
    const textSearch = "Mango";
    const updateValue ="350";
    await page.goto('https://rahulshettyacademy.com/upload-download-test/index.html');
    //must set up the download LISTENER before the click - same "register first, trigger second" rule
    //seen with page.route() - otherwise the download event can fire before anything is watching for it.
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download'}).click()
    await downloadPromise;
    //this is a REAL file on disk (not an in-memory mock like the earlier route interception lectures) -
    //we edit the actual downloaded .xlsx, then re-upload it, to prove the app reflects whatever data the
    //uploaded file contains (classic upload/download round-trip test).
    await writeExcelTestChange(textSearch, updateValue,{rowChange:0,columnChange:2},"/Users/krishnaveni_mestree/Downloads/download.xlsx");
    await page.locator('#fileinput').click();
    await page.locator('#fileinput').setInputFiles('/Users/krishnaveni_mestree/Downloads/download.xlsx');
    //ASSERTION STRATEGY mirrors the Excel-writing strategy above exactly: there, we first found the
    //"Mango" cell, then moved sideways to its Price cell. Here, we first find the ROW containing "Mango"
    //text, then search only WITHIN that row for the Price cell - same "find anchor, then move relative
    //to it" pattern, just applied to locators instead of worksheet cells.
    //why filter by text instead of page.locator('#cell-4-undefined') directly: that id is NOT unique -
    //every row's price cell shares it (a quirk of this data-grid library), so searching the whole page
    //for it would return every row's price, not specifically Mango's. Scoping the search to ONE row first
    //(via getByRole('row').filter({hasText})) is what makes '#cell-4-undefined' resolve to a single,
    //unambiguous cell - the same id, now searched only inside Mango's own row subtree.
    const desiredRow=page.getByRole('row').filter({hasText: textSearch});
    //desiredRow.locator(...) - searching FROM desiredRow restricts playwright to look only inside that
    //row's own DOM subtree, instead of page.locator(...) which would scan the entire page again.
    //final check: did the value we just WROTE into the Excel file (350) actually make it, through the
    //upload, into the rendered table cell? If yes, the whole download -> edit -> upload round trip works.
    await expect(desiredRow.locator('#cell-4-undefined')).toContainText(updateValue);


})

