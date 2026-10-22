const ExcelJs = require('exceljs');

//to find Apple and log its location (row and column)
async function toFindApple() {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile("./excelDownloadTest.xlsx")
    const worksheet = workbook.getWorksheet('Sheet1'); // name is case-sensitive, actual sheet is "Sheet1"
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if(cell.value==='Apple'){
                console.log(rowNumber)
                console.log(colNumber);
            }
        });
    });
}

//call the async function
toFindApple();



//to get or replace cell value
async function toGetOrReplaceCellValue() {
    let otput={row:-1,column:-1}
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile("./excelDownloadTest.xlsx")
    const worksheet = workbook.getWorksheet('Sheet1'); // name is case-sensitive, actual sheet is "Sheet1"
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if(cell.value==='Banana'){
                otput.row=rowNumber
                otput.column=colNumber
            }
        });
    });

    const cell=worksheet.getCell(otput.row, otput.column)
    cell.value='Republic'
    //rewriting
    await workbook.xlsx.writeFile("./excelDownloadTest.xlsx");
}

//call the async function
toGetOrReplaceCellValue();
