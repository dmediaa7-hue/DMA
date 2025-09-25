
import React from 'react';
import { useSite } from '../hooks/useSite';
import Card from '../components/common/Card';

const ServicesPage: React.FC = () => {
    const { content } = useSite();
    const { services } = content;

    const iconMap: { [key: string]: React.ReactElement } = {
        workshop: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>,
        networking: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        career: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
        certification: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21v-2"/><path d="M15.24 17.24 14.19 16.19"/><path d="M17.24 15.24 16.19 14.19"/><path d="M19 12h-2"/><path d="M17.24 8.76 16.19 9.81"/><path d="M15.24 6.76 14.19 7.81"/><path d="M12 5V3"/><path d="M8.76 6.76 9.81 7.81"/><path d="M6.76 8.76 7.81 9.81"/><path d="M5 12H3"/><path d="M6.76 15.24 7.81 14.19"/><path d="M8.76 17.24 9.81 16.19"/><circle cx="12" cy="12" r="4"/></svg>,
        conference: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12v3m0 4v.01"/><path d="M15 12.34a2.99 2.99 0 0 1 0 5.32"/><path d="M9 12.34a2.99 2.99 0 0 0 0 5.32"/><path d="M21 9.34V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1.34"/><path d="M3 9.34V8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1.34"/><path d="M7 22h10"/><path d="M12 2v2.34"/></svg>,
        mentorship: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    };


    return (
        <div className="animate-fade-in">
            <header className="bg-white dark:bg-dark-bg py-16 border-b dark:border-gray-700">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">{services.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{services.subtitle}</p>
                </div>
            </header>

            <main className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.features?.map(feature => (
                           <Card key={feature.title} className="flex flex-col">
                                {feature.imageUrl ? (
                                    <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={feature.imageUrl}
                                            alt={feature.title}
                                            className="w-full h-full object-cover no-copy"
                                        />
                                    </div>
                                ) : null}
                                <div className="p-8 flex-grow flex flex-col">
                                    {!feature.imageUrl && (
                                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                                            {iconMap[feature.icon]}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServicesPage;
