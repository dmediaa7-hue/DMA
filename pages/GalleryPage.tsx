import React, { useState, useEffect } from 'react';
import { useSite } from '../hooks/useSite';
import { GalleryImage } from '../types';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { supabase } from '../utils/supabase';

// Upload Modal Component
interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: { file: File; caption: string; district: string }[]) => Promise<void>;
    addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, addNotification }) => {
    const { settings } = useSite();
    const [filesToUpload, setFilesToUpload] = useState<{ file: File; preview: string; caption: string; district: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const acceptedFiles: { file: File; preview: string; caption: string; district: string }[] = [];
            for (const file of Array.from(e.target.files) as File[]) {
                if (file.size > MAX_FILE_SIZE) {
                    addNotification('error', 'File Too Large', `${file.name} exceeds the 5MB size limit and was not added.`);
                } else {
                    acceptedFiles.push({
                        file,
                        preview: URL.createObjectURL(file),
                        caption: '',
                        district: settings.districts[0] || '',
                    });
                }
            }
            setFilesToUpload(prev => [...prev, ...acceptedFiles]);
            e.target.value = '';
        }
    };

    const handleCaptionChange = (index: number, caption: string) => {
        setFilesToUpload(prev => {
            const updated = [...prev];
            updated[index].caption = caption;
            return updated;
        });
    };
    
    const handleDistrictChange = (index: number, district: string) => {
        setFilesToUpload(prev => {
            const updated = [...prev];
            updated[index].district = district;
            return updated;
        });
    };

    const handleRemove = (index: number) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        setIsUploading(true);
        await onUpload(filesToUpload);
        setIsUploading(false);
        setFilesToUpload([]);
        onClose();
    };
    
    const handleClose = () => {
        setFilesToUpload([]);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Upload New Images">
            <div className="space-y-4">
                <div>
                    <label htmlFor="gallery-page-image-upload" className="block w-full text-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <p>Click to select images</p>
                        <input id="gallery-page-image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">Max file size: 5MB per image.</p>
                </div>
                {filesToUpload.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {filesToUpload.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <img src={item.preview} alt="preview" className="w-16 h-16 object-cover rounded-md" />
                                <div className="flex-grow space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Enter caption..."
                                        value={item.caption}
                                        onChange={e => handleCaptionChange(index, e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                                    />
                                    <select
                                        value={item.district}
                                        onChange={e => handleDistrictChange(index, e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-sm"
                                    >
                                        {settings.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => handleRemove(index)} className="p-2 text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={handleClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md" disabled={isUploading}>Cancel</button>
                    <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                        disabled={isUploading || filesToUpload.length === 0}
                    >
                        {isUploading ? 'Uploading...' : `Upload ${filesToUpload.length} Image(s)`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};


const ViewEditModal: React.FC<{
    image: GalleryImage | null;
    isAdmin: boolean;
    onClose: () => void;
    onSave: (image: GalleryImage) => Promise<void>;
}> = ({ image, isAdmin, onClose, onSave }) => {
    const { settings } = useSite();
    const [editedImage, setEditedImage] = useState<GalleryImage | null>(image);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedImage(image);
    }, [image]);

    if (!editedImage) return null;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editedImage);
        setIsSaving(false);
        onClose();
    };

    return (
        <Modal isOpen={!!image} onClose={onClose} title={isAdmin ? "View / Edit Image" : editedImage.caption}>
            <div className="space-y-4">
                <div
                    style={{ backgroundImage: `url(${editedImage.url})` }}
                    className="w-full aspect-video bg-contain bg-no-repeat bg-center rounded-md bg-gray-100 dark:bg-gray-800"
                    role="img"
                    aria-label={editedImage.caption}
                />
                {isAdmin ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Caption</label>
                            <input
                                type="text"
                                value={editedImage.caption}
                                onChange={e => setEditedImage({ ...editedImage, caption: e.target.value })}
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            <select
                                value={editedImage.district}
                                onChange={e => setEditedImage({ ...editedImage, district: e.target.value })}
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                            >
                                {settings.districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md" disabled={isSaving}>Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </>
                ) : <p className="text-center text-lg mt-2">{editedImage.caption}</p>}
            </div>
        </Modal>
    );
};

const GalleryPage: React.FC = () => {
    const { gallery, content, setContent, addGalleryImages, updateGalleryImage, deleteGalleryImage, addAdminLog } = useSite();
    const { isAdmin } = useAuth();
    const { addNotification } = useNotification();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    
    const pageContent = content.gallery;

    const imagesByDistrict = gallery.reduce((acc, image) => {
        (acc[image.district] = acc[image.district] || []).push(image);
        return acc;
    }, {} as Record<string, GalleryImage[]>);

    const districtsWithImages = Object.keys(imagesByDistrict).sort();
    const [activeDistrict, setActiveDistrict] = useState(districtsWithImages[0] || '');

    useEffect(() => {
        if (districtsWithImages.length > 0 && !districtsWithImages.includes(activeDistrict)) {
            setActiveDistrict(districtsWithImages[0]);
        }
    }, [districtsWithImages, activeDistrict]);

    const openImage = (image: GalleryImage) => {
        setSelectedImage(image);
    };

    const handleDelete = async (image: GalleryImage) => {
        if (window.confirm(`Are you sure you want to delete the image "${image.caption}"? This is irreversible.`)) {
            try {
                await deleteGalleryImage(image);
                await addAdminLog(`Deleted gallery image: ${image.caption} (ID: ${image.id})`);
                addNotification('success', 'Image Deleted', 'The image was successfully removed from the gallery.');
            } catch (error) {
                addNotification('error', 'Deletion Failed', (error as Error).message);
            }
        }
    };
    
    const handleUpload = async (files: { file: File, caption: string, district: string }[]) => {
        try {
            await addGalleryImages(files);
            await addAdminLog(`Uploaded ${files.length} new image(s) to the gallery.`);
            addNotification('success', 'Upload Complete', `${files.length} image(s) have been added to the gallery.`);
        } catch(error) {
            addNotification('error', 'Upload Failed', (error as Error).message);
        }
    }

    const handleSaveEdit = async (image: GalleryImage) => {
        try {
            await updateGalleryImage(image);
            await addAdminLog(`Updated gallery image: ${image.caption}`);
            addNotification('success', 'Image Updated', 'The image details have been saved.');
        } catch (error) {
            addNotification('error', 'Update Failed', (error as Error).message);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            addNotification('error', 'File Too Large', 'Banner image should be less than 2MB.');
            return;
        }

        setIsUploadingBanner(true);
        try {
            const filePath = `banners/gallery-banner-${Date.now()}`;
            const { error: uploadError } = await supabase.storage.from('Gallery').upload(filePath, file);
            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabase.storage.from('Gallery').getPublicUrl(filePath);
            const newBannerUrl = publicUrlData.publicUrl;

            const oldBannerUrl = content.gallery.bannerUrl;
            if (oldBannerUrl) {
                try {
                    const oldFilePath = new URL(oldBannerUrl).pathname.split('/Gallery/')[1];
                    await supabase.storage.from('Gallery').remove([oldFilePath]);
                } catch (err) {
                    console.warn("Could not delete old banner from storage, continuing.", err);
                }
            }

            const newContent = {
                ...content,
                gallery: { ...content.gallery, bannerUrl: newBannerUrl }
            };
            await setContent(newContent);
            await addAdminLog('Updated the gallery banner image.');
            addNotification('success', 'Banner Updated', 'The new banner has been uploaded.');

        } catch (error) {
            addNotification('error', 'Banner Upload Failed', (error as Error).message);
        } finally {
            setIsUploadingBanner(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleBannerDelete = async () => {
        const bannerUrl = content.gallery.bannerUrl;
        if (!bannerUrl) return;

        if (window.confirm('Are you sure you want to delete the gallery banner?')) {
            try {
                const oldFilePath = new URL(bannerUrl).pathname.split('/Gallery/')[1];
                await supabase.storage.from('Gallery').remove([oldFilePath]);

                const { bannerUrl: removed, ...galleryContent } = content.gallery;
                const newContent = { ...content, gallery: galleryContent };

                await setContent(newContent);
                await addAdminLog('Deleted the gallery banner image.');
                addNotification('success', 'Banner Deleted', 'The banner has been removed.');
            } catch (error) {
                addNotification('error', 'Deletion Failed', (error as Error).message);
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <section className="relative group w-full h-[30vh] md:h-[45vh] bg-gray-200 dark:bg-gray-700">
                {pageContent.bannerUrl ? (
                    <img src={pageContent.bannerUrl} alt="Gallery Banner" className="w-full h-full object-cover no-copy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-500">No banner image uploaded. Admins can upload one.</p>
                    </div>
                )}
                {isAdmin && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-4">
                            <label htmlFor="banner-upload" className="cursor-pointer p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" title="Change Banner">
                                {isUploadingBanner ? (
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                )}
                            </label>
                            <input type="file" id="banner-upload" className="hidden" accept=".png, .jpg, .jpeg" onChange={handleBannerUpload} disabled={isUploadingBanner}/>
                            {pageContent.bannerUrl && (
                                 <button onClick={handleBannerDelete} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors" title="Delete Banner" disabled={isUploadingBanner}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            <div className="container mx-auto px-4 py-16">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">{pageContent.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">{pageContent.subtitle}</p>
                    {isAdmin && (
                        <div className="mt-6">
                            <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                            >
                                Add Images
                            </button>
                        </div>
                    )}
                </header>

                {districtsWithImages.length > 0 ? (
                    <>
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Districts">
                                {districtsWithImages.map(district => (
                                    <button
                                        key={district}
                                        onClick={() => setActiveDistrict(district)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeDistrict === district
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        {district}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {imagesByDistrict[activeDistrict]?.map((image) => (
                                <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                                    <button
                                        onClick={() => openImage(image)}
                                        className="w-full h-72 bg-cover bg-center block transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                        style={{ backgroundImage: `url(${image.url})` }}
                                        aria-label={image.caption}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 flex items-end pointer-events-none">
                                        <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="font-semibold text-lg">{image.caption}</h3>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openImage(image); }}
                                                className="p-2 bg-blue-500 text-white rounded-full"
                                                title="Edit image" aria-label="Edit image"
                                            >
                                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(image); }}
                                                className="p-2 bg-red-600 text-white rounded-full"
                                                title="Delete image" aria-label="Delete image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">The gallery is currently empty.</p>
                    </div>
                )}
            </div>
            
            <ViewEditModal
                image={selectedImage}
                isAdmin={isAdmin}
                onClose={() => setSelectedImage(null)}
                onSave={handleSaveEdit}
            />
            
            {isAdmin && (
                <UploadModal 
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUpload={handleUpload}
                    addNotification={addNotification}
                />
            )}
        </div>
    );
};

export default GalleryPage;