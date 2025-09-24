import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Member } from '../types';
import * as api from '../utils/api';

interface AuthContextType {
    currentUser: (Member & { role: 'admin' | 'member' }) | null;
    login: (emailOrUsername: string, pass: string) => Promise<void>;
    logout: () => void;
    changePassword: (oldPass: string, newPass: string) => Promise<void>;
    isAdmin: boolean;
    isMember: boolean;
    authLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<(Member & { role: 'admin' | 'member' }) | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const isAdmin = currentUser?.role === 'admin';
    const isMember = currentUser?.role === 'member';

    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await api.getCurrentUser();
                setCurrentUser(user);
            } finally {
                setAuthLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = useCallback(async (emailOrUsername: string, pass: string): Promise<void> => {
        const user = await api.login(emailOrUsername, pass);
        setCurrentUser(user);
    }, []);

    const logout = useCallback(async () => {
        await api.logout();
        setCurrentUser(null);
    }, []);

    const changePassword = useCallback(async (oldPass: string, newPass: string): Promise<void> => {
        if (!currentUser) {
            throw new Error('No user is logged in.');
        }
        await api.changePassword(currentUser.ID, oldPass, newPass);
    }, [currentUser]);

    const value = { currentUser, login, logout, changePassword, isAdmin, isMember, authLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};