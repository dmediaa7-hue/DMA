
import React, { useState } from 'react';
import { useSite } from '../hooks/useSite';
import Modal from '../components/common/Modal';

const GalleryPage: React.FC = () => {
    const { gallery, content } = useSite();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string, caption: string } | null>(null);
    
    const pageContent = content.gallery;

    const openImage = (image: { url: string, caption: string }) => {
        setSelectedImage(image);
        setIsModalOpen(true);
    };

    return (
        <div className="animate-fade-in container mx-auto px-4 py-16">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">{pageContent.title}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">{pageContent.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer" onClick={() => openImage(image)}>
                        <img src={image.url} alt={image.caption} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 flex items-end">
                            <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-semibold text-lg">{image.caption}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedImage?.caption || 'Image'}>
                {selectedImage && (
                    <div>
                        <img src={selectedImage.url} alt={selectedImage.caption} className="w-full h-auto rounded-lg" />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GalleryPage;