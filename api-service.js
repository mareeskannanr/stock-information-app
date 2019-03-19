const request = require('request');
const util = require('util');
const requestPromise = util.promisify(request);

module.exports = {

    async fetchStockData(input) {
        
        try {
            let requestURL = `https://www.quandl.com/api/v3/datasets/WIKI/${input.stock_symbol}/data.json?api_key=${input.api_key}&order=asc&start_date=${input.start_date}&end_date=${input.end_date}`;
            let response = await requestPromise({
                'url': requestURL,
                'method': "GET"
              });

            return this.processResponse(JSON.parse(response.body));
        } catch(e) {
            console.log(e);
            throw new Error(e.message);
        }
    },

    processResponse(response) {
        let dataSet = response.dataset_data.data;
        let stocks = [];    
        for(let item of dataSet) {
            let stock = {
                "date": this.formatDate(item[0]),
                "open": item[1],
                "high": item[2],
                "low": item[3],
                "close": item[4]
            };

            stocks.push(stock);
        }

        return stocks;
    },

    formatDate(date) {
        date = new Date(date);
        let result = '';
        result += ((date.getDate() < 10 ? '0': '') + date.getDate() + '.');
        result += ((date.getMonth() + 1 < 10 ? '0': '') + (date.getMonth() + 1) + '.');
        result += date.getFullYear();

        return result;
    }

};