import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uapwmxthjujlheiqhcpd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcHdteHRoanVqbGhlaXFoY3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTcyNzIsImV4cCI6MjA4NzEzMzI3Mn0.Cm_sP-c4zLVyRxq9hnVD5vsosDUFC7VK2hnOOfUBsOs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
