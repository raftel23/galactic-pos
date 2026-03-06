const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

/**
 * @description Seeds the connected database with default data for development.
 * Passwords are plain text; the User model pre-save hook handles hashing.
 */
const seedDatabase = async () => {
    try {
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();

        await User.create({ name: 'System Admin', email: 'admin@galactic.pos', password: 'password123', role: 'Admin', managerCode: '9999' });
        await User.create({ name: 'Store Manager', email: 'manager@galactic.pos', password: 'password123', role: 'Manager', managerCode: '1234' });
        await User.create({ name: 'Jane Cashier', email: 'jane@galactic.pos', password: 'password123', role: 'Cashier' });

        const catClothing = await Category.create({ name: 'Clothing', description: 'Apparel and Wearables' });
        const catElectronics = await Category.create({ name: 'Electronics', description: 'Gadgets and devices' });

        await Product.create([
            { name: 'Galactic T-Shirt', sku: 'TSH-001', barcode: '1000000001', category: catClothing._id, price: 19.99, stock: 50 },
            { name: 'Space Hoodie', sku: 'HOD-001', barcode: '1000000002', category: catClothing._id, price: 49.99, stock: 30 },
            { name: 'Quantum Watch', sku: 'WAT-001', barcode: '1000000003', category: catElectronics._id, price: 199.99, stock: 15 },
            { name: 'Nebula Earbuds', sku: 'EAR-001', barcode: '1000000004', category: catElectronics._id, price: 89.99, stock: 40 },
        ]);

        console.log('Database seeded!');
        console.log('Admin: admin@galactic.pos / password123 (PIN: 9999)');
        console.log('Manager: manager@galactic.pos / password123 (PIN: 1234)');
        console.log('Cashier: jane@galactic.pos / password123');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
