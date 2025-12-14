// src/layouts/RootLayout.jsx

import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, ClipboardList } from "lucide-react";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER / NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/" className="text-2xl font-bold text-indigo-600">
              GudangSoal
            </NavLink>
            <nav className="flex space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Home className="w-5 h-5 mr-1" />
                Bank Soal
              </NavLink>
              {/* Link contoh ke soal pertama di DB (IDnya akan otomatis disesuaikan) */}
              <NavLink
                to="/soal/test-id-1"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <ClipboardList className="w-5 h-5 mr-1" />
                Coba Soal (Placeholder)
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} GudangSoal Builder MVP.
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
