import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';

/** @description Inventory management page for admins and managers. */
const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', sku: '', barcode: '', category: '', price: '', stock: '' });

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:5001/api/products'),
                axios.get('http://localhost:5001/api/categories'),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            if (categoriesRes.data.length > 0 && !formData.category)
                setFormData(prev => ({ ...prev, category: categoriesRes.data[0]._id }));
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({ name: product.name, sku: product.sku, barcode: product.barcode || '', category: product.category._id || product.category, price: product.price, stock: product.stock });
        } else {
            setCurrentProduct(null);
            setFormData({ name: '', sku: '', barcode: '', category: categories.length > 0 ? categories[0]._id : '', price: '', stock: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) await axios.put(`http://localhost:5001/api/products/${currentProduct._id}`, formData);
            else await axios.post('http://localhost:5001/api/products', formData);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Error saving product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await axios.delete(`http://localhost:5001/api/products/${id}`);
                fetchData();
            } catch { alert('Error deleting product'); }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col h-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center"><Package className="mr-3 text-brand-600" />Inventory Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage products, stock, and pricing.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center w-auto py-2 px-6"><Plus className="w-5 h-5 mr-2" />Add Product</button>
            </div>
            <div className="card flex-1 flex flex-col mb-4 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 py-2 w-full bg-white" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                {['Product', 'SKU / Barcode', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                    <th key={h} className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-brand-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                                    <td className="py-4 px-6 text-gray-500 text-sm"><div>{product.sku}</div><div className="text-xs text-gray-400">{product.barcode || '—'}</div></td>
                                    <td className="py-4 px-6 text-gray-500 text-sm">{product.category?.name || 'Uncategorized'}</td>
                                    <td className="py-4 px-6 text-right font-medium">${product.price.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-right"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{product.stock}</span></td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-center space-x-3">
                                            <button onClick={() => handleOpenModal(product)} className="text-blue-500 bg-blue-50 p-2 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(product._id)} className="text-red-500 bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Awesome T-Shirt" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="input-field" placeholder="TSH-001" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Barcode (Optional)</label><input type="text" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="input-field" placeholder="123456789" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-field">{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label><input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="input-field" placeholder="19.99" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="input-field" placeholder="100" /></div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" form="productForm" className="btn-primary w-auto px-6 py-2">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
