
import React, { useState } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { GalleryImage } from '../../types';
import Modal from '../common/Modal';

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

const EditModal: React.FC<{ image: GalleryImage | null; onClose: () => void; onSave: (image: GalleryImage) => Promise<void> }> = ({ image, onClose, onSave }) => {
    const { settings } = useSite();
    const [editedImage, setEditedImage] = useState<GalleryImage | null>(image);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
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
        <Modal isOpen={!!image} onClose={onClose} title="Edit Image Details">
            <div className="space-y-4">
                <img src={editedImage.url} alt="preview" className="w-full h-48 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />
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
            </div>
        </Modal>
    );
};


const GalleryView: React.FC = () => {
    const { gallery, addGalleryImages, updateGalleryImage, deleteGalleryImage, addAdminLog } = useSite();
    const { addNotification } = useNotification();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    
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
                     <div key={image.id} className="group rounded-lg shadow-lg bg-white dark:bg-dark-card flex flex-col">
                        <div
                            style={{ backgroundImage: `url(${image.url})` }}
                            className="w-full h-56 bg-cover bg-center rounded-t-lg"
                            role="img"
                            aria-label={image.caption}
                        />
                        <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white truncate">{image.caption}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{image.district}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setEditingImage(image)} className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Edit</button>
                                <button onClick={() => handleDelete(image)} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                addNotification={addNotification}
            />
            
            <EditModal
                image={editingImage}
                onClose={() => setEditingImage(null)}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default GalleryView;