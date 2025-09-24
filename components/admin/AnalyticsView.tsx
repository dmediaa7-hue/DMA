
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSite } from '../../hooks/useSite';

const AnalyticsView: React.FC = () => {
    const { members, candidates } = useSite();

    const memberGrowthData = [
        { name: 'Jan', members: 20 },
        { name: 'Feb', members: 45 },
        { name: 'Mar', members: 60 },
        { name: 'Apr', members: 80 },
        { name: 'May', members: 110 },
        { name: 'Jun', members: members.length },
    ];
    
    const voteDistributionData = candidates.map(c => ({ name: c.name, votes: c.votes }));

    const downloadReport = (format: 'csv' | 'txt') => {
        let content = '';
        const data = [
            ['Report Type', 'Value'],
            ['Total Members', members.length],
            ['Total Candidates', candidates.length],
            ['Total Votes', candidates.reduce((sum, c) => sum + c.votes, 0)],
            ...candidates.map(c => [`Votes for ${c.name}`, c.votes])
        ];

        if (format === 'csv') {
            content = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
        } else {
            content = "data:text/plain;charset=utf-8," + data.map(e => e.join(": ")).join("\n");
        }

        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `dma_report.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics & Reports</h1>
                 <div className="flex gap-2">
                    <button onClick={() => downloadReport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Export CSV</button>
                    <button onClick={() => downloadReport('txt')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Export TXT</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Vote Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={voteDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip wrapperClassName="!bg-white dark:!bg-dark-card !border-gray-300 dark:!border-gray-600" />
                            <Legend />
                            <Bar dataKey="votes" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Member Growth (Simulated)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={memberGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip wrapperClassName="!bg-white dark:!bg-dark-card !border-gray-300 dark:!border-gray-600" />
                            <Legend />
                            <Bar dataKey="members" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
