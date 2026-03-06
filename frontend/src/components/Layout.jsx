import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/** @description Application shell: sidebar + main content outlet. */
const Layout = () => (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full relative">
            <Outlet />
        </main>
    </div>
);

export default Layout;
