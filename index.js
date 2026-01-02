const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();
const { connectDB, Price } = require('./database');

// Connect to Database
connectDB();

const ENDPOINT = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

const getPayload = (tradeType) => ({
    page: 1,
    rows: 10,
    asset: "USDT",
    fiat: "BOB",
    tradeType: tradeType, // "BUY" or "SELL"
    payTypes: [],
    publisherType: "merchant"
});

async function fetchPrices(tradeType) {
    try {
        console.log(`Fetching ${tradeType} prices...`);
        const response = await axios.post(ENDPOINT, getPayload(tradeType));

        if (response.data && response.data.code === '000000' && Array.isArray(response.data.data)) {
            const records = response.data.data.map((item, index) => {
                const adv = item.adv;
                const advertiser = item.advertiser;

                return {
                    timestamp: new Date(),
                    type: tradeType,
                    rank: index + 1,
                    price: parseFloat(adv.price),
                    advertiser: advertiser.nickName,
                    available: parseFloat(adv.surplusAmount),
                    limit_min: parseFloat(adv.minSingleTransAmount),
                    limit_max: parseFloat(adv.dynamicMaxSingleTransAmount)
                };
            });

            // Save to MongoDB
            await Price.create(records);
            console.log(`Saved ${records.length} ${tradeType} records to Database.`);
        } else {
            console.error(`Error in response structure for ${tradeType}:`, response.data);
        }
    } catch (error) {
        console.error(`Failed to fetch ${tradeType} prices:`, error.message);
    }
}

async function runTask() {
    console.log(`Running task at ${new Date().toISOString()}`);
    await fetchPrices("BUY");
    await fetchPrices("SELL");
    console.log('Task completed.');
}

console.log('Starting Binance P2P Tracker (MongoDB Version)...');
console.log('Scheduling task to run every 30 minutes.');

// Run immediately on start
runTask();

// Schedule every 30 minutes
// cron.schedule('*/30 * * * *', () => {
//     runTask();
// });

