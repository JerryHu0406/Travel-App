
import { createClient } from '@supabase/supabase-js';

// TODO: In a real production app, these should be in .env files
// But for this simple local setup as requested by user, we'll put them here or use a placeholder.
// The user provided these directly in chat.

const supabaseUrl = 'https://jmbtkhqismefkonrgypv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptYnRraHFpc21lZmtvbnJneXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDUwMTcsImV4cCI6MjA4NjEyMTAxN30.izEC0l1_M2lyLwlPhR6LqQSW-x-R9Bis9LMCkyS9hBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
