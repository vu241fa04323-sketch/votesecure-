import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Vote,
  Users,
  CheckCircle,
  BarChart3,
  Layers,
  ArrowRight,
  UserCheck,
  Server,
  Database,
  Key,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Vote<span className="text-brand-400">Secure</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/voter/login"
              className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
            >
              Voter Portal
            </Link>
            <Link
              to="/admin/login"
              className="px-5 py-2.5 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-8">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>MERN Stack Online Voting Management System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Institutional Balloting with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-300 to-indigo-400">
              Guaranteed Secret Privacy
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, role-governed online election management platform designed for academic institutions, unions, and governance boards. Built on the genuine MERN stack with zero public voter self-registration.
          </p>

          {/* Dual Action Cards */}
          <div className="mt-12 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Voter Portal Card */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-left hover:border-brand-500/60 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voter Portal</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Log in with the User ID and secure password issued by your administrator to review candidates and cast your ballot.
              </p>
              <Link
                to="/voter/login"
                className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all"
              >
                <span>Enter Voter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Admin Portal Card */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-left hover:border-indigo-500/60 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Administrator Console</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Full administrative authority over voter accounts, candidate rosters, elections lifecycle, and cryptographic audit reports.
              </p>
              <Link
                to="/admin/login"
                className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all border border-slate-600"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-20 bg-slate-900/80 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">
              System Architecture & Integrity
            </h2>
            <p className="text-3xl font-extrabold text-white">
              Engineered with Security at Every Layer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Voter Self-Registration</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                To prevent voter roll manipulation and sybil attacks, only the administrator has permission to provision voter accounts with pre-hashed credentials.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Decoupled Secret Ballots</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ballot selections are stored completely anonymized in a separate collection from participation records, guaranteeing complete privacy even from system admins.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Database Concurrency Guards</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enforced with compound unique indexes in MongoDB, preventing any voter from casting more than one ballot per position even during concurrent browser requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>VoteSecure &bull; MERN Stack Online Voting Management System &bull; Academic Training Project</p>
      </footer>
    </div>
  );
};

export default LandingPage;
