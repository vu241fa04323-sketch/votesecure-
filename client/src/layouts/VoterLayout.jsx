import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock } from 'lucide-react';

const VoterLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 text-slate-600 font-medium">
            <Lock className="w-3.5 h-3.5 text-brand-600" />
            <span>End-to-End Secret Balloting Protocol &bull; Anonymous Ballot Verification</span>
          </div>
          <p className="text-slate-400">
            VoteSecure MERN Stack Training Project &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VoterLayout;
