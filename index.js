const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const { connectDB, Price } = require("./database");

const ENDPOINT = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

const getPayload = (tradeType) => ({
    page: 1,
    rows: 10,
    asset: "USDT",
    fiat: "BOB",
    tradeType,
    payTypes: [],
    publisherType: "merchant",
});

async function fetchPrices(tradeType) {
    console.log(`Fetching ${tradeType} prices...`);
    const response = await axios.post(ENDPOINT, getPayload(tradeType));

    if (response.data?.code === "000000" && Array.isArray(response.data.data)) {
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
                limit_max: parseFloat(adv.dynamicMaxSingleTransAmount),
            };
        });

        await Price.create(records);
        console.log(`Saved ${records.length} ${tradeType} records to Database.`);
    } else {
        console.error(`Unexpected response for ${tradeType}:`, response.data);
    }
}

async function runOnce() {
    console.log(`Running task at ${new Date().toISOString()}`);
    await fetchPrices("BUY");
    await fetchPrices("SELL");
    console.log("Task completed.");
}

(async () => {
    try {
        // IMPORTANT: wait for DB connection
        await connectDB();

        // Run once
        await runOnce();
    } catch (err) {
        console.error("Fatal error:", err);
        process.exitCode = 1;
    } finally {
        // IMPORTANT: close DB connection so Node can exit
        await mongoose.connection.close().catch(() => { });
    }
})();
