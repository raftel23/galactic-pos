const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        oldPrice: { type: Number, required: true },
        newPrice: { type: Number, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);
module.exports = PriceHistory;
