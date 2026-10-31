/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Application Component for KMPL Cricket.
 * Configures ErrorBoundary, React Router, bilingual localization, Supabase auth providers,
 * unified single-instance RealtimeDataProvider, top navigation bar, and mobile thumb bottom bar.
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeDataProvider } from './hooks/useRealtimeData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { AdminGuard } from './components/AdminGuard';
import { useAuth } from './context/AuthContext';
import { recordActivity, getActivitySessionId } from './lib/activity';

// Pages
import { DirectoryPage } from './pages/DirectoryPage';
import { MonthlyFundPage } from './pages/MonthlyFundPage';
import { BaddiChittiPage } from './pages/BaddiChittiPage';
import { CumulativeReportPage } from './pages/CumulativeReportPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCollectPage } from './pages/AdminCollectPage';
import { AdminBaddiPage } from './pages/AdminBaddiPage';
import { AdminPlayersPage } from './pages/AdminPlayersPage';
import { AdminManagePage } from './pages/AdminManagePage';
import { AdminRulesPage } from './pages/AdminRulesPage';
import { CommunityChatPage } from './pages/CommunityChatPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminActivityPage } from './pages/AdminActivityPage';
import { PlayerPortalLoginPage } from './pages/PlayerPortalLoginPage';

const PlayerPortalGuard: React.FC = () => {
  const { currentAdmin, currentPlayer, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8 text-center text-sm text-slate-500">Loading portal…</div>;
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  return currentAdmin || currentPlayer
    ? <Outlet />
    : <Navigate to={`/player/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
};

const WebsiteActivityTracker: React.FC = () => {
  const location = useLocation();
  const { currentAdmin, currentPlayer } = useAuth();

  const actor = currentAdmin
    ? { type: 'admin' as const, id: currentAdmin.id, name: currentAdmin.name }
    : currentPlayer
    ? { type: 'player_profile' as const, id: currentPlayer.id, name: currentPlayer.name }
    : { type: 'guest' as const, id: null, name: 'Guest' };

  useEffect(() => {
    void recordActivity({
      eventType: 'page_view',
      path: location.pathname,
      actor,
    });
  }, [location.pathname, currentAdmin?.id, currentPlayer?.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void recordActivity({
        eventType: 'heartbeat',
        path: window.location.pathname,
        actor,
      });
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [currentAdmin?.id, currentPlayer?.id]);

  // Keep the session identifier initialized for the lifetime of this tab.
  useEffect(() => { getActivitySessionId(); }, []);

  return null;
};

export default function App() {
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RealtimeDataProvider>
              <BrowserRouter>
                <WebsiteActivityTracker />
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
                  {/* Top Navigation Bar */}
                  <Header onOpenDbSettings={() => setIsDbSettingsOpen(true)} />

                  {/* Main Content Area */}
                  <main className="flex-1">
                    <Routes>
                      {/* Default redirect to Community Chat */}
                      <Route path="/" element={<Navigate to="/chat" replace />} />

                      {/* Player Portal Screens */}
                      <Route path="/player/login" element={<PlayerPortalLoginPage />} />
                      <Route element={<PlayerPortalGuard />}>
                        <Route path="/chat" element={<CommunityChatPage />} />
                        <Route path="/announcements" element={<AnnouncementsPage />} />
                        <Route path="/directory" element={<DirectoryPage />} />
                        <Route path="/fund" element={<MonthlyFundPage />} />
                        <Route path="/fund/:month" element={<MonthlyFundPage />} />
                        <Route path="/baddi" element={<BaddiChittiPage />} />
                        <Route path="/report" element={<CumulativeReportPage />} />
                      </Route>

                      {/* Admin Authentication */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />

                      {/* Protected Admin Panel */}
                      <Route element={<AdminGuard />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/collect" element={<AdminCollectPage />} />
                        <Route path="/admin/collect/:month" element={<AdminCollectPage />} />
                        <Route path="/admin/baddi" element={<AdminBaddiPage />} />
                        <Route path="/admin/players" element={<AdminPlayersPage />} />
                        <Route path="/admin/admins" element={<AdminManagePage />} />
                        <Route path="/admin/rules" element={<AdminRulesPage />} />
                        <Route path="/admin/activity" element={<AdminActivityPage />} />
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/chat" replace />} />
                    </Routes>
                  </main>

                  {/* Mobile Fixed Bottom Nav */}
                  <BottomNav />

                  {/* Database / Supabase Connection Modal */}
                  <DatabaseSettingsModal
                    isOpen={isDbSettingsOpen}
                    onClose={() => setIsDbSettingsOpen(false)}
                  />
                </div>
              </BrowserRouter>
            </RealtimeDataProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
