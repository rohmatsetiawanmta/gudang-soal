// src/pages/Home/HomePage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { FileText, Filter, Loader2, BookOpen, Layers } from "lucide-react";
import {
  fetchGradeSubjects,
  fetchChapters,
  fetchSubchapters,
  fetchQuestions,
} from "../../services/dataService";

const DIFFICULTIES = [
  { value: "all", label: "Semua Tingkat" },
  { value: "mudah", label: "Mudah" },
  { value: "sedang", label: "Sedang" },
  { value: "sulit", label: "Sulit" },
];

const HomePage = () => {
  // --- 1. STATE UNTUK DATA FILTER ---
  const [gradeSubjects, setGradeSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [subchapters, setSubchapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  // --- 2. STATE UNTUK FILTER PILIHAN SISWA ---
  const [selectedGradeSubjectId, setSelectedGradeSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedSubchapterId, setSelectedSubchapterId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // --- 3. STATE UNTUK LOADING & ERROR ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 4. DATA FETCHING DENGAN useEffect (CASCADING FETCHING) ---

  // 4a. Fetch Grade Subjects (on mount)
  useEffect(() => {
    async function loadGradeSubjects() {
      setIsLoading(true);
      try {
        const data = await fetchGradeSubjects();
        setGradeSubjects(data);
        if (data.length > 0) {
          setSelectedGradeSubjectId(data[0].id);
        }
      } catch (err) {
        setError("Gagal memuat Unit Kurikulum. Cek koneksi Supabase & RLS.");
      } finally {
        setIsLoading(false);
      }
    }
    loadGradeSubjects();
  }, []);

  // 4b. Fetch Chapters (Ketika Grade Subject berubah)
  useEffect(() => {
    if (!selectedGradeSubjectId) {
      setChapters([]);
      setSelectedChapterId("");
      return;
    }

    async function loadChapters() {
      // Tidak perlu set loading karena cascading harus cepat
      const data = await fetchChapters(selectedGradeSubjectId);
      setChapters(data);
      setSelectedChapterId(data.length > 0 ? data[0].id : "");
    }
    loadChapters();
  }, [selectedGradeSubjectId]);

  // 4c. Fetch Subchapters (Ketika Chapter berubah)
  useEffect(() => {
    if (!selectedChapterId) {
      setSubchapters([]);
      setSelectedSubchapterId("");
      return;
    }

    async function loadSubchapters() {
      const data = await fetchSubchapters(selectedChapterId);
      setSubchapters(data);
      setSelectedSubchapterId(data.length > 0 ? data[0].id : "");
    }
    loadSubchapters();
  }, [selectedChapterId]);

  // 4d. Fetch Questions (Ketika Subchapter atau Difficulty berubah)
  useEffect(() => {
    if (!selectedSubchapterId) {
      setQuestions([]);
      return;
    }

    async function loadQuestions() {
      setIsLoading(true);
      try {
        const data = await fetchQuestions(
          selectedSubchapterId,
          selectedDifficulty
        );
        setQuestions(data);
      } catch (err) {
        setError("Gagal memuat soal. Cek RLS tabel 'questions' & data Subbab.");
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [selectedSubchapterId, selectedDifficulty]);

  // --- 5. RENDER UI ---

  const currentUnit = useMemo(() => {
    return gradeSubjects.find((gs) => gs.id === selectedGradeSubjectId);
  }, [selectedGradeSubjectId, gradeSubjects]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
        <FileText className="w-8 h-8 mr-3 text-indigo-600" />
        {currentUnit
          ? `${currentUnit.subjectName} ${currentUnit.gradeName}`
          : "Bank Soal GudangSoal"}
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Filter soal berdasarkan hierarki konten (Bab, Subbab) dan tingkat
        kesulitan.
      </p>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-700">
          <Filter className="w-5 h-5 mr-2" />
          Filter Konten (MVP)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Grade Subject Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center">
              <Layers className="w-4 h-4 mr-1" /> Unit Kurikulum
            </label>
            <select
              value={selectedGradeSubjectId}
              onChange={(e) => setSelectedGradeSubjectId(e.target.value)}
              disabled={isLoading || gradeSubjects.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {gradeSubjects.map((gs) => (
                <option key={gs.id} value={gs.id}>
                  {gs.subjectName} {gs.gradeName}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chapter Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center">
              <BookOpen className="w-4 h-4 mr-1" /> Bab
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={isLoading || chapters.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  Bab {c.chapter_number}: {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Subchapter Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center">
              <Layers className="w-4 h-4 mr-1" /> Subbab
            </label>
            <select
              value={selectedSubchapterId}
              onChange={(e) => setSelectedSubchapterId(e.target.value)}
              disabled={isLoading || subchapters.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {subchapters.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Difficulty Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center">
              <Layers className="w-4 h-4 mr-1" /> Kesulitan
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              disabled={isLoading}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DAFTAR SOAL SECTION */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Daftar Soal ({questions.length} Ditemukan)
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
            <span className="text-indigo-600">Memuat soal...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && questions.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg shadow-inner">
            <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              Tidak ada soal ditemukan
            </h3>
            <p className="text-sm text-gray-500">
              Silakan ganti Bab, Subbab, atau tingkat kesulitan untuk mencari
              soal.
            </p>
          </div>
        )}

        {/* List Soal */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <NavLink
              key={q.id}
              to={`/soal/${q.id}`}
              className="block p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-indigo-50 transition duration-150"
            >
              <p className="text-lg font-semibold text-gray-800">
                Soal #{index + 1}: {q.subchapters.title}
              </p>
              <span
                className={`text-sm font-medium capitalize 
                        ${
                          q.difficulty === "mudah"
                            ? "text-green-600"
                            : q.difficulty === "sedang"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
              >
                {q.difficulty}
              </span>
              <p className="mt-2 text-gray-600 line-clamp-2">
                {/* Tampilkan 100 karakter pertama soal */}
                {q.text.substring(0, 100)}... (Klik untuk lihat detail)
              </p>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
