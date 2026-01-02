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
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is missing");

    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
    console.log("Connected DB:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
};

module.exports = { connectDB, Price };
