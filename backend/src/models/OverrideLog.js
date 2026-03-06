const mongoose = require('mongoose');

const overrideLogSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        managerCode: { type: String, required: true },
        originalPrice: { type: Number, required: true },
        newPrice: { type: Number, required: true },
    },
    { timestamps: true }
);

const OverrideLog = mongoose.model('OverrideLog', overrideLogSchema);
module.exports = OverrideLog;
