// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Layout.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col transition-colors duration-300">
      <Header />

      {/* Page Content */}
      <main className="flex-1 w-full flex flex-col pt-0">
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
}

