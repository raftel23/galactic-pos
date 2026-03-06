import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Package, Calendar, AlertTriangle } from 'lucide-react';

/** @description Admin dashboard showing aggregated sales and inventory metrics. */
const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/reports/dashboard');
                setMetrics(data);
            } catch (err) {
                setError('Failed to load dashboard data. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard metrics...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    const statCards = [
        { name: "Today's Sales", value: `$${metrics?.salesToday?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
        { name: "This Week's Sales", value: `$${metrics?.salesThisWeek?.toFixed(2) || '0.00'}`, icon: Calendar, color: 'bg-blue-100 text-blue-600' },
        { name: 'Total Products', value: metrics?.totalProducts || 0, icon: Package, color: 'bg-purple-100 text-purple-600' },
        { name: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'bg-orange-100 text-orange-600' },
    ];

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-full ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 inline-flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-brand-600" />Top Selling Products</h2>
                    {metrics?.topProducts?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No sales data yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {metrics?.topProducts?.map((product, idx) => (
                                <div key={product._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                                        <span className="font-medium text-gray-800">{product.name}</span>
                                    </div>
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium">{product.totalSold} sold</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="card p-6 border-t-4 border-amber-400">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 inline-flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />Inventory Alerts</h2>
                    {metrics?.inventoryAlerts?.length === 0 ? (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center"><Package className="w-5 h-5 mr-3" /><p className="text-sm font-medium">All products are adequately stocked.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {metrics?.inventoryAlerts?.map((product) => (
                                <div key={product._id} className="flex justify-between items-center p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                    <span className="font-medium">{product.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs uppercase tracking-wider font-bold">Stock:</span>
                                        <span className="text-lg font-black">{product.stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
