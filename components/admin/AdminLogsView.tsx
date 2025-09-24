import React, { useState, useMemo } from 'react';
import { useSite } from '../../hooks/useSite';

const AdminLogsView: React.FC = () => {
    const { adminLogs, refetchData } = useSite();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredLogs = useMemo(() => {
        return adminLogs.filter(log =>
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.admin.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [adminLogs, searchTerm]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetchData();
        // Add a small delay to show feedback
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Activity Logs</h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                    <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" /></svg>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search logs by action or admin..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
                />
            </div>

            <div className="overflow-x-auto bg-white dark:bg-dark-card rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Date & Time</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Admin</th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{log.admin}</td>
                                <td className="px-6 py-4">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && <p className="p-4 text-center">No logs found matching your search.</p>}
            </div>
        </div>
    );
};

export default AdminLogsView;