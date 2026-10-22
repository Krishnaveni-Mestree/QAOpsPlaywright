const  base  = require('@playwright/test');

//THIRD WAY of driving test data (after plain JSON require, then JSON-array parameterization): bake the
//data directly into a CUSTOM FIXTURE via test.extend(), same mechanism used for authenticatedPage/
//createOrder back in sec-13 - just here the fixture VALUE is a plain data object, not a function.
//LIMITATION: unlike the JSON-array approach, this only ever supplies ONE fixed dataset - there's no
//loop here, so this technique can't parameterize/repeat the test with multiple datasets.
exports.customtest=base.test.extend({
    testDataForOrder:{
        username: 'mkrishnaveni1102@gmail.com',
        password: 'Qazmlp@1505',
        productName: 'ZARA COAT 3'
    }
});