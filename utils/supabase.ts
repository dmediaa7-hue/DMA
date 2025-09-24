import { createClient } from '@supabase/supabase-js';

// --- Supabase Connection ---
// This file sets up the connection to your Supabase project.
// The URL is derived from the connection string you provided.

const supabaseUrl = 'https://wfcncxguaxgafddpkmtv.supabase.co';

// IMPORTANT: Replace this with your actual Supabase PUBLIC ANON KEY.
// You can find this in your Supabase project's API settings.
//
// SECURITY WARNING:
// The password from your connection string ([Dma@arsumo7]) is a database password
// and should NEVER be used in frontend code. It provides direct, unrestricted access
// to your database and would be a major security risk if exposed.
//
// Always use the public 'anon' key for client-side applications.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmY25jeGd1YXhnYWZkZHBrbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDg3NTAsImV4cCI6MjA3NDIyNDc1MH0.JlH8ipt1hxtWugXSvzx-onFfmYezQUHdEjCVTvURDXo';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * --- HOW TO USE ---
 *
 * You can now import the `supabase` client in your `utils/api.ts` file
 * to replace the localStorage logic with real database calls.
 *
 * Example: Fetching all members
 *
 * import { supabase } from './supabase';
 *
 * export const getAllMembers = async () => {
 *   const { data, error } = await supabase
 *     .from('members') // Assuming you have a 'members' table
 *     .select('*');
 *
 *   if (error) {
 *     console.error('Error fetching members:', error);
 *     return [];
 *   }
 *
 *   return data;
 * };
 *
 */