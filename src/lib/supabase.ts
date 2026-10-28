/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Supabase client initialization.
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment variables,
 * with optional localStorage override for interactive testing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local overrides
const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('kmpl_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('kmpl_supabase_key') : null;

  const defaultUrl = 'https://kcykgmlwsxoddxhurosp.supabase.co';
  const defaultKey = 'sb_publishable_rQCSjezgp7VxiinQjDbMPg_BtBTBFqW';

  const url = (localUrl && localUrl.trim().length > 0) 
    ? localUrl.trim() 
    : (envUrl && envUrl.trim().length > 0 ? envUrl.trim() : defaultUrl);
  const key = (localKey && localKey.trim().length > 0) 
    ? localKey.trim() 
    : (envKey && envKey.trim().length > 0 ? envKey.trim() : defaultKey);

  const isValid = Boolean(
    url && 
    key && 
    !url.includes('your-project') && 
    url.startsWith('https://')
  );

  return { url, key, isValid };
};

const credentials = getSupabaseCredentials();

export const isSupabaseConfigured = credentials.isValid;
export const currentSupabaseUrl = credentials.url;

// Export Supabase client (or a dummy client if not configured yet)
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(credentials.url, credentials.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://mock-kmpl-cricket.supabase.co', 'mock-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

/**
 * Update and persist custom Supabase credentials directly from the UI.
 */
export const updateSupabaseCredentials = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('kmpl_supabase_url', url.trim());
    localStorage.setItem('kmpl_supabase_key', key.trim());
  } else {
    localStorage.removeItem('kmpl_supabase_url');
    localStorage.removeItem('kmpl_supabase_key');
  }
  window.location.reload();
};
