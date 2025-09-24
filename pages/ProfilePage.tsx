import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSite } from '../hooks/useSite';
import { useNotification } from '../hooks/useNotification';
import html2canvas from 'html2canvas';

const ProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { settings } = useSite();
    const { addNotification } = useNotification();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!currentUser) {
        return <div>Loading...</div>;
    }
    
    const handleDownloadCard = async () => {
        if (!cardRef.current || isDownloading) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 3, // Increase scale for better resolution
                backgroundColor: null, // Use transparent background
            });
            const link = document.createElement('a');
            link.download = `DMA-Membership-Card-${currentUser.ID}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Error downloading card:", error);
            addNotification('error', 'Download Failed', 'Could not generate the membership card image.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in">
             <header className="text-center mb-12">
                <h1 className="text-4xl font-bold">Member Profile</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Welcome, {currentUser.Name}!</p>
            </header>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
                    <div className="space-y-3">
                        <p><strong>Name:</strong> {currentUser.Name}</p>
                        <p><strong>Email:</strong> {currentUser.Email}</p>
                        <p><strong>Member Since:</strong> {new Date(currentUser.membershipDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-1 text-sm font-semibold rounded-full ${currentUser.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{currentUser.Status}</span></p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Your Digital Membership Card</h2>
                    <div ref={cardRef} className="bg-gradient-to-br from-primary to-purple-600 text-white p-6 rounded-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-white/10 rounded-full"></div>
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold">{settings.siteName}</h3>
                             <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 filter invert brightness-0" />
                        </div>
                        <div className="mt-8">
                            <p className="text-sm uppercase tracking-wider">Member</p>
                            <p className="text-2xl font-semibold">{currentUser.Name}</p>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <p className="text-xs uppercase">Member ID</p>
                                <p className="font-mono">{currentUser.ID}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-right">Valid Thru</p>
                                <p>{new Date(new Date(currentUser.membershipDate).setFullYear(new Date(currentUser.membershipDate).getFullYear() + 1)).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                     <button 
                        onClick={handleDownloadCard} 
                        className="mt-6 w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                            'Download Card'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;