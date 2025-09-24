
import React, { useState } from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import { Candidate } from '../../types';
import Modal from '../common/Modal';

const CandidatesView: React.FC = () => {
    const { candidates, addCandidate, updateCandidate, deleteCandidate, addAdminLog } = useSite();
    const { addNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);

    const openModal = (candidate: Candidate | null = null) => {
        setCurrentCandidate(candidate ? { ...candidate } : { name: '', position: '', photoUrl: 'https://i.pravatar.cc/150', votes: 0 });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!currentCandidate) return;
        setIsSaving(true);
        try {
            if (currentCandidate.id) {
                await updateCandidate(currentCandidate as Candidate);
                await addAdminLog(`Updated candidate: ${currentCandidate.name}`);
                addNotification('success', 'Candidate Updated', `${currentCandidate.name}'s details have been saved.`);
            } else {
                const newCandidate = await addCandidate(currentCandidate as Omit<Candidate, 'id'>);
                await addAdminLog(`Added candidate: ${newCandidate.name}`);
                addNotification('success', 'Candidate Added', `${newCandidate.name} has been added to the election.`);
            }
            setIsModalOpen(false);
        } catch (error) {
            addNotification('error', 'Save Failed', (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            try {
                const candidateName = candidates.find(c => c.id === id)?.name || 'Unknown';
                await deleteCandidate(id);
                await addAdminLog(`Deleted candidate: ${candidateName}`);
                addNotification('success', 'Candidate Deleted', `${candidateName} has been removed.`);
            } catch (error) {
                addNotification('error', 'Deletion Failed', (error as Error).message);
            }
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Candidates</h1>
                <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Add Candidate</button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map(candidate => (
                    <div key={candidate.id} className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 flex flex-col items-center">
                        <img src={candidate.photoUrl} alt={candidate.name} className="w-24 h-24 rounded-full mb-4 border-4 border-primary/30 no-copy" />
                        <h3 className="text-xl font-semibold">{candidate.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{candidate.position}</p>
                        <p className="text-2xl font-bold mt-2 text-primary">{candidate.votes.toLocaleString()} Votes</p>
                        <div className="mt-4 flex space-x-2">
                            <button onClick={() => openModal(candidate)} className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-md">Edit</button>
                            <button onClick={() => handleDelete(candidate.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded-md">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCandidate?.id ? 'Edit Candidate' : 'Add Candidate'}>
                {currentCandidate && <div className="space-y-4">
                    <input type="text" placeholder="Name" value={currentCandidate.name} onChange={e => setCurrentCandidate({ ...currentCandidate, name: e.target.value })} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                    <input type="text" placeholder="Position" value={currentCandidate.position} onChange={e => setCurrentCandidate({ ...currentCandidate, position: e.target.value })} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                    <input type="text" placeholder="Photo URL" value={currentCandidate.photoUrl} onChange={e => setCurrentCandidate({ ...currentCandidate, photoUrl: e.target.value })} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md" disabled={isSaving}>Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>}
            </Modal>
        </div>
    );
};

export default CandidatesView;