/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Application Component for KMPL Cricket.
 * Configures ErrorBoundary, React Router, bilingual localization, Supabase auth providers,
 * unified single-instance RealtimeDataProvider, top navigation bar, and mobile thumb bottom bar.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeDataProvider } from './hooks/useRealtimeData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { AdminGuard } from './components/AdminGuard';

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

export default function App() {
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RealtimeDataProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
                  {/* Top Navigation Bar */}
                  <Header onOpenDbSettings={() => setIsDbSettingsOpen(true)} />

                  {/* Main Content Area */}
                  <main className="flex-1">
                    <Routes>
                      {/* Default redirect to Community Chat */}
                      <Route path="/" element={<Navigate to="/chat" replace />} />

                      {/* Player Portal Screens */}
                      <Route path="/chat" element={<CommunityChatPage />} />
                      <Route path="/announcements" element={<AnnouncementsPage />} />
                      <Route path="/directory" element={<DirectoryPage />} />
                      <Route path="/fund" element={<MonthlyFundPage />} />
                      <Route path="/fund/:month" element={<MonthlyFundPage />} />
                      <Route path="/baddi" element={<BaddiChittiPage />} />
                      <Route path="/report" element={<CumulativeReportPage />} />

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
