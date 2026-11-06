import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Simple title mapper based on pathname
  const getPageTitle = (path) => {
    if (path.includes('/admin/dashboard')) return 'System Dashboard';
    if (path.includes('/admin/voters/new')) return 'Add New Voter';
    if (path.includes('/admin/voters')) return 'Voter Registry Management';
    if (path.includes('/admin/elections/new')) return 'Create Election';
    if (path.includes('/admin/elections')) return 'Election Management';
    if (path.includes('/admin/posts')) return 'Position & Post Management';
    if (path.includes('/admin/candidates/new')) return 'Register New Candidate';
    if (path.includes('/admin/candidates')) return 'Candidate Roster Management';
    if (path.includes('/admin/results')) return 'Election Results & Audit';
    if (path.includes('/admin/profile')) return 'Administrator Profile';
    return 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                VoteSecure Administrator Control Console
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Backend Connected
            </div>

            <div className="flex items-center space-x-3 pl-2 sm:border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-slate-900">{user?.name}</span>
                <span className="block text-[11px] font-semibold text-brand-600">Super Admin</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
