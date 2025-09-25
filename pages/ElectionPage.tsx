import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSite } from '../hooks/useSite';
import { useNotification } from '../hooks/useNotification';
import { Candidate } from '../types';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import * as api from '../utils/api';

const ElectionPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { candidates, members, refetchData, content } = useSite();
    const { addNotification } = useNotification();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    
    const pageContent = content.election;

    const totalVotes = useMemo(() => candidates.reduce((acc, c) => acc + c.votes, 0), [candidates]);

    const handleVoteClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const confirmVote = async () => {
        if (!selectedCandidate || !currentUser || currentUser.role !== 'member') return;

        setIsVoting(true);

        const currentMember = members.find(m => m.ID === currentUser.ID);
        if (currentMember?.hasVoted) {
             addNotification('info', 'Already Voted', 'You have already cast your vote in this election.');
             setIsModalOpen(false);
             setIsVoting(false);
             return;
        }

        try {
            await api.castVote(selectedCandidate.id);
            addNotification('success', 'Vote Cast!', `Thank you for voting for ${selectedCandidate.name}!`);
            await refetchData();
        } catch (error) {
            addNotification('error', 'Vote Failed', (error as Error).message);
        } finally {
            setIsModalOpen(false);
            setSelectedCandidate(null);
            setIsVoting(false);
        }
    };

    const currentMember = members.find(m => m.ID === currentUser?.ID);
    const hasVoted = currentMember?.hasVoted || false;

    return (
        <div className="animate-fade-in container mx-auto px-4 py-16">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Live Election Results
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
                    {pageContent.subtitle}
                </p>
                <div className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Total Votes Cast: {totalVotes.toLocaleString()}
                </div>
            </header>

            {!currentUser || currentUser.role !== 'member' ? (
                <div className="text-center bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md">
                    <p>You must be a logged-in member to view results and vote. <Link to="/login" className="font-bold underline hover:text-yellow-800 dark:hover:text-yellow-100">Login here</Link>.</p>
                </div>
            ) : (
                <>
                    {hasVoted && (
                         <div className="mb-8 text-center bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md">
                            <p className="font-bold">Thank you for participating! You have already cast your vote in this election.</p>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {candidates.map(candidate => (
                            <Card key={candidate.id} className="text-center flex flex-col">
                                <div className="p-6 flex-grow">
                                    <img src={candidate.photoUrl} alt={candidate.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary/20 no-copy" />
                                    <h3 className="text-2xl font-semibold">{candidate.name}</h3>
                                    <p className="text-primary font-medium">{candidate.position}</p>
                                    <div className="mt-4">
                                        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 transition-all duration-300">{candidate.votes.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Votes</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 mt-auto">
                                    <button
                                        onClick={() => handleVoteClick(candidate)}
                                        disabled={hasVoted}
                                        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {hasVoted ? 'You Have Voted' : `Vote for ${candidate.name.split(' ')[0]}`}
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Your Vote">
                {selectedCandidate && (
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to cast your vote for <span className="font-bold">{selectedCandidate.name}</span> for the position of <span className="font-bold">{selectedCandidate.position}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500" disabled={isVoting}>
                                Cancel
                            </button>
                             <button onClick={confirmVote} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-50" disabled={isVoting}>
                                {isVoting ? 'Voting...' : 'Confirm Vote'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ElectionPage;