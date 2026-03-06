const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

/**
 * @description Auto-seeds in-memory database with default users, categories, and products.
 * Plain text passwords are used; hashing is handled by the User model pre-save hook.
 */
const runSeed = async () => {
    try {
        console.log('Seeding in-memory database...');
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

        console.log('Seeded! Admin: admin@galactic.pos / password123 (PIN: 9999)');
    } catch (error) {
        console.error('Seed error:', error);
        throw error;
    }
};

module.exports = runSeed;
