import React, { useState } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { GalleryImage } from '../../types';
import Modal from '../common/Modal';

// Upload Modal Component
interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: { file: File; caption: string }[]) => Promise<void>;
    addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, addNotification }) => {
    const [filesToUpload, setFilesToUpload] = useState<{ file: File; preview: string; caption: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const acceptedFiles: { file: File; preview: string; caption: string }[] = [];
            for (const file of Array.from(e.target.files)) {
                if (file.size > MAX_FILE_SIZE) {
                    addNotification('error', 'File Too Large', `${file.name} exceeds the 5MB size limit and was not added.`);
                } else {
                    acceptedFiles.push({
                        file,
                        preview: URL.createObjectURL(file),
                        caption: '',
                    });
                }
            }
            setFilesToUpload(prev => [...prev, ...acceptedFiles]);
            e.target.value = ''; // Reset input
        }
    };

    const handleCaptionChange = (index: number, caption: string) => {
        setFilesToUpload(prev => {
            const updated = [...prev];
            updated[index].caption = caption;
            return updated;
        });
    };

    const handleRemove = (index: number) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        setIsUploading(true);
        await onUpload(filesToUpload.map(({ file, caption }) => ({ file, caption })));
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
                    <label htmlFor="admin-gallery-image-upload" className="block w-full text-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <p>Click to select images</p>
                        <input id="admin-gallery-image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">Max file size: 5MB per image.</p>
                </div>
                {filesToUpload.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {filesToUpload.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <img src={item.preview} alt="preview" className="w-16 h-16 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Enter caption..."
                                        value={item.caption}
                                        onChange={e => handleCaptionChange(index, e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                                    />
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


const GalleryView: React.FC = () => {
    const { gallery, addGalleryImages, deleteGalleryImage, addAdminLog } = useSite();
    const { addNotification } = useNotification();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
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
    
    const handleUpload = async (files: { file: File, caption: string }[]) => {
        try {
            await addGalleryImages(files);
            await addAdminLog(`Uploaded ${files.length} new image(s) to the gallery.`);
            addNotification('success', 'Upload Complete', `${files.length} image(s) have been added to the gallery.`);
        } catch(error) {
            addNotification('error', 'Upload Failed', (error as Error).message);
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Gallery</h1>
                <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    Add Images
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image) => (
                     <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                        <div
                            style={{ backgroundImage: `url(${image.url})` }}
                            className="w-full h-72 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                            role="img"
                            aria-label={image.caption}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 flex items-end">
                            <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-semibold text-lg">{image.caption}</h3>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(image); }}
                            className="absolute top-2 right-2 z-10 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                            aria-label="Delete image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                ))}
            </div>
            
            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                addNotification={addNotification}
            />
        </div>
    );
};

export default GalleryView;