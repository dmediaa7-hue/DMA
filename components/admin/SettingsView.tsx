import React, { useState, useEffect } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';

const SettingsView: React.FC = () => {
    const { settings, setSettings, addAdminLog } = useSite();
    const { changePassword } = useAuth();
    const { addNotification } = useNotification();
    const [localSettings, setLocalSettings] = useState(settings);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newDistrict, setNewDistrict] = useState('');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setSettings(localSettings);
            await addAdminLog('Updated site settings');
            addNotification('success', 'Settings Saved', 'Your changes have been successfully saved.');
        } catch(error) {
            addNotification('error', 'Save Failed', (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                addNotification('error', 'Image Too Large', 'Please upload a logo smaller than 1MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024) { // 100KB limit
                addNotification('error', 'Image Too Large', 'Please upload a favicon smaller than 100KB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({ ...prev, faviconUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorChange = (colorName: keyof typeof localSettings.colors, value: string) => {
        setLocalSettings(prev => ({...prev, colors: {...prev.colors, [colorName]: value}}))
    };

    const handleSocialChange = (platform: keyof typeof localSettings.socialLinks, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value,
            },
        }));
    };

    const handleContactChange = (field: keyof typeof localSettings.contact, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            contact: {
                ...prev.contact,
                [field]: value,
            },
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new.length < 8) {
            addNotification('error', 'Password Too Short', 'New password must be at least 8 characters long.');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            addNotification('error', 'Password Mismatch', 'New passwords do not match.');
            return;
        }
        
        setIsChangingPassword(true);
        try {
            await changePassword(passwords.current, passwords.new);
            addNotification('success', 'Password Changed', 'Your password has been updated successfully.');
            await addAdminLog('Changed admin password.');
            setPasswords({ current: '', new: '', confirm: '' }); // Clear fields
        } catch (error) {
            addNotification('error', 'Password Change Failed', (error as Error).message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleAddDistrict = () => {
        const trimmedDistrict = newDistrict.trim();
        if (trimmedDistrict && !localSettings.districts.find(d => d.toLowerCase() === trimmedDistrict.toLowerCase())) {
            setLocalSettings(prev => ({
                ...prev,
                districts: [...prev.districts, trimmedDistrict].sort()
            }));
            setNewDistrict('');
        } else if (trimmedDistrict) {
            addNotification('info', 'Duplicate District', `The district "${trimmedDistrict}" already exists.`);
        }
    };
    
    const handleRemoveDistrict = (districtToRemove: string) => {
        setLocalSettings(prev => ({
            ...prev,
            districts: prev.districts.filter(d => d !== districtToRemove)
        }));
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Site Settings</h1>
                 <div>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">General Settings</h2>
                    <div>
                        <label className="block font-medium">Site Name</label>
                        <input type="text" value={localSettings.siteName} onChange={e => setLocalSettings({...localSettings, siteName: e.target.value})} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                    </div>
                     <div>
                        <label className="block font-medium">Logo</label>
                        <div className="flex items-center space-x-4 mt-1">
                            <img src={localSettings.logoUrl} alt="logo" className="h-12 w-12 bg-gray-200 p-1 rounded-md no-copy" />
                            <div>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size: 1MB.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium">Favicon</label>
                        <div className="flex items-center space-x-4 mt-1">
                            <img src={localSettings.faviconUrl} alt="favicon" className="h-12 w-12 bg-gray-200 p-1 rounded-md no-copy" />
                            <div>
                                <input type="file" accept="image/*" onChange={handleFaviconUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 100KB. Recommended: .ico, .png, .svg (e.g., 32x32px).</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block font-medium">Contact Email</label>
                        <input type="email" value={localSettings.contact.email} onChange={e => handleContactChange('email', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                    </div>
                     <div>
                        <label className="block font-medium">Contact Phone</label>
                        <input type="tel" value={localSettings.contact.phone} onChange={e => handleContactChange('phone', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                    </div>
                     <div>
                        <label className="block font-medium">Contact Address</label>
                        <input type="text" value={localSettings.contact.address} onChange={e => handleContactChange('address', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                    </div>
                    <div>
                        <label className="block font-medium">Social Media Links</label>
                        <div className="space-y-2 mt-1">
                            <div>
                                <label htmlFor="facebook-url" className="text-sm text-gray-500 dark:text-gray-400">Facebook</label>
                                <input id="facebook-url" type="url" placeholder="https://facebook.com/..." value={localSettings.socialLinks?.facebook || ''} onChange={e => handleSocialChange('facebook', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                            </div>
                            <div>
                                <label htmlFor="twitter-url" className="text-sm text-gray-500 dark:text-gray-400">Twitter / X</label>
                                <input id="twitter-url" type="url" placeholder="https://x.com/..." value={localSettings.socialLinks?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                            </div>
                             <div>
                                <label htmlFor="linkedin-url" className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</label>
                                <input id="linkedin-url" type="url" placeholder="https://linkedin.com/in/..." value={localSettings.socialLinks?.linkedin || ''} onChange={e => handleSocialChange('linkedin', e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block font-medium">Annual Membership Fee (INR)</label>
                        <input 
                            type="number" 
                            value={localSettings.membershipFee} 
                            onChange={e => setLocalSettings({...localSettings, membershipFee: parseInt(e.target.value, 10) || 0})} 
                            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" 
                        />
                    </div>
                     <div>
                        <label className="block font-medium">Maintenance Mode</label>
                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                            <input type="checkbox" checked={localSettings.maintenanceMode} onChange={e => setLocalSettings({...localSettings, maintenanceMode: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">Theme & Appearance</h2>
                        <div>
                            <label className="block font-medium">Colors</label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <label htmlFor="primary-color" className="text-sm">Primary</label>
                                    <input id="primary-color" type="color" value={localSettings.colors.primary} onChange={e => handleColorChange('primary', e.target.value)} className="w-8 h-8"/>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <label htmlFor="primary-dark-color" className="text-sm">Primary Dark</label>
                                    <input id="primary-dark-color" type="color" value={localSettings.colors.primaryDark} onChange={e => handleColorChange('primaryDark', e.target.value)} className="w-8 h-8"/>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <label htmlFor="secondary-color" className="text-sm">Secondary</label>
                                    <input id="secondary-color" type="color" value={localSettings.colors.secondary} onChange={e => handleColorChange('secondary', e.target.value)} className="w-8 h-8"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block font-medium">Font</label>
                            <select value={localSettings.font.family} onChange={e => setLocalSettings({...localSettings, font: { family: e.target.value}})} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1">
                                <option value="Inter">Inter (Sans-serif)</option>
                                <option value="Merriweather">Merriweather (Serif)</option>
                                <option value="Inconsolata">Inconsolata (Monospace)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">Manage Gallery Districts</h2>
                        <div>
                            <label className="block font-medium">Add New District</label>
                            <div className="flex gap-2 mt-1">
                                <input 
                                    type="text" 
                                    value={newDistrict}
                                    onChange={e => setNewDistrict(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDistrict(); } }}
                                    className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                                    placeholder="e.g., Mumbai"
                                />
                                <button onClick={handleAddDistrict} type="button" className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-green-600">Add</button>
                            </div>
                        </div>
                        <div>
                            <label className="block font-medium">Current Districts ({localSettings.districts.length})</label>
                            <div className="flex flex-wrap gap-2 mt-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 min-h-[4rem]">
                                {localSettings.districts.length > 0 ? (
                                    localSettings.districts.map(district => (
                                        <span key={district} className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-full animate-fade-in">
                                            {district}
                                            <button onClick={() => handleRemoveDistrict(district)} title={`Remove ${district}`} className="text-white hover:bg-primary-dark rounded-full w-5 h-5 flex items-center justify-center font-bold">&times;</button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No districts configured.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">Change Admin Password</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium text-sm">Current Password</label>
                                <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} required className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <label className="block font-medium text-sm">New Password (min 8 chars)</label>
                                <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} required minLength={8} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <label className="block font-medium text-sm">Confirm New Password</label>
                                <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} required className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-green-600 disabled:opacity-50" disabled={isChangingPassword}>
                                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;