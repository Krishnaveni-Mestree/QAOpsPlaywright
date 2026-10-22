const ExcelJs = require('exceljs');


async function readExcel(worksheet, searchText){
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





async function writeExcelTest(searchText, replaceText, filePath) {
    
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet('Sheet1'); // name is case-sensitive, actual sheet is "Sheet1"
    const output = await readExcel(worksheet, searchText);

    const cell=worksheet.getCell(output.row, output.column)
    cell.value=replaceText
    //rewriting
    await workbook.xlsx.writeFile(filePath);
}


//call the async function
writeExcelTest("Banana", "Republic","./excelDownloadFresh.xlsx");








//update mango price to 350
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
    
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet('Sheet1'); // name is case-sensitive, actual sheet is "Sheet1"
    const output = await readExcelChange(worksheet, searchText);

    const cell=worksheet.getCell(output.row+change.rowChange, output.column+change.columnChange)
    cell.value=replaceText
    //rewriting
    await workbook.xlsx.writeFile(filePath);
}
writeExcelTestChange("Mango", 350,{rowChange:0,columnChange:2},"./excelDownloadFresh.xlsx");