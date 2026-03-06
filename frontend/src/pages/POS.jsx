import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Trash2, Plus, Minus, UserCheck, CheckCircle, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Receipt from '../components/Receipt';

/**
 * @description The main POS terminal. Supports product browsing, cart management,
 * manager price overrides, barcode scanning, and checkout with receipt printing.
 */
const POS = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cashReceived, setCashReceived] = useState('');
    const [checkoutModal, setCheckoutModal] = useState(false);
    const [transactionComplete, setTransactionComplete] = useState(null);
    const [overrideModal, setOverrideModal] = useState(false);
    const [overrideItemIndex, setOverrideItemIndex] = useState(null);
    const [managerCode, setManagerCode] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [overridesLog, setOverridesLog] = useState([]);
    const barcodeBuffer = useRef('');

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get('http://localhost:5001/api/products'),
                axios.get('http://localhost:5001/api/categories'),
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error('Error fetching POS data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Global barcode scanner listener (rapid keystrokes ending in Enter)
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type !== 'text') return;
            if (checkoutModal || overrideModal) return;
            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) handleBarcodeScan(barcodeBuffer.current);
                barcodeBuffer.current = '';
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
            clearTimeout(window.barcodeTimeout);
            window.barcodeTimeout = setTimeout(() => { barcodeBuffer.current = ''; }, 100);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [checkoutModal, overrideModal, products]);

    /** @description Looks up a product by barcode/SKU and adds it to the cart. */
    const handleBarcodeScan = (scannedCode) => {
        const product = products.find(p => p.barcode === scannedCode || p.sku === scannedCode);
        if (product) addToCart(product);
        else console.warn('Product not found for barcode:', scannedCode);
    };

    const addToCart = (product) => {
        setCart((prevCart) => {
            const idx = prevCart.findIndex(item => item.product._id === product._id);
            if (idx >= 0) {
                const newCart = [...prevCart];
                if (newCart[idx].quantity < product.stock) newCart[idx].quantity += 1;
                else alert('Not enough stock available');
                return newCart;
            }
            if (product.stock > 0) return [...prevCart, { product, quantity: 1, currentPrice: product.price }];
            alert('Out of stock');
            return prevCart;
        });
    };

    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        const newQty = newCart[index].quantity + delta;
        if (newQty <= 0) newCart.splice(index, 1);
        else if (newQty <= newCart[index].product.stock) newCart[index].quantity = newQty;
        else alert('Cannot exceed available stock');
        setCart(newCart);
    };

    const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

    const openOverrideModal = (index) => {
        setOverrideItemIndex(index);
        setNewPrice(cart[index].currentPrice);
        setManagerCode('');
        setOverrideModal(true);
    };

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        if (!managerCode || !newPrice) return;
        const newCart = [...cart];
        const item = newCart[overrideItemIndex];
        setOverridesLog(prev => [...prev, { productId: item.product._id, originalPrice: item.product.price, newPrice: Number(newPrice), managerCode }]);
        item.currentPrice = Number(newPrice);
        setCart(newCart);
        setOverrideModal(false);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        const cash = parseFloat(cashReceived);
        if (isNaN(cash) || cash < total) { alert('Insufficient cash received'); return; }
        const saleData = {
            items: cart.map(item => ({ productId: item.product._id, name: item.product.name, quantity: item.quantity, price: item.currentPrice })),
            total, payment: cash, change: cash - total, overrides: overridesLog,
        };
        try {
            const { data } = await axios.post('http://localhost:5001/api/sales', saleData);
            setTransactionComplete({ ...data, cashierName: user.name, receiptItems: cart });
            setCart([]);
            setOverridesLog([]);
            setCashReceived('');
            setCheckoutModal(false);
            setTimeout(() => window.print(), 500);
            fetchData();
        } catch (error) {
            alert('Checkout failed: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category?._id === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="h-full flex items-center justify-center">Loading POS...</div>;

    return (
        <div className="flex h-screen bg-gray-100 font-sans print:bg-white print:h-auto overflow-hidden">
            <div className="flex w-full h-full print:hidden">
                {/* LEFT PANEL: Products */}
                <div className="w-2/3 flex flex-col h-full border-r border-gray-200 bg-gray-50">
                    <div className="p-4 bg-white shadow-sm z-10">
                        <div className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-2 border border-gray-200">
                            <Search className="w-6 h-6 text-gray-400" />
                            <input type="text" placeholder="Search products or scan barcode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-lg py-2" />
                        </div>
                        <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                            <button onClick={() => setActiveCategory('All')} className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === 'All' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>All Items</button>
                            {categories.map(cat => (
                                <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
                                    className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === cat._id ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <button key={product._id} onClick={() => addToCart(product)} disabled={product.stock === 0}
                                    className={`bg-white rounded-2xl p-4 text-left flex flex-col justify-between h-40 transition-all border shadow-sm hover:shadow-md active:scale-95 ${
                                        product.stock === 0 ? 'opacity-50 border-red-200 cursor-not-allowed' : 'border-gray-100 hover:border-brand-300'}`}>
                                    <div>
                                        <div className="font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</div>
                                        <div className="text-sm text-gray-400 mt-1">{product.sku}</div>
                                    </div>
                                    <div className="flex justify-between items-end mt-auto pt-2">
                                        <span className="font-bold text-brand-600 text-lg">${product.price.toFixed(2)}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${product.stock > 5 ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>{product.stock} left</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Cart */}
                <div className="w-1/3 flex flex-col h-full bg-white">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold flex items-center text-gray-800"><ShoppingCart className="w-6 h-6 mr-2 text-brand-600" />Current Order</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" /><p>No items added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item, index) => (
                                    <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-2/3 leading-tight pr-2">
                                                <span className="font-bold text-gray-800">{item.product.name}</span>
                                                {item.currentPrice !== item.product.price && <span className="ml-2 text-xs font-bold text-orange-500 bg-orange-100 px-1 rounded uppercase">Overridden</span>}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">${(item.currentPrice * item.quantity).toFixed(2)}</div>
                                                {item.currentPrice !== item.product.price && <div className="text-xs text-gray-400 line-through">${(item.product.price * item.quantity).toFixed(2)}</div>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(index, -1)} className="p-1 bg-white rounded shadow-sm"><Minus className="w-4 h-4" /></button>
                                                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="p-1 bg-white rounded shadow-sm"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => openOverrideModal(index)} className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100">${item.currentPrice.toFixed(2)}</button>
                                                <button onClick={() => removeItem(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="space-y-2 mb-4 text-sm font-medium text-gray-600">
                            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-400"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span><span className="text-brand-600">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={() => { setCashReceived(total.toFixed(2)); setCheckoutModal(true); }} disabled={cart.length === 0}
                            className={`w-full py-4 rounded-xl text-xl font-bold text-white transition-all active:scale-95 shadow-lg ${
                                cart.length === 0 ? 'bg-gray-300 shadow-none' : 'bg-brand-600 hover:bg-brand-500'}`}>
                            Pay ${total.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Override Modal */}
            {overrideModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex items-center text-orange-500 mb-4">
                            <UserCheck className="w-6 h-6 mr-2" /><h3 className="text-xl font-black">Manager Override</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Authorizing price change for <strong>{cart[overrideItemIndex]?.product.name}</strong></p>
                        <form onSubmit={handleOverrideSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">New Price ($)</label>
                                <input type="number" step="0.01" required autoFocus value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full text-2xl font-bold bg-gray-100 border-none rounded-xl p-3 focus:ring-2 focus:ring-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Manager Authorization Code</label>
                                <input type="password" required value={managerCode} onChange={e => setManagerCode(e.target.value)} className="w-full text-xl tracking-[0.5em] text-center bg-gray-100 border-none rounded-xl p-3 focus:ring-2 focus:ring-brand-500" placeholder="••••" />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setOverrideModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30">Authorize</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-black text-center mb-6">Complete Payment</h3>
                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-center">
                            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Due</span>
                            <div className="text-4xl font-black text-brand-600">${total.toFixed(2)}</div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cash Received</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                                    <input type="number" step="0.01" value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                                        className="w-full text-3xl font-black bg-white border-2 border-gray-200 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-brand-500" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-gray-500 font-medium">Change Required:</span>
                                <span className={`text-xl font-bold ${(parseFloat(cashReceived) - total) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${isNaN(parseFloat(cashReceived)) ? '0.00' : Math.max(0, parseFloat(cashReceived) - total).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex space-x-3 mt-8 pt-4">
                                <button onClick={() => setCheckoutModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-lg">Cancel</button>
                                <button onClick={handleCheckout} disabled={parseFloat(cashReceived) < total || isNaN(parseFloat(cashReceived))}
                                    className="flex-1 py-4 bg-brand-600 text-white font-black rounded-xl shadow-xl hover:bg-brand-500 disabled:opacity-50 text-lg">Confirm Sale</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale Complete Modal */}
            {transactionComplete && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex md:items-center justify-center z-[60] overflow-y-auto print:hidden">
                    <div className="bg-transparent md:bg-gray-100 flex flex-col items-center w-full max-w-md my-auto rounded-3xl overflow-hidden shadow-2xl">
                        <div className="bg-brand-600 w-full p-6 flex flex-col items-center text-white">
                            <CheckCircle className="w-16 h-16 mb-2" />
                            <h2 className="text-2xl font-black">Sale Completed!</h2>
                            <p className="font-medium opacity-90">Change due: ${transactionComplete.change.toFixed(2)}</p>
                        </div>
                        <div className="w-full bg-white">
                            <div className="p-4 flex">
                                <button onClick={() => window.print()} className="flex-1 flex justify-center items-center bg-gray-100 p-3 rounded-xl mr-2 font-bold text-gray-700">
                                    <Printer className="w-5 h-5 mr-2" />Print Receipt
                                </button>
                                <button onClick={() => setTransactionComplete(null)} className="flex-1 bg-brand-600 text-white p-3 rounded-xl ml-2 font-bold">New Sale</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden print-only receipt */}
            <div className="hidden print:block text-black bg-white w-[80mm]">
                {transactionComplete && <Receipt transaction={transactionComplete} />}
            </div>
        </div>
    );
};

export default POS;
