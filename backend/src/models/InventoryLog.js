const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        change: { type: Number, required: true },
        type: { type: String, enum: ['restock', 'deduction', 'creation'], required: true },
        notes: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
module.exports = InventoryLog;
