
import React, { createContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
}

interface NotificationContextType {
    addNotification: (type: NotificationType, title: string, message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const Toast: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(notification.id), 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    const baseClasses = "w-full max-w-sm bg-white dark:bg-dark-card shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-colors duration-300";
    const animationClasses = isExiting ? 'animate-fade-out-right' : 'animate-fade-in-right';

    const typeClasses = {
        success: {
            iconBg: 'bg-green-100 dark:bg-green-900',
            iconText: 'text-green-500 dark:text-green-400',
            icon: <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        error: {
            iconBg: 'bg-red-100 dark:bg-red-900',
            iconText: 'text-red-500 dark:text-red-400',
            icon: <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        info: {
            iconBg: 'bg-blue-100 dark:bg-blue-900',
            iconText: 'text-blue-500 dark:text-blue-400',
            icon: <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }
    };

    const currentType = typeClasses[notification.type];

    return (
        <div className={`${baseClasses} ${animationClasses}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${currentType.iconBg}`}>
                        <span className={currentType.iconText}>{currentType.icon}</span>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={handleDismiss} className="inline-flex text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
        setNotifications(prev => [...prev, { id: Date.now(), type, title, message }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map(notification => (
                        <Toast key={notification.id} notification={notification} onDismiss={removeNotification} />
                    ))}
                </div>
            </div>
        </NotificationContext.Provider>
    );
};