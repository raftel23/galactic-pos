const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
    {
        cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }],
        total: { type: Number, required: true },
        payment: { type: Number, required: true },
        change: { type: Number, required: true },
    },
    { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
