import React from 'react';
import { useSite } from '../hooks/useSite';

const AboutPage: React.FC = () => {
    const { content } = useSite();
    const { about } = content;

    const iconMap: { [key:string]: React.ReactElement } = {
        mission: <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>,
        vision: <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
        values: <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    };

    return (
        <div className="animate-fade-in">
            <header className="bg-gradient-to-r from-primary to-purple-500 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold">{about.title}</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img src={about.imageUrl} alt="DMA Team" className="rounded-lg shadow-xl no-copy" />
                    </div>
                    <div
                        className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-4"
                        dangerouslySetInnerHTML={{ __html: about.contentHtml }}
                    />
                </div>

                <div className="mt-20">
                     <div className="grid md:grid-cols-3 gap-8">
                        {about.features?.map(feature => (
                            <div key={feature.title} className="bg-white dark:bg-dark-card rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center p-8 flex flex-col items-center">
                                
                                {/* Image or Icon */}
                                <div className="mb-6">
                                    {feature.imageUrl ? (
                                        <img 
                                            src={feature.imageUrl} 
                                            alt={feature.title} 
                                            className="w-24 h-24 rounded-full object-cover no-copy border-4 border-primary/10 shadow-md" 
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 text-primary">
                                            {iconMap[feature.icon]}
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                                
                                {/* Description */}
                                <div
                                    className="text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none [&>p]:my-0"
                                    dangerouslySetInnerHTML={{ __html: feature.description }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutPage;