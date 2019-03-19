const mocha = require('mocha');
const assert = require('assert');
const utils = require('./utils');

describe('Validating Form Inputs', () => {
    it('should throws array of error for required', done => {
        let errors = utils.validateInput({});
        assert(errors.length > 0);
        assert(Array.isArray(errors));
        done();
    });
    
    it('should throws error for invalid email Ids', done => {
        let errors = utils.validateInput({
            'start_date': new Date().setDate(new Date().getDate() + 10).toString(),
            'end_date': new Date().toString(),
            'api_key': '111245',
            'stock_symbol': 'FB',
            'emailIds': 'aaa,bbb.in,ddm,aa.ihe'
        });

        assert(errors.length === 1);
        assert(Array.isArray(errors));
        done();
    });
});

describe('Checking Return Calculation Logic', () => {
    it('Return Object of Stock Returns', done => {
        let dataArray = [{"date":"02.01.2018","open":170.16,"high":172.3,"low":169.26,"close":172.26},{"date":"03.01.2018","open":172.53,"high":174.55,"low":171.96,"close":172.23}, {"date":"04.01.2018","open":172.54,"high":173.47,"low":172.08,"close":173.03},{"date":"05.01.2018","open":173.44,"high":175.37,"low":173.05,"close":175}];
        let result = utils.getStockReturns(dataArray);
        assert(result.stockInfos.length == 4);
        assert(result.maxDrawDown.includes('-1.8%'));
        done();
    });
});

//Result can be found in console
describe('Checking Result Display In Console', () => {
    it('Return Result to Display End User', done => {
        let data = { stockInfos: ['02.01.2018: Closed at 172.26 (169.26 ~ 172.3)'], topdrawDowns: ['-1.3% (175.37 on 05.01.2018 -> 173.05 on 05.01.2018)'], maxDrawDown: '-1.8% (172.3 on 02.01.2018 -> 169.26 on 02.01.2018)', returns: { initValue: 172.26, finalValue: 175, result: 2.740000000000009, returns: '1.6', startDate: '02.01.2018', endDate: '05.01.2018' } };
        utils.displayResult(data);
        done();
    });
});

describe('Generate Email Template', () => {
    it('Return Email Template for Input and Result', done => {
        let data = { stockInfos: ['02.01.2018: Closed at 172.26 (169.26 ~ 172.3)'], topdrawDowns: ['-1.3% (175.37 on 05.01.2018 -> 173.05 on 05.01.2018)'], maxDrawDown: '-1.8% (172.3 on 02.01.2018 -> 169.26 on 02.01.2018)', returns: { initValue: 172.26, finalValue: 175, result: 2.740000000000009, returns: '1.6', startDate: '02.01.2018', endDate: '05.01.2018' } };
        let input = { api_key: 'djaLk9zyCyK9x9bExVNR', stock_symbol: 'AAPL', start_date: '01/01/2018', end_date: '05/01/2018', emailIds: 'test@gmail.com' }
        let result = utils.generateEmailTemplate(data, input);
        assert(result.includes('02.01.2018: Closed at 172.26 (169.26 ~ 172.3)'));
        assert(result.includes('Stock Symbol'));
        done();
    });
});