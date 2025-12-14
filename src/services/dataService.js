// src/services/dataService.js

import { supabase, TABLE_NAMES } from "./supabaseClient";

// Fetching Data Filter
export async function fetchGradeSubjects() {
  const { data, error } = await supabase.from(TABLE_NAMES.GRADE_SUBJECTS)
    .select(`
        id,
        grades (id, name, level_order),
        subjects (id, name)
    `);

  if (error) {
    console.error("Error fetching grade subjects:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    gradeName: item.grades.name,
    subjectName: item.subjects.name,
    levelOrder: item.grades.level_order,
  }));
}

export async function fetchChapters(gradeSubjectId) {
  const { data, error } = await supabase
    .from(TABLE_NAMES.CHAPTERS)
    .select("id, title, chapter_number")
    .eq("grade_subject_id", gradeSubjectId)
    .order("chapter_number", { ascending: true });

  if (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
  return data;
}

export async function fetchSubchapters(chapterId) {
  const { data, error } = await supabase
    .from(TABLE_NAMES.SUBCHAPTERS)
    .select("id, title, slug")
    .eq("chapter_id", chapterId);

  if (error) {
    console.error("Error fetching subchapters:", error);
    return [];
  }
  return data;
}

// Fetching Data Soal
export async function fetchQuestions(subchapterId, difficulty) {
  let query = supabase
    .from(TABLE_NAMES.QUESTIONS)
    .select(
      `
        id, 
        text, 
        difficulty, 
        subchapter_id,
        subchapters!inner(title, chapters!inner(title))
    `
    )
    .eq("subchapter_id", subchapterId);

  if (difficulty && difficulty !== "all") {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
  return data;
}

export async function fetchQuestionById(id) {
  const { data, error } = await supabase
    .from(TABLE_NAMES.QUESTIONS)
    .select(
      `
        id, 
        text, 
        difficulty, 
        options, 
        answer_key, 
        explanation,
        type,
        subchapters!inner(title, chapters!inner(title))
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching question:", error);
    return null;
  }
  return data;
}
