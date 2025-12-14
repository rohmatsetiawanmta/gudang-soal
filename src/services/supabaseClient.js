// src/services/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

// Ambil kredensial dari environment variables yang sudah diset di .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) are not set."
  );
}

// Inisialisasi Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ekspor tabel names agar konsisten saat digunakan di service lain
export const TABLE_NAMES = {
  GRADES: "grades",
  SUBJECTS: "subjects",
  GRADE_SUBJECTS: "grade_subjects",
  CHAPTERS: "chapters",
  SUBCHAPTERS: "subchapters",
  QUESTIONS: "questions",
};
