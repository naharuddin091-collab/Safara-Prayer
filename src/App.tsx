import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ToastContainer';
import { HomePage } from '@/pages/HomePage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-[#FDFBF8] text-[#231F1D]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/track" element={<TrackOrderPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
