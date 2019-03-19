const mailer = require("nodemailer");

module.exports = {

    validateInput(input) {
        let errors = [];

        if(!input.stock_symbol || !input.stock_symbol.trim()) {
            errors.push('Stock Symbol is required.');
        }

        if(!input.api_key || !input.api_key.trim()) {
            errors.push('API Key is required.');
        }

        if(!input.start_date || !input.start_date.toString().trim()) {
            errors.push('Start Date is required.');
        }

        if(input.end_date && !input.end_date.toString().trim()) {
            errors.push(`End Date can't be empty.`);
        }

        if(input.emailIds && !input.emailIds.trim()) {
            errors.push(`Email Ids can't be empty.`);
        }

        if(input.emailIds && input.emailIds.trim() && !/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/.test(input.emailIds)) {
            errors.push(`Email Ids is invalid.`);
        }

        return errors;
    },
    
    getStockReturns(stocks) {
        let stockInfos = [], drawDownMap = new Map();

        for(let stock of stocks) {
            stockInfos.push(`${stock.date}: Closed at ${stock.close} (${stock.low} ~ ${stock.high})`);

            let drawDown = (stock.high - stock.low) / stock.high;
            drawDown = (drawDown * 100).toFixed(1);

            if(drawDownMap.size == 3) {
                let tempArray = [...drawDownMap.keys(), drawDown];
                let minValue = tempArray.sort((a, b) => b - a).pop();
                if(minValue != drawDown) {
                    drawDownMap.delete(minValue);
                    drawDownMap.set(drawDown, `-${drawDown}% (${stock.high} on ${stock.date} -> ${stock.low} on ${stock.date})`);
                }
            } else {
                drawDownMap.set(drawDown, `-${drawDown}% (${stock.high} on ${stock.date} -> ${stock.low} on ${stock.date})`);
            }
        }

        let max = Math.max(...drawDownMap.keys());
        max = max.toString();

        let initValue = stocks[0].close;
        let finalValue = stocks[stocks.length - 1].close;
        let result = (finalValue - initValue);
        let returns = result / finalValue;
        returns = (returns * 100).toFixed(1);

        drawDownMap = new Map([...drawDownMap.entries()].sort((a, b) => b - a));

        return {
            stockInfos,
            topdrawDowns: [...drawDownMap.values()],
            maxDrawDown: drawDownMap.get(max),
            returns: {
                initValue, 
                finalValue, 
                result, 
                returns, 
                startDate: stocks[0].date, 
                endDate: stocks[stocks.length - 1].date
            }
        };
    },

    displayResult(data) {
        console.log(data.stockInfos.join('\n'), '\n\n');
        console.log('First 3 DropDowns:\n', (data.topdrawDowns).join('\n'), '\n\n');
        console.log(`Maximum drawdown: ${data.maxDrawDown}`, '\n\n');

        let { returns } = data;
        console.log(`Return: ${returns.result} [+${returns.returns}%] (${returns.initValue} on ${returns.startDate} -> ${returns.finalValue} on ${returns.endDate})`);
    },

    async sendEmail(content, input) {

        let account = await mailer.createTestAccount();
        let transporter = mailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: account.user,
              pass: account.pass
            }
        }); 

        let info = await transporter.sendMail({
            from: 'no-reply@liqid.com',
            to: input.emailIds,
            subject: 'Stock Information Search Response',
            html: this.generateEmailTemplate(content, input),
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", mailer.getTestMessageUrl(info));
    },

    generateEmailTemplate(content, input) {
        let returns = content.returns;
        let template = `
            <div>
                <div style='margin-top:10px;'>
                    <p>
                        Stock Symbol: <b>${input.stock_symbol}</b>&nbsp;&nbsp;&nbsp;
                        Start Date: <b>${input.start_date}</b>&nbsp;&nbsp;&nbsp;
                        End Date: <b>${input.end_date}</b>&nbsp;&nbsp;&nbsp;
                    </p>
                </div>
                <div style='margin-top:10px;'>
                    <p>${content.stockInfos.join('<br />')}</p>
                </div>
                <div style='margin-top:20px;'>
                    <h4>First 3 Drawdowns:</h4>
                    <p>${content.topdrawDowns.join('<br />')}</p>
                </div>
                <div style='margin-top:20px;'>
                    First 3 Drawdowns: <b>${content.maxDrawDown}</b>
                </div>
                <div style='margin-top:10px;'>
                    Return: <b style='font-size:15px'>${returns.result} [+${returns.returns}%] (${returns.initValue} on ${returns.startDate} -> ${returns.finalValue} on ${returns.endDate})</b>
                </div>
            </div>
        `;

        return template;
    }

};