const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String, required: true }, // BUY or SELL
    rank: { type: Number, required: true },
    price: { type: Number, required: true },
    advertiser: { type: String, required: true },
    available: { type: Number },
    limit_min: { type: Number },
    limit_max: { type: Number }
});

const Price = mongoose.model('Price', priceSchema);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        // const uri = "mongodb+srv://user1:Control123@cluster0.7v65ovg.mongodb.net/binance_tracker?retryWrites=true&w=majority&appName=Cluster0";
        // const uri = "mongodb+srv://icarvar:26oFkYlBOL69RqyZ@binancep2ptracker.xadqkny.mongodb.net/binance_tracker?retryWrites=true&w=majority&appName=binanceP2PTracker";

        await mongoose.connect(uri); // No deprecated options needed in Mongoose 6+
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // We don't exit process here strictly so the cron can keep trying or log the error
    }
};

module.exports = { connectDB, Price };
