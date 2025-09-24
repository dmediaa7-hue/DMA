
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminBar: React.FC = () => {
    const { isAdmin, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="bg-gray-700 dark:bg-gray-900 text-white shadow-md sticky top-20 z-40 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-secondary">Admin Mode</span>
                    <span className="hidden sm:block text-gray-500">|</span>
                    <p className="hidden sm:block text-sm text-gray-300">
                        Welcome, <span className="font-medium text-white">{currentUser?.Name}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard" className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-green-600 transition-colors">
                        Dashboard
                    </Link>
                    <button onClick={handleLogout} className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary hover:bg-primary-dark transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBar;
