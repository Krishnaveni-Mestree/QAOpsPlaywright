const ExcelJs = require('exceljs');

// readFile() is async -> code after .then() only runs once the file is fully loaded
const workbook = new ExcelJs.Workbook();
workbook.xlsx.readFile("./excelDownloadTest.xlsx").then(function(){
    const worksheet = workbook.getWorksheet('Sheet1');
    // outer loop: every non-empty row
    worksheet.eachRow((row, rowNumber) => {
        // inner loop: every non-empty cell in that row
        row.eachCell((cell, colNumber) => {
            console.log(cell.value);
        });
    });
});



//another way to traverse Excel using async/await
// same .then() approach, just with an arrow function instead of function(){}
const workbook1 = new ExcelJs.Workbook();
workbook1.xlsx.readFile("./excelDownloadTest.xlsx").then(()=>{
    const worksheet = workbook1.getWorksheet('Sheet1');
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            console.log(cell.value);
        });
    });
});



//other way using async/await function call
// await pauses here until readFile's promise resolves; await requires an async function
async function traverseExcel() {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile("./excelDownloadTest.xlsx")
    const worksheet = workbook.getWorksheet('Sheet1');
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            console.log(cell.value);
        });
    });
}

//call the async function
// declaring the function does nothing until it's actually invoked here
traverseExcel();