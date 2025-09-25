import React, { useState, useMemo } from 'react';
import { useSite } from '../hooks/useSite';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';

const GalleryPage: React.FC = () => {
    const { gallery, content } = useSite();
    const { isAdmin } = useAuth();
    const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
    const pageContent = content.gallery;

    const districts = useMemo(() => {
        // Create a set of unique districts from the gallery images
        const uniqueDistricts = new Set(gallery.map(img => img.district));
        // Return an array with "All" and the sorted unique districts
        return ['All', ...Array.from(uniqueDistricts).sort()];
    }, [gallery]);

    const filteredImages = useMemo(() => {
        if (selectedDistrict === 'All') {
            return gallery;
        }
        return gallery.filter(img => img.district === selectedDistrict);
    }, [gallery, selectedDistrict]);

    // Conditional padding: pt-40 (160px) for normal users to clear the 80px header.
    // pt-52 (208px) for admins to clear the 128px combined header.
    // Both leave a nice 80px of padding above the hero text.
    const heroPaddingClass = isAdmin ? 'pt-52 pb-20' : 'pt-40 pb-20';

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <header 
                className={`bg-contain bg-center bg-no-repeat text-white ${heroPaddingClass}`}
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${pageContent.bannerUrl})` }}
            >
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold">{pageContent.title}</h1>
                    <p className="text-lg md:text-xl mt-2">{pageContent.subtitle}</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                {/* District Filter Buttons */}
                <div className="flex justify-center mb-12">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {districts.map(district => (
                            <button
                                key={district}
                                onClick={() => setSelectedDistrict(district)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                                    selectedDistrict === district
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {district}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Grid */}
                {filteredImages.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredImages.map(image => (
                            <Card key={image.id} className="flex flex-col group">
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <img src={image.url} alt={image.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 no-copy" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-white truncate">{image.caption}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{image.district}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">No Images Found</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">There are no images matching the current filter.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GalleryPage;