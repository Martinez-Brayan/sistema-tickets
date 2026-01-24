import { createClient } from '@supabase/supabase-js'

// Estas variables vienen de tu archivo .env
const urlSupabase = process.env.REACT_APP_API_URL
const llaveAnonima = process.env.REACT_APP_SUPABASE_ANON_KEY

// Creamos y exportamos el cliente
export const supabase = createClient(urlSupabase, llaveAnonima)