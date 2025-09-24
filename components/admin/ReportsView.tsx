
import React from 'react';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import Papa from 'papaparse';

const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

interface ReportCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{description}</p>
        <div className="flex flex-wrap gap-3">{children}</div>
    </div>
);


const ReportsView: React.FC = () => {
    const { members, candidates, announcements, settings } = useSite();
    const { addNotification } = useNotification();

    const generateMemberList = (format: 'csv' | 'json') => {
        const data = members.map(({ Password, ...member }) => member);
        if (format === 'csv') {
            const csv = Papa.unparse(data);
            downloadFile('member_list.csv', csv, 'text/csv;charset=utf-8;');
        } else {
            const json = JSON.stringify(data, null, 2);
            downloadFile('member_list.json', json, 'application/json');
        }
        addNotification('success', 'Report Generated', `Member list (${format.toUpperCase()}) has been downloaded.`);
    };

    const generateCredentialsList = () => {
        if (!window.confirm("Warning: This report contains sensitive password information. Are you sure you want to proceed?")) {
            return;
        }
        const data = members.map(m => ({
            ID: m.ID,
            Name: m.Name,
            Email: m.Email,
            Password: m.Password
        }));
        const csv = Papa.unparse(data);
        downloadFile('member_credentials_CONFIDENTIAL.csv', csv, 'text/csv;charset=utf-8;');
        addNotification('info', 'Confidential Report Generated', `Member credentials list has been downloaded.`);
    };
    
    const generateVotingResults = (format: 'csv' | 'json') => {
        const data = candidates.map(c => ({
            Candidate_Name: c.name,
            Position: c.position,
            Vote_Count: c.votes
        }));

        if (format === 'csv') {
            const csv = Papa.unparse(data);
            downloadFile('voting_results.csv', csv, 'text/csv;charset=utf-8;');
        } else {
            const json = JSON.stringify(data, null, 2);
            downloadFile('voting_results.json', json, 'application/json');
        }
        addNotification('success', 'Report Generated', `Voting results (${format.toUpperCase()}) has been downloaded.`);
    };
    
    const generateAnnouncementLetter = () => {
        const latestAnnouncement = announcements[0];
        if (!latestAnnouncement) {
            addNotification('error', 'Generation Failed', 'No announcements available to generate a letter.');
            return;
        }

        const letterHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Announcement from ${settings.siteName}</title>
                <style>
                    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 1in; color: #000; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { font-size: 24pt; margin: 0; color: #333; }
                    .header-info { text-align: right; font-size: 10pt; color: #555; }
                    .date { font-size: 12pt; text-align: right; margin-bottom: 30px; }
                    .announcement-title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20px; text-decoration: underline; }
                    .content { text-align: justify; }
                    .content p { margin: 0 0 1em 0; }
                    .footer { text-align: left; margin-top: 50px; padding-top: 10px; border-top: 1px solid #eee; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${settings.siteName}</h1>
                    <div class="header-info">
                        ${settings.contact.address}<br/>
                        ${settings.contact.phone}<br/>
                        ${settings.contact.email}
                    </div>
                </div>

                <p class="date"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <p>To all valued members of the ${settings.siteName},</p>

                <h2 class="announcement-title">${latestAnnouncement.title}</h2>

                <div class="content">
                    <p>${latestAnnouncement.content.replace(/\n/g, '</p><p>')}</p>
                </div>

                <div class="footer">
                    <p>Sincerely,</p>
                    <br/>
                    <p><strong>The Board of the ${settings.siteName}</strong></p>
                </div>
            </body>
            </html>
        `;
        
        downloadFile('announcement_letter.doc', letterHtml, 'application/msword');
        addNotification('success', 'Letter Generated', `The announcement letter has been downloaded.`);
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Reports & Exports</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <ReportCard title="Member Reports" description="Export member data for records, analysis, and administrative tasks.">
                    <button onClick={() => generateMemberList('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">Member List (CSV)</button>
                    <button onClick={() => generateMemberList('json')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">Member List (JSON)</button>
                     <div className="w-full border-t border-gray-200 dark:border-gray-700 border-dashed my-2"></div>
                    <button onClick={generateCredentialsList} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">Credentials List (CSV)</button>
                    <p className="text-xs text-red-600 dark:text-red-400 w-full mt-1">Warning: This report contains sensitive password information. Handle with care.</p>
                </ReportCard>

                <ReportCard title="Election Reports" description="Download current election results and statistics.">
                    <button onClick={() => generateVotingResults('csv')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium">Voting Results (CSV)</button>
                     <button onClick={() => generateVotingResults('json')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium">Voting Results (JSON)</button>
                </ReportCard>

                <ReportCard title="Communications" description="Generate formatted documents for member outreach and official announcements.">
                    <button onClick={generateAnnouncementLetter} className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm font-medium">Generate Announcement Letter (DOC)</button>
                </ReportCard>
            </div>
        </div>
    );
};

export default ReportsView;
