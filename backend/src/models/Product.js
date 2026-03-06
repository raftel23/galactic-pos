const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true, unique: true },
        barcode: { type: String, unique: true, sparse: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        price: { type: Number, required: true, default: 0 },
        stock: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
