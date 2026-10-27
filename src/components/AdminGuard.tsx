/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Route Guard.
 * Restricts access to authenticated users present in the `admins` table.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminGuard: React.FC = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
        <p className="text-xs font-semibold">Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
