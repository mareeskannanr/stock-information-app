const prompt = require('prompt');
const colors = require("colors/safe");

const stocks = require('./stocks');

let inputs = [{
    "name": "api_key",
    "description": colors.green("Enter API Key"),
    "required": true
},{
    "name": "stock_symbol",
    "description": colors.green("Enter Stock Symbol"),
    "required": true
},{
    "name": "start_date",
    "description": colors.green("Enter Start Date ") + colors.yellow("(DD/MM/YYYY)"),
    "required": true,
    "pattern": /^\d{2}\/\d{2}\/\d{4}$/,
    "message": 'Start Date should in the mentioned format'
},{
    "name": "end_date",
    "description": colors.green("Enter End Date ") + colors.yellow("(DD/MM/YYYY)"),
    "pattern": /^\d{2}\/\d{2}\/\d{4}$/,
    "message": 'End Date should in the mentioned format'
},{
    "name": "emailIds",
    "description": colors.green("Enter Email Id to sent search result (Optional) : "),
    "pattern": /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/,
    "message": 'Email Ids are invalid'
}];

prompt.get(inputs, (err, result) => {
    if(err) {
        return console.log(err);
    }

    console.log(colors.rainbow('Please Wait, Your Resquest is processing....'));
    stocks.getStockReturns(result);
});