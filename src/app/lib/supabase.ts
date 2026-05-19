import { createClient } from '@supabase/supabase-js';

// Puxa as chaves secretas que vamos configurar de forma segura na Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Cria e exporta o cliente oficial do Supabase para o resto do site utilizar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);