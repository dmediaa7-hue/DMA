
import React from 'react';
import { useSite } from '../../hooks/useSite';
import { Announcement } from '../../types';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full text-white ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    if (seconds < 10) return "just now";
    return `${Math.floor(seconds)} seconds ago`;
};

const DashboardView: React.FC = () => {
    const { members, candidates, announcements, adminLogs } = useSite();
    const pendingRequests = members.filter(m => m.Status === 'Pending').length;

    const cards: { title: string; value: number; icon: React.ReactElement; colorClass: string; }[] = [
        { title: "Total Members", value: members.length, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, colorClass: "bg-blue-500" },
        { title: "Active Candidates", value: candidates.length, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, colorClass: "bg-green-500" },
        { title: "Pending Requests", value: pendingRequests, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>, colorClass: "bg-yellow-500" },
        { title: "Total Votes Cast", value: candidates.reduce((acc, c) => acc + c.votes, 0), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2"/><path d="m9 12 2 2 4-4"/></svg>, colorClass: "bg-purple-500" },
    ];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <DashboardCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        colorClass={card.colorClass}
                    />
                ))}
            </div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Live Activity Feed</h2>
                        <Link to="/admin/logs" className="text-sm text-primary hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                       {adminLogs.length > 0 ? (
                            adminLogs.slice(0, 5).map(log => (
                                <div key={log.id} className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {log.action}
                                        <span className="text-gray-400 block sm:inline sm:ml-2 text-xs">
                                            {timeSince(new Date(log.timestamp))} by {log.admin}
                                        </span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity to display.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Announcements</h2>
                     <ul className="space-y-3">
                        {announcements.slice(0, 3).map((ann: Announcement) => (
                            <li key={ann.id} className="border-b dark:border-gray-700 pb-2 last:border-b-0">
                                <p className="font-semibold text-gray-800 dark:text-white">{ann.title}</p>
                                <p className="text-xs text-gray-500">{new Date(ann.date).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
