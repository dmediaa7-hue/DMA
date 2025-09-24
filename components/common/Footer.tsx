
import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../hooks/useSite';

const Footer: React.FC = () => {
    const { settings } = useSite();

    return (
        <footer className="bg-gray-800 dark:bg-gray-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{settings.siteName}</h3>
                        <p className="text-gray-400">Shaping the future of digital media together.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <p className="text-gray-400">{settings.contact.address}</p>
                        <p className="text-gray-400">{settings.contact.phone}</p>
                        <p className="text-gray-400">{settings.contact.email}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            {settings.socialLinks?.facebook && settings.socialLinks.facebook !== '#' && (
                                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                            )}
                            {settings.socialLinks?.twitter && settings.socialLinks.twitter !== '#' && (
                                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.2-3.1 2.1-4.9 2.6-2.2 2.8-5.3 4.5-8.8 4.8-3.5.3-6.9-.9-9.3-3.3s-3.2-6.1-2.7-9.5c.5-3.4 2.5-6.3 5.2-8.2C9.5 1.5 13.5.8 17 2c-1.3 1.2-2.2 2.8-2.5 4.5-.3 1.7.3 3.5 1.5 4.8-1.2 1.1-2.8 1.8-4.5 2.1-1.7.3-3.5-.3-4.8-1.5s-1.8-2.8-2.1-4.5c-.3-1.7.3-3.5 1.5-4.8C9.5 2 12.5 2 15 3.5c1.4.9 2.6 2.1 3.4 3.5.8 1.4 1.2 3 1.2 4.6 0 2.2-1.2 4.2-3 5.5-2.2.8-4.8.5-7-1s-3.5-4-3.5-6.5c0-2.8 1.5-5.3 4-6.5 2.5-1.2 5.3-1.2 7.8 0 2.5 1.2 4.5 3.5 5.2 6.2"></path></svg></a>
                            )}
                            {settings.socialLinks?.linkedin && settings.socialLinks.linkedin !== '#' && (
                                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.</p>
                    <p className="mt-2 text-sm">Developed by ARC</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
