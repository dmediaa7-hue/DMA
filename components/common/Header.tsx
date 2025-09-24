
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSite } from '../../hooks/useSite';
import { useTheme } from '../../hooks/useTheme';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);


const Header: React.FC = () => {
    const { currentUser, logout, isAdmin } = useAuth();
    const { settings } = useSite();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/services', name: 'Services' },
        { path: '/membership', name: 'Membership' },
        { path: '/election', name: 'Election' },
        { path: '/gallery', name: 'Gallery' },
        { path: '/contact', name: 'Contact' },
    ];

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={settings.logoUrl} alt="DMA Logo" className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold text-gray-800 dark:text-white">{settings.siteName}</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300 font-medium ${isActive ? 'text-primary dark:text-primary' : ''}`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        {currentUser && !isAdmin ? (
                            <>
                                <Link to="/profile" className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary">Profile</Link>
                                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : !currentUser ? (
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                                Member Login
                            </Link>
                        ) : null}
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
             {/* Mobile Menu */}
             <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-800 absolute w-full shadow-lg animate-fade-in`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
                        <div className="px-2 space-y-2">
                             <button
                                onClick={toggleTheme}
                                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                               <span>Toggle Theme</span>
                               {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                             {currentUser && !isAdmin ? (
                                 <>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                                        Logout
                                    </button>
                                </>
                            ) : !currentUser ? (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                                    Member Login
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
