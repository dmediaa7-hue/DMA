import React, { useState, useEffect, useCallback } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { PageContent } from '../../types';
import RichTextEditor from './RichTextEditor';

const ContentEditor: React.FC<{ pageKey: keyof PageContent, addAdminLog: (action: string) => Promise<void> }> = ({ pageKey, addAdminLog }) => {
    const { content, setContent } = useSite();
    const { addNotification } = useNotification();
    const [pageData, setPageData] = useState(content[pageKey]);

    useEffect(() => {
        setPageData(content[pageKey]);
    }, [content, pageKey]);
    
    const debouncedSave = useCallback(async (newData: typeof pageData) => {
        if (JSON.stringify(newData) !== JSON.stringify(content[pageKey])) {
            try {
                await setContent({ ...content, [pageKey]: newData });
                addNotification('success', 'Content Autosaved', `Changes to the ${pageKey} page were saved.`);
                await addAdminLog(`Updated content for ${pageKey} page.`);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                     addNotification('error', 'Autosave Failed', "Storage quota exceeded. Please try a smaller file.");
                } else {
                     addNotification('error', 'Autosave Failed', (error as Error).message);
                }
            }
        }
    }, [content, pageKey, setContent, addAdminLog, addNotification]);

    useEffect(() => {
        const handler = setTimeout(() => {
            debouncedSave(pageData);
        }, 1500);

        return () => clearTimeout(handler);
    }, [pageData, debouncedSave]);


    const handleChange = (field: string, value: any) => {
        setPageData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureChange = (index: number, newDescription: string) => {
        setPageData(prev => {
            if (!prev.features) return prev;
            const newFeatures = [...prev.features];
            newFeatures[index] = { ...newFeatures[index], description: newDescription };
            return { ...prev, features: newFeatures };
        });
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                addNotification('error', 'Image Too Large', 'Please upload an image smaller than 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality JPEG

                    setPageData(prev => ({ ...prev, imageUrl: dataUrl }));
                };
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold capitalize">{pageKey} Page</h3>
            <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" value={pageData.title} onChange={e => handleChange('title', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" placeholder="Title" />
            </div>
            {pageData.subtitle !== undefined && 
                <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input type="text" value={pageData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" placeholder="Subtitle" />
                </div>
            }
            
            {pageData.imageUrl !== undefined && (
                 <div>
                    <label className="block text-sm font-medium mb-1">Header Image</label>
                    <div className="flex items-center gap-4">
                        <img src={pageData.imageUrl} alt="preview" className="w-20 h-20 object-cover rounded-md bg-gray-200" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </div>
                </div>
            )}
            
            {pageData.features && pageData.features.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-1">Page Features</label>
                    <div className="space-y-4 mt-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                        {pageData.features.map((feature, index) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{feature.title}</label>
                                 <div className="mt-1">
                                    <RichTextEditor
                                        value={feature.description}
                                        onChange={newHtml => handleFeatureChange(index, newHtml)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Page Content</label>
                <RichTextEditor
                    value={pageData.contentHtml}
                    onChange={newHtml => handleChange('contentHtml', newHtml)}
                />
            </div>
        </div>
    );
};


const ContentView: React.FC = () => {
    const { content, addAdminLog } = useSite();
    const [activeTab, setActiveTab] = useState('home');

    const tabs: (keyof PageContent)[] = Object.keys(content) as (keyof PageContent)[];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Manage Website Content</h1>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                             <button key={tab} onClick={() => setActiveTab(tab as string)} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>
                                {String(tab).charAt(0).toUpperCase() + String(tab).slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-6">
                   <ContentEditor pageKey={activeTab as keyof PageContent} addAdminLog={addAdminLog} />
                </div>
            </div>
        </div>
    );
};

export default ContentView;