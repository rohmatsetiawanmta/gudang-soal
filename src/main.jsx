import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Import Layout dan Pages
import HomePage from "./pages/Home/HomePage";
import QuestionDetailPage from "./pages/Question/QuestionDetailPage";
import RootLayout from "./layouts/RootLayout";

// 1. Definisikan Struktur Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        // Rute untuk detail soal. ID soal akan diambil dari parameter ini.
        path: "soal/:questionId",
        element: <QuestionDetailPage />,
      },
      // Rute-rute lain di masa depan (e.g., /login, /profile)
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. Gunakan RouterProvider */}
    <RouterProvider router={router} />
  </StrictMode>
);
