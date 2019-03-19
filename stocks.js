const apiService = require('./api-service');
const utils = require('./utils');
const colors = require("colors/safe");

module.exports = {

    async getStockReturns(input) {
        try {
            let errors = utils.validateInput(input);
            if(errors.length > 0) {
                return errors.join('\n');
            }

            let stocks = await apiService.fetchStockData(input);
            let result = utils.getStockReturns(stocks);
            utils.displayResult(result);

            if(input.emailIds && input.emailIds.trim()) {
                console.log(colors.rainbow('Sending Email....'));
                await utils.sendEmail(result, input);
            }

        } catch(e) {
            console.error(e.message);
            //throw e;
        }
    }

};