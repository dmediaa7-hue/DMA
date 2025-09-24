import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Member, Candidate, SiteSettings, PageContent, GalleryImage, Announcement, AdminLog } from '../types';
import * as api from '../utils/api';
import { INITIAL_SETTINGS, INITIAL_CONTENT, INITIAL_MEMBERS, INITIAL_CANDIDATES, INITIAL_GALLERY, INITIAL_ANNOUNCEMENTS } from '../constants';

interface SiteContextType {
    loading: boolean;
    members: Member[];
    candidates: Candidate[];
    settings: SiteSettings;
    content: PageContent;
    gallery: GalleryImage[];
    announcements: Announcement[];
    adminLogs: AdminLog[];
    refetchData: () => Promise<void>;
    updateMember: (member: Member) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
    addCandidate: (candidate: Omit<Candidate, 'id'>) => Promise<Candidate>;
    updateCandidate: (candidate: Candidate) => Promise<void>;
    deleteCandidate: (id: string) => Promise<void>;
    setContent: (content: PageContent) => Promise<void>;
    setSettings: (settings: SiteSettings) => Promise<void>;
    addAdminLog: (action: string) => Promise<void>;
    addBulkMembers: (members: Omit<Member, 'ID' | 'Status' | 'membershipDate' | 'hasVoted' | 'Password'>[], append: boolean) => Promise<void>;
    clearAllMembers: () => Promise<void>;
    regenerateMemberCredentials: (id: string) => Promise<Member | null>;
    bulkRegenerateMemberCredentials: () => Promise<Member[]>;
}

export const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
    const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
    const [settings, setSettingsState] = useState<SiteSettings>(INITIAL_SETTINGS);
    const [content, setContentState] = useState<PageContent>(INITIAL_CONTENT);
    const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
    const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
    const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getSiteData();
            setMembers(data.members);
            setCandidates(data.candidates);
            setSettingsState(data.settings);
            setContentState(data.content);
            setGallery(data.gallery);
            setAnnouncements(data.announcements);
            setAdminLogs(data.adminLogs);
        } catch (error) {
            console.error("Failed to fetch site data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateMember = async (member: Member) => {
        const updatedMember = await api.updateMember(member);
        setMembers(prev => prev.map(m => m.ID === updatedMember.ID ? updatedMember : m));
    };

    const deleteMember = async (id: string) => {
        await api.deleteMember(id);
        setMembers(prev => prev.filter(m => m.ID !== id));
    };

    const addCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
        const newCandidate = await api.addCandidate(candidate);
        setCandidates(prev => [...prev, newCandidate]);
        return newCandidate;
    };
    
    const updateCandidate = async (candidate: Candidate) => {
        const updatedCandidate = await api.updateCandidate(candidate);
        setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
    };

    const deleteCandidate = async (id: string) => {
        await api.deleteCandidate(id);
        setCandidates(prev => prev.filter(c => c.id !== id));
    };

    const setContent = async (newContent: PageContent) => {
        await api.updateContent(newContent);
        setContentState(newContent);
    };

    const setSettings = async (newSettings: SiteSettings) => {
        await api.updateSettings(newSettings);
        setSettingsState(newSettings);
    };
    
    const addAdminLog = async (action: string) => {
        const newLog = await api.addAdminLog(action);
        setAdminLogs(prev => [newLog, ...prev]);
    };
    
    const addBulkMembers = async (newMembersData: Omit<Member, 'ID' | 'Status' | 'membershipDate' | 'hasVoted' | 'Password'>[], append: boolean) => {
        if (!append) {
            await api.clearAllMembers();
        }
        const addedMembers = await api.addBulkMembers(newMembersData);
        
        if (append) {
            setMembers(prev => [...prev, ...addedMembers]);
        } else {
            setMembers(addedMembers);
        }
    };
    
    const clearAllMembers = async () => {
        await api.clearAllMembers();
        setMembers([]);
    };

    const regenerateMemberCredentials = async (id: string): Promise<Member | null> => {
        const updatedMember = await api.regenerateMemberCredentials(id);
        if (updatedMember) {
            setMembers(prev => prev.map(m => m.ID === id ? updatedMember : m));
        }
        return updatedMember;
    }

    const bulkRegenerateMemberCredentials = async (): Promise<Member[]> => {
        const updatedMembers = await api.bulkRegenerateMemberCredentials();
        setMembers(updatedMembers);
        return updatedMembers;
    };

    const value = {
        loading,
        members,
        candidates,
        settings,
        content,
        gallery,
        announcements,
        adminLogs,
        refetchData: fetchData,
        updateMember,
        deleteMember,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        setContent,
        setSettings,
        addAdminLog,
        addBulkMembers,
        clearAllMembers,
        regenerateMemberCredentials,
        bulkRegenerateMemberCredentials,
    };

    return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};