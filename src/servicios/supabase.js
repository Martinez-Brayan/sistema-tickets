import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxepqumrpykhvjtrsjsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZXBxdW1ycHlraHZqdHJzanN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDk1NjEsImV4cCI6MjA4Mzg4NTU2MX0.ma9S9Sgx_XLJXCxbVtPgcbPS09yV8sjPNyMCAWXOzMk';

export const supabase = createClient(supabaseUrl, supabaseKey);