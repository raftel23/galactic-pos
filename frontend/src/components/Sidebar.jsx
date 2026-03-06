import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, LogOut, PackageOpen, Package } from 'lucide-react';

/** @description Collapsible sidebar with role-aware navigation links. */
const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Terminal', path: '/', icon: ShoppingBag, roles: ['Admin', 'Manager', 'Cashier'] },
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
        { name: 'Inventory', path: '/inventory', icon: Package, roles: ['Admin', 'Manager'] },
    ];

    return (
        <div className="w-24 lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between shadow-sm z-10 transition-all duration-300">
            <div>
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-50">
                    <div className="bg-brand-600 p-2 rounded-xl">
                        <PackageOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-3 font-bold text-xl text-gray-800 hidden lg:block tracking-tight">Galactic</span>
                </div>
                <nav className="mt-8 px-4 space-y-2">
                    {navItems.map((item) => {
                        if (!item.roles.includes(user?.role)) return null;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-2 py-3 lg:px-4 lg:py-3 rounded-xl transition-colors ${
                                        isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon className="h-6 w-6 lg:h-5 lg:w-5 mx-auto lg:mx-0" />
                                <span className="ml-3 hidden lg:block">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-50">
                <div className="hidden lg:block mb-4 px-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center lg:justify-start px-2 py-3 lg:px-4 lg:py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="h-6 w-6 lg:h-5 lg:w-5 mx-auto lg:mx-0" />
                    <span className="ml-3 hidden lg:block font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
