import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../hooks/useSite';

const MembershipPage: React.FC = () => {
    const { content, settings } = useSite();
    const { membership } = content;

    const iconMap: { [key: string]: React.ReactElement } = {
        content: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
        directory: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="M9 4v16"></path><path d="M14 9h4"></path><path d="M14 12h4"></path><path d="M14 15h4"></path><path d="M5 9h4"></path><path d="M5 12h4"></path><path d="M5 15h4"></path></svg>,
        discount: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0l-2.8-2.8L3 21H21l-9.4-9.4Z"></path><path d="m14.8 14.8 5.7-5.7c.6-.6.6-1.5 0-2.1L18 4.5c-.6-.6-1.5-.6-2.1 0l-5.7 5.7"></path><path d="m9.4 9.4-1.8 1.8"></path><path d="m2.7 15.3 1.8-1.8"></path><path d="m2.7 2.7 18.6 18.6"></path><circle cx="12" cy="12" r="1.5"></circle></svg>,
        voting: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2"></path><path d="m9 12 2 2 4-4"></path><path d="M12 17c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3Z"></path></svg>,
        card: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>,
        leadership: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.5a3.5 3.5 0 0 0-7 0V22h7v-7.5Z"/><path d="M17 14.5a3.5 3.5 0 0 1 7 0V22h-7v-7.5Z"/><path d="M12 2v10m-3-7 3 3 3-3"/></svg>
    };

    return (
        <div className="animate-fade-in bg-gray-50 dark:bg-gray-800">
            <header className="text-center py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">{membership.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{membership.subtitle}</p>
                </div>
            </header>

            <main className="container mx-auto px-4 pb-20">
                <h2 className="text-3xl font-bold text-center mb-12">Membership Benefits</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {membership.features?.map(feature => (
                        <div key={feature.title} className="flex items-start space-x-4 p-6 bg-white dark:bg-dark-card rounded-lg shadow-sm">
                            <div className="flex-shrink-0 text-primary">
                                {iconMap[feature.icon]}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-purple-500 rounded-lg shadow-2xl p-12 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                        <p className="text-xl mb-6">Annual membership is just <span className="font-bold">₹{settings.membershipFee.toLocaleString('en-IN')}</span>.</p>
                        <Link to="/login" className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                            Sign Up or Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MembershipPage;