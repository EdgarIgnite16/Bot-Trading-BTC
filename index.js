const ccxt = require('ccxt');
const moment = require('moment')
const delay = require('delay')
require('dotenv').config();

const binance = new ccxt.binance({
    apiKey: process.env.APIKEY,
    secret: process.env.SECRETKEY,
});
binance.setSandboxMode(true);

async function TimeWorking() {
    const prices = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 5);
    const bPrice = prices.map(price => {
        return {
            timestamp: moment(price[0]).format(),
            open: price[1],
            high: price[2], 
            low: price[3],
            close: price[4],
            volume: price[5],
        }
    })
    const averagePrice = bPrice.reduce((acc, price) => acc + price.close, 0) / 16
    const lastPrice = bPrice[bPrice.length - 1].close
    console.log(bPrice.map(p => p.close), averagePrice, lastPrice);

    // thuật toán đu đỉnh bán đáy  
    const TRADE_SIDE = 100;
    const direction = lastPrice > averagePrice ? 'sell' : 'buy';
    const quantity = TRADE_SIDE / lastPrice;
    // const order = await binance.createMarketOrder('BTC/USDT', direction, quantity);
    console.log(`Average Price: ${averagePrice}\nLast Price: ${lastPrice}`);
    console.log(`${moment().format()}: ${direction} ${quantity} BTC at ${lastPrice}`)
    printBanlacne(lastPrice);
}

async function printBanlacne(btcPrice) {
    const balance = await binance.fetchBalance();
    const total = balance.total;
    console.log(`Balance: BTC ${total.BTC}, USDT: ${total.USDT}`);
    console.log(`Total USDT: ${(total.BTC -1) * btcPrice + total.USDT}.\n`);
}

async function main() {
    while(true) {
        await TimeWorking();
        await delay(60*1000);
    }
}

main();