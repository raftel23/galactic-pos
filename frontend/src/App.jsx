import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages lazily loaded for better initial bundle performance
const Login = lazy(() => import('./pages/Login'));
const POS = lazy(() => import('./pages/POS'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InventoryManager = lazy(() => import('./pages/InventoryManager'));

/** @description Route guard that redirects unauthenticated or unauthorized users. */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    const { user, loading } = useAuth();
    if (loading) return null;

    return (
        <Router>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading app...</div>}>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<POS />} />
                        <Route path="admin" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="inventory" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><InventoryManager /></ProtectedRoute>} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
