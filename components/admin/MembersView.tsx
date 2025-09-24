import React, { useState, useMemo } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { Member } from '../../types';
import Papa from 'papaparse';
import Modal from '../common/Modal';

const MembersView: React.FC = () => {
    const { members, updateMember, deleteMember, addBulkMembers, clearAllMembers, addAdminLog, regenerateMemberCredentials, bulkRegenerateMemberCredentials } = useSite();
    const { addNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
    
    // State for single credential regeneration
    const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
    const [regenStep, setRegenStep] = useState<'initial' | 'done'>('initial');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ ID: string, Password?: string } | null>(null);

    // State for bulk CSV import
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStep, setImportStep] = useState<'upload' | 'confirm' | 'done'>('upload');
    const [validatedMembers, setValidatedMembers] = useState<Omit<Member, 'ID' | 'Status' | 'membershipDate' | 'hasVoted' | 'Password'>[]>([]);

    // State for bulk credential regeneration
    const [isBulkRegenModalOpen, setIsBulkRegenModalOpen] = useState(false);
    const [bulkRegenStep, setBulkRegenStep] = useState<'initial' | 'done'>('initial');
    const [isBulkRegenerating, setIsBulkRegenerating] = useState(false);
    const [regeneratedData, setRegeneratedData] = useState<Member[] | null>(null);

    const filteredMembers = useMemo(() => {
        return members
            .filter(member => {
                if (statusFilter === 'All') return true;
                return member.Status === statusFilter;
            })
            .filter(member =>
                (member.Name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
                (member.Email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
            );
    }, [members, searchTerm, statusFilter]);

    const handleApprove = async (member: Member) => {
        try {
            await updateMember({ ...member, Status: 'Active' });
            await addAdminLog(`Approved member: ${member.Name}`);
            addNotification('success', 'Member Approved', `${member.Name} is now an active member.`);
        } catch (error) {
            addNotification('error', 'Approval Failed', (error as Error).message);
        }
    };
    
    const handleDelete = async (member: Member) => {
        if (window.confirm(`Are you sure you want to delete ${member.Name}?`)) {
            try {
                await deleteMember(member.ID);
                await addAdminLog(`Deleted member: ${member.Name}`);
                addNotification('success', 'Member Deleted', `${member.Name} has been removed.`);
            } catch (error) {
                addNotification('error', 'Deletion Failed', (error as Error).message);
            }
        }
    };

    const openImportModal = () => {
        setImportStep('upload');
        setValidatedMembers([]);
        setIsImportModalOpen(true);
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const requiredHeaders = ['name', 'house', 'email'];
                    const fileHeaders = results.meta.fields?.map(h => h.toLowerCase().trim()) || [];
                    const hasHeaders = requiredHeaders.every(h => fileHeaders.includes(h));

                    if (!hasHeaders) {
                        addNotification('error', 'Invalid CSV', `CSV must contain "name", "house", and "email" headers.`);
                        return;
                    }

                    // Get all parsed members, ensuring case-insensitivity for emails
                    const parsedMembers = results.data
                        .map((row: any) => ({ 
                            Name: (row.Name || row.name)?.trim(), 
                            House: (row.House || row.house)?.trim(), 
                            Email: (row.Email || row.email)?.trim()
                        }))
                        .filter(m => m.Name && m.Email && m.House);

                    // Check for duplicates within the CSV itself
                    const seenEmailsInCsv = new Set<string>();
                    const uniqueCsvMembers = parsedMembers.filter(member => {
                        const lowerCaseEmail = member.Email.toLowerCase();
                        if (seenEmailsInCsv.has(lowerCaseEmail)) {
                            return false;
                        }
                        seenEmailsInCsv.add(lowerCaseEmail);
                        return true;
                    });
                    if(uniqueCsvMembers.length < parsedMembers.length) {
                        addNotification('info', 'CSV Duplicates Ignored', `${parsedMembers.length - uniqueCsvMembers.length} duplicate emails within the CSV file were ignored.`);
                    }

                    // Get existing emails from the database
                    const existingEmails = new Set(members.map(m => m.Email.toLowerCase()));

                    // Filter out members that already exist in the database
                    const membersToImport = uniqueCsvMembers.filter(
                        m => !existingEmails.has(m.Email.toLowerCase())
                    );
                    
                    const duplicateCount = uniqueCsvMembers.length - membersToImport.length;
                    if (duplicateCount > 0) {
                        addNotification('info', 'Existing Members Skipped', `${duplicateCount} members from the CSV already exist in the database and will be skipped.`);
                    }

                    if (membersToImport.length === 0) {
                        addNotification('error', 'No New Members to Import', 'All members in the provided file already exist or the file is empty.');
                        event.target.value = ''; // Reset file input
                        return;
                    }

                    setValidatedMembers(membersToImport);
                    setImportStep('confirm');
                },
                error: (error) => addNotification('error', 'CSV Parse Error', error.message)
            });
        }
    };

    const handleConfirmImport = async (append: boolean) => {
        try {
            await addBulkMembers(validatedMembers, append);
            await addAdminLog(`Bulk imported ${validatedMembers.length} members. Append: ${append}`);
            addNotification('success', 'Import Successful', `${validatedMembers.length} members have been imported.`);
            setIsImportModalOpen(false);
        } catch (error) {
            addNotification('error', 'Import Failed', (error as Error).message);
        }
    };
    
    const handleClearAll = async () => {
        if (window.confirm('ARE YOU SURE you want to delete ALL members? This action is irreversible.')) {
            try {
                await clearAllMembers();
                await addAdminLog('Cleared all members from the database.');
                addNotification('success', 'All Members Deleted', 'The member list has been cleared.');
            } catch (error) {
                addNotification('error', 'Deletion Failed', (error as Error).message);
            }
        }
    };

    const openRegenModal = (member: Member) => {
        setSelectedMember(member);
        setRegenStep('initial');
        setNewCredentials(null);
        setIsRegenerating(false);
        setIsRegenModalOpen(true);
    };

    const handleRegenerate = async () => {
        if (!selectedMember) return;
        setIsRegenerating(true);
        try {
            const updatedMember = await regenerateMemberCredentials(selectedMember.ID);
            if (updatedMember) {
                setNewCredentials({ ID: updatedMember.ID, Password: updatedMember.Password });
                setRegenStep('done');
                addNotification('success', 'Password Regenerated', `New password created for ${selectedMember.Name}.`);
                await addAdminLog(`Regenerated password for ${selectedMember.Name}`);
            }
        } catch (error) {
            addNotification('error', 'Regeneration Failed', (error as Error).message);
        } finally {
            setIsRegenerating(false);
        }
    };
    
    const openBulkRegenModal = () => {
        setBulkRegenStep('initial');
        setRegeneratedData(null);
        setIsBulkRegenerating(false);
        setIsBulkRegenModalOpen(true);
    };

    const handleBulkRegenerate = async () => {
        if (window.confirm(`Are you sure you want to regenerate passwords for ALL ${members.length} members? This is irreversible.`)) {
            setIsBulkRegenerating(true);
            try {
                const updatedMembers = await bulkRegenerateMemberCredentials();
                setRegeneratedData(updatedMembers);
                setBulkRegenStep('done');
                addNotification('success', 'Bulk Regeneration Complete', `Passwords for all ${members.length} members have been updated.`);
                await addAdminLog(`Bulk regenerated passwords for all members.`);
            } catch (error) {
                addNotification('error', 'Bulk Regeneration Failed', (error as Error).message);
            } finally {
                setIsBulkRegenerating(false);
            }
        }
    };

    const handleDownloadRegenerated = () => {
        if (!regeneratedData) return;
        const csvData = regeneratedData.map(({ Name, Email, ID, Password }) => ({ Name, Email, ID, Password }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `new_credentials_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addNotification('success', 'Copied!', 'Credential copied to clipboard.');
        });
    };

    const handlePublicExport = () => {
        if (filteredMembers.length === 0) {
            addNotification('info', 'No Data to Export', 'There are no members matching the current filters.');
            return;
        }

        // Explicitly map fields for robustness, excluding the password.
        const dataToExport = filteredMembers.map(member => ({
            'ID': member.ID,
            'Name': member.Name,
            'House': member.House,
            'Email': member.Email,
            'Status': member.Status,
            'Has Voted': member.hasVoted ? 'Yes' : 'No',
            'Member Since': new Date(member.membershipDate).toLocaleDateString(),
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dma_members_public_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addNotification('success', 'Export Successful', `${filteredMembers.length} members exported to CSV.`);
    };

    const handleConfidentialExport = () => {
        if (filteredMembers.length === 0) {
            addNotification('info', 'No Data to Export', 'There are no members matching the current filters.');
            return;
        }

        if (!window.confirm("WARNING: This export will include member passwords in plain text. Are you sure you want to proceed?")) {
            return;
        }

        // Explicitly map each field to handle optional properties gracefully.
        const dataToExport = filteredMembers.map(member => ({
            'ID': member.ID,
            'Name': member.Name,
            'House': member.House,
            'Email': member.Email,
            'Password': member.Password || '', // Ensure password is a string, even if undefined
            'Status': member.Status,
            'Has Voted': member.hasVoted ? 'Yes' : 'No', // Convert boolean/undefined to string
            'Member Since': new Date(member.membershipDate).toLocaleDateString(),
        }));
        
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dma_members_with_passwords_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addNotification('info', 'Confidential Export Successful', `${filteredMembers.length} members, including passwords, exported to CSV.`);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Members</h1>
                <div className="flex gap-2 flex-wrap justify-center">
                    <button onClick={handlePublicExport} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Export Public (CSV)</button>
                    <button onClick={handleConfidentialExport} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Export Confidential (CSV)</button>
                    <button onClick={openImportModal} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Import CSV</button>
                    <button onClick={openBulkRegenModal} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Bulk Regenerate</button>
                    <button onClick={handleClearAll} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Clear All</button>
                </div>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-dark-card rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">ID</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Name</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Email</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Password</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">House</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Status</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Member Since</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.ID} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-mono text-xs">{member.ID}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{member.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{member.Email}</td>
                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{member.Password}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{member.House}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 font-semibold text-xs rounded-full ${member.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {member.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(member.membershipDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex gap-2 flex-wrap">
                                    {member.Status === 'Pending' && (
                                        <button onClick={() => handleApprove(member)} className="text-sm px-3 py-1 bg-green-500 text-white rounded-md whitespace-nowrap">Approve</button>
                                    )}
                                    <button onClick={() => openRegenModal(member)} className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md whitespace-nowrap">Regenerate</button>
                                    <button onClick={() => handleDelete(member)} className="text-sm px-3 py-1 bg-red-500 text-white rounded-md whitespace-nowrap">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMembers.length === 0 && <p className="p-4 text-center">No members found.</p>}
            </div>

            {/* CSV Import Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Members from CSV">
                {importStep === 'upload' && (
                    <div className="space-y-4">
                        <p>Upload a CSV file with headers: <strong>name, house, email</strong>. ID and Password will be auto-generated.</p>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </div>
                )}
                {importStep === 'confirm' && (
                    <div className="space-y-4">
                        <p className="font-semibold">{validatedMembers.length} valid members found in the file.</p>
                        <p>Would you like to add these members to the existing list, or replace the entire list?</p>
                        <div className="flex justify-end gap-2 pt-2">
                             <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                             <button onClick={() => handleConfirmImport(true)} className="px-4 py-2 bg-blue-500 text-white rounded-md">Append</button>
                             <button onClick={() => handleConfirmImport(false)} className="px-4 py-2 bg-red-500 text-white rounded-md">Erase & Import</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Single Member Credential Regeneration Modal */}
            <Modal isOpen={isRegenModalOpen} onClose={() => setIsRegenModalOpen(false)} title={`Regenerate Password for ${selectedMember?.Name}`}>
                {regenStep === 'initial' && (
                    <div className="space-y-4">
                        <p>This will generate a new Password for this member. The Member ID will remain unchanged.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsRegenModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md" disabled={isRegenerating}>Cancel</button>
                            <button onClick={handleRegenerate} className="px-4 py-2 bg-yellow-500 text-white rounded-md disabled:opacity-50" disabled={isRegenerating}>
                                {isRegenerating ? 'Regenerating...' : 'Regenerate Password'}
                            </button>
                        </div>
                    </div>
                )}
                {regenStep === 'done' && newCredentials && (
                    <div className="space-y-4">
                        <p className="font-semibold text-center">New Password Generated!</p>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">New Password:</span>
                                <code className="font-mono">{newCredentials.Password}</code>
                                <button onClick={() => copyToClipboard(newCredentials.Password || '')} className="text-sm p-1">📋</button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIsRegenModalOpen(false)} className="px-4 py-2 bg-primary text-white rounded-md">Close</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bulk Credential Regeneration Modal */}
            <Modal isOpen={isBulkRegenModalOpen} onClose={() => setIsBulkRegenModalOpen(false)} title="Bulk Regenerate Passwords">
                {bulkRegenStep === 'initial' && (
                    <div className="space-y-4">
                        <p>This will regenerate the Password for all <strong>{members.length}</strong> members. Member IDs will remain unchanged. This action is irreversible.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsBulkRegenModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md" disabled={isBulkRegenerating}>Cancel</button>
                            <button onClick={handleBulkRegenerate} className="px-4 py-2 bg-yellow-500 text-white rounded-md disabled:opacity-50" disabled={isBulkRegenerating}>
                                {isBulkRegenerating ? 'Regenerating...' : 'Regenerate All Passwords'}
                            </button>
                        </div>
                    </div>
                )}
                {bulkRegenStep === 'done' && (
                    <div className="space-y-4 text-center">
                        <p className="text-lg font-semibold">Regeneration Complete!</p>
                        <p>New passwords have been generated for all members.</p>
                        <p className="font-bold text-red-500">IMPORTANT: Download the new credentials now to avoid losing access for your members.</p>
                        <div className="flex justify-center gap-2 pt-4">
                            <button onClick={() => setIsBulkRegenModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Close</button>
                            <button onClick={handleDownloadRegenerated} className="px-4 py-2 bg-green-500 text-white rounded-md">Download New Credentials (CSV)</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MembersView;