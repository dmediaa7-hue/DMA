
import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../hooks/useSite';
import Card from '../components/common/Card';

const HomePage: React.FC = () => {
    const { content } = useSite();
    const { home, about, services, membership } = content;

    const getFirstParagraphText = (html: string): string => {
        if (!html) return 'Click to learn more about us.';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const firstP = doc.querySelector('p');
        return firstP?.textContent || html.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
    };

    const iconMap: { [key: string]: React.ReactElement } = {
        mission: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>,
        vision: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
        values: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section
                className="relative bg-cover bg-center text-white py-32 md:py-48"
                style={{ backgroundImage: `linear-gradient(rgba(109, 40, 217, 0.7), rgba(139, 92, 246, 0.7)), url(${home.imageUrl})` }}
            >
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-slide-in-up">{home.title}</h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>{home.subtitle}</p>
                    <Link to="/membership" className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                        Join Now
                    </Link>
                </div>
            </section>

            {/* About Section Preview */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Who We Are</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">{getFirstParagraphText(about.contentHtml)}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {about.features?.map((feature, index) => (
                            <Card key={index}>
                                <div className="p-8 text-center">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                                        {iconMap[feature.icon]}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <div
                                        className="text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none [&>p]:my-0"
                                        dangerouslySetInnerHTML={{ __html: feature.description }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

             {/* Services Section Preview */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">{services.title}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{services.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.features?.slice(0, 3).map((service, index) => (
                            <Card key={index} className="flex items-start p-6 space-x-4">
                               <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                               </div>
                               <div>
                                   <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                                   <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                               </div>
                           </Card>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/services" className="text-primary font-semibold hover:underline">
                            Explore All Services &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* Membership CTA */}
            <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{membership.title}</h2>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">{membership.subtitle}</p>
                    <Link to="/membership" className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                        Become a Member
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
