// src/pages/Question/QuestionDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionById } from "../../services/dataService";
import { Loader2, CheckCircle, XCircle, BookOpen, Layers } from "lucide-react";

const QuestionDetailPage = () => {
  const { questionId } = useParams();

  // --- 1. STATE MANAGEMENT ---
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Jawaban yang Lebih Fleksibel:
  const [userAnswer, setUserAnswer] = useState("");

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    // Reset state saat ID berubah
    setUserAnswer(""); // Reset Jawaban
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setIsLoading(true);
    setError(null);

    async function loadQuestion() {
      try {
        const data = await fetchQuestionById(questionId);
        if (data) {
          setQuestion(data);
        } else {
          setError("Soal tidak ditemukan. Mungkin ID soal di URL tidak valid.");
        }
      } catch (err) {
        setError("Gagal memuat soal. Cek koneksi & ID soal.");
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestion();
  }, [questionId]);

  // --- 3. LOGIC HANDLERS ---

  const handleUserAnswerChange = (e) => {
    // Mencegah perubahan jika jawaban sudah dicek
    if (isAnswerChecked) return;

    // Untuk PG, kita ambil key-nya. Untuk Input, kita ambil value-nya.
    const value = e.target.value;
    setUserAnswer(value);
  };

  const handleCheckAnswer = () => {
    if (!userAnswer) {
      alert("Mohon masukkan atau pilih jawaban terlebih dahulu.");
      return;
    }

    // --- GRADING LOGIC BERDASARKAN TIPE SOAL ---
    let correct = false;
    let expectedAnswer = question.answer_key;
    let submittedAnswer = userAnswer;

    switch (question.type) {
      case "multiple_choice":
      case "true_false":
        // Cek PG sederhana
        correct = submittedAnswer === expectedAnswer;
        break;

      case "numerical_input":
        // Cek Isian Numerik: Parsing angka dan membandingkannya (dengan toleransi kecil)
        const numSubmitted = parseFloat(submittedAnswer);
        const numExpected = parseFloat(expectedAnswer);
        // Menggunakan toleransi kecil untuk float
        correct =
          !isNaN(numSubmitted) && Math.abs(numSubmitted - numExpected) < 1e-6;
        break;

      case "short_answer":
        // Cek Isian Singkat: Case-insensitive dan trim whitespace
        const normalizedSubmitted = submittedAnswer.toLowerCase().trim();
        const normalizedExpected = expectedAnswer.toLowerCase().trim();
        correct = normalizedSubmitted === normalizedExpected;
        break;

      default:
        console.warn(
          `Tipe soal ${question.type} belum didukung grading otomatis.`
        );
        correct = false;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true); // Memicu tampilan pembahasan dan hasil

    // TODO: Di Tahap 2, panggil dataService.saveUserProgress(questionId, submittedAnswer, correct);
  };

  // --- 4. RENDER INPUT BERDASARKAN TIPE SOAL ---
  const renderQuestionInput = () => {
    if (!question || isAnswerChecked) return null;

    if (
      question.type === "multiple_choice" ||
      question.type === "true_false" ||
      question.type === "multiple_answer"
    ) {
      // Tipe Soal Berbasis Opsi (PG, T/F, Multiple Correct)
      const isMultipleAnswer = question.type === "multiple_answer";

      return (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-600 mb-2">
            Pilih Jawaban Anda:
          </h3>
          {Array.isArray(question.options) &&
            question.options.map((option) => (
              <div
                key={option.key}
                className={getOptionStyle(option.key)}
                // Menggunakan onClick untuk mengelola state userAnswer
                onClick={() =>
                  handleUserAnswerChange({ target: { value: option.key } })
                }
              >
                <input
                  type={isMultipleAnswer ? "checkbox" : "radio"}
                  name="answer"
                  value={option.key}
                  checked={userAnswer === option.key} // Logic sederhana untuk PG/T/F
                  readOnly // Digantikan oleh onClick di div
                  className={`mr-3 ${
                    isMultipleAnswer ? "form-checkbox" : "form-radio"
                  } text-indigo-600 w-4 h-4`}
                />
                <span className="font-mono text-indigo-600 mr-2">
                  {option.key}.
                </span>
                <span className="text-gray-800">{option.text}</span>
              </div>
            ))}
        </div>
      );
    }

    if (
      question.type === "numerical_input" ||
      question.type === "short_answer"
    ) {
      // Tipe Soal Isian (Numerik/Singkat)
      const isNumeric = question.type === "numerical_input";

      return (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-600 mb-2">
            Jawab ({isNumeric ? "Hanya Angka/Desimal" : "Isian Singkat"}):
          </h3>
          <input
            type={isNumeric ? "number" : "text"}
            value={userAnswer}
            onChange={handleUserAnswerChange}
            placeholder={
              isNumeric ? "e.g., 0.04 atau 42" : "Masukkan jawaban Anda di sini"
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isAnswerChecked}
          />
        </div>
      );
    }

    return (
      <p className="text-red-500">
        Tipe soal tidak didukung: {question.type}
        {console.log("Tipe soal tidak didukung:", question)}
      </p>
    );
  };

  // Helper untuk menentukan style opsi PG/T/F
  const getOptionStyle = (key) => {
    let baseStyle =
      "flex items-center p-3 border rounded-lg cursor-pointer transition duration-150 ";

    if (isAnswerChecked) {
      // Jika sudah dicek:
      if (key === question.answer_key) {
        return (
          baseStyle +
          "bg-green-100 border-green-600 ring-2 ring-green-500 font-bold"
        );
      } else if (key === userAnswer) {
        return (
          baseStyle + "bg-red-100 border-red-600 ring-2 ring-red-500 font-bold"
        );
      }
      return baseStyle + "bg-white border-gray-300 cursor-default opacity-70";
    }

    // Jika belum dicek:
    if (key === userAnswer) {
      return (
        baseStyle + "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
      );
    } else {
      return baseStyle + "bg-white hover:bg-gray-50 border-gray-300";
    }
  };

  // --- 5. CONDITIONAL RENDERING UTAMA ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Memuat Soal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* JUDUL DAN KONTEKS SOAL */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Halaman Soal</h1>
      <div className="flex space-x-4 mb-6 text-sm text-gray-600">
        <p className="flex items-center">
          <Layers className="w-4 h-4 mr-1 text-indigo-500" />
          Bab: {question.subchapters.chapters.title}
        </p>
        <p className="flex items-center">
          <Layers className="w-4 h-4 mr-1 text-indigo-500" />
          Subbab: {question.subchapters.title}
        </p>
        <p className="flex items-center capitalize">
          <Layers className="w-4 h-4 mr-1 text-indigo-500" />
          Tipe: {question?.type?.replace("_", " ") || "Memuat Tipe..."}{" "}
        </p>
      </div>

      {/* BOX SOAL */}
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-blue-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Soal (ID: {question.id.substring(0, 8)}...)
        </h2>

        {/* Teks Soal */}
        <p className="text-gray-900 text-lg mb-6 leading-relaxed whitespace-pre-line">
          {question.text}
        </p>

        {/* INPUT JAWABAN (Rendered by Logic) */}
        {!isAnswerChecked && renderQuestionInput()}

        {/* AKSI: CEK JAWABAN */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!userAnswer}
              className={`w-full px-6 py-3 text-white font-bold rounded-lg shadow-md transition duration-300
                ${
                  userAnswer
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Cek Jawaban Otomatis
            </button>
          ) : (
            // Tampilan Hasil Setelah Dicek
            <div
              className={`p-4 rounded-lg font-bold text-center 
                ${
                  isCorrect
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-red-50 text-red-700 border border-red-300"
                }`}
            >
              {isCorrect ? (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Jawaban Anda Benar!
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Jawaban Anda Salah. Jawaban Benar adalah {question.answer_key}
                  .
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PEMBAHASAN RINGKAS (Hanya tampil setelah dicek) */}
      {isAnswerChecked && (
        <div className="mt-8 bg-yellow-50 p-6 rounded-xl shadow-lg border border-yellow-200">
          <h3 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Pembahasan Ringkas
          </h3>
          <p className="text-gray-800 whitespace-pre-line">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
