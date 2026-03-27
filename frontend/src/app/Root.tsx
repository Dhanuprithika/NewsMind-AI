import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { UserProvider } from './hooks/UserContext';

export function Root() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-[#faf8f4]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-[#1a1a2e] text-gray-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-xl text-white"
                >
                  My<span className="text-[#c0392b]">ET</span>
                </span>
                <span className="text-sm text-gray-500">— The Personalized Newsroom</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
              <p className="text-xs text-gray-600">
                © 2026 My ET. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </UserProvider>
  );
}
