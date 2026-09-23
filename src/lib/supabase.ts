import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hfudrcblblrzklklqoae.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdWRyY2JsYmxyemtsa2xxb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTQ5MTQsImV4cCI6MjA5ODU3MDkxNH0.mi3FYrZepsdLGpPFPikEghuwBxoQW-AP531nSXMypzU';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
