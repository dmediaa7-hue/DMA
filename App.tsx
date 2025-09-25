import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import MembershipPage from './pages/MembershipPage';
import ElectionPage from './pages/ElectionPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/common/Header';
import AdminBar from './components/common/AdminBar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { useSite } from './hooks/useSite';
import DashboardView from './components/admin/DashboardView';
import MembersView from './components/admin/MembersView';
import CandidatesView from './components/admin/CandidatesView';
import AnalyticsView from './components/admin/AnalyticsView';
import ContentView from './components/admin/ContentView';
import SettingsView from './components/admin/SettingsView';
import ReportsView from './components/admin/ReportsView';
import AdminLogsView from './components/admin/AdminLogsView';
import GalleryView from './components/admin/GalleryView';

const LoadingSpinner: React.FC = () => (
    <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const ThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings } = useSite();

    useEffect(() => {
        const root = document.documentElement;
        if (settings.colors) {
            root.style.setProperty('--color-primary', settings.colors.primary);
            root.style.setProperty('--color-primary-dark', settings.colors.primaryDark);
            root.style.setProperty('--color-secondary', settings.colors.secondary);
            root.style.setProperty('--color-light-bg', settings.colors.lightBg);
            root.style.setProperty('--color-dark-bg', settings.colors.darkBg);
            root.style.setProperty('--color-dark-card', settings.colors.darkCard);
        }
        if (settings.font) {
             root.style.setProperty('--font-family', settings.font.family);
        }
    }, [settings]);
    
    useEffect(() => {
        let link = document.getElementById('favicon-link') as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement('link');
            link.id = 'favicon-link';
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        if (settings.faviconUrl) {
            link.href = settings.faviconUrl;
        }
    }, [settings.faviconUrl]);

    return <>{children}</>;
};


const AppContent = () => {
    const { authLoading } = useAuth();
    const { loading: siteLoading } = useSite();

    if (authLoading || siteLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ThemeManager>
            <div className="flex flex-col min-h-screen">
                <Header />
                <AdminBar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/membership" element={<MembershipPage />} />
                        <Route path="/election" element={<ElectionPage />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/profile" element={
                            <ProtectedRoute roles={['member']}>
                                <ProfilePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardView />} />
                            <Route path="members" element={<MembersView />} />
                            <Route path="candidates" element={<CandidatesView />} />
                            <Route path="gallery" element={<GalleryView />} />
                            <Route path="analytics" element={<AnalyticsView />} />
                            <Route path="content" element={<ContentView />} />
                            <Route path="settings" element={<SettingsView />} />
                            <Route path="reports" element={<ReportsView />} />
                            <Route path="logs" element={<AdminLogsView />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </div>
        </ThemeManager>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <SiteProvider>
                <NotificationProvider>
                    <ThemeProvider>
                        <HashRouter>
                            <AppContent />
                        </HashRouter>
                    </ThemeProvider>
                </NotificationProvider>
            </SiteProvider>
        </AuthProvider>
    );
};

export default App;