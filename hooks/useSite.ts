
import { useContext } from 'react';
import { SiteContext } from '../context/SiteContext';

export const useSite = () => {
    const context = useContext(SiteContext);
    if (context === undefined) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};