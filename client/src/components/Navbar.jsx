import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Vote,
  LayoutDashboard,
  History,
  BarChart2,
  User,
  LogOut,
  Menu,
  X,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/voter/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/voter/dashboard', icon: LayoutDashboard },
    { name: 'Active Elections', path: '/voter/elections', icon: Vote },
    { name: 'My Voting History', path: '/voter/history', icon: History },
    { name: 'Election Results', path: '/voter/results', icon: BarChart2 },
    { name: 'My Profile', path: '/voter/profile', icon: User },
  ];

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Vote<span className="text-brand-600">Secure</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Voter Portal
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Profile Info & Logout */}
          <div className="hidden md:flex items-center space-x-4 pl-4 border-l border-slate-200">
            <div className="flex items-center space-x-3 text-right">
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight flex items-center justify-end space-x-1">
                  <span>{user?.fullName || 'Active Voter'}</span>
                  <BadgeCheck className="w-4 h-4 text-emerald-500 inline" />
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  ID: <span className="text-brand-600 font-mono">{user?.userId}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.fullName?.charAt(0) || 'V'
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-3 pb-6 bg-white space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
              {user?.fullName?.charAt(0) || 'V'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">ID: {user?.userId}</p>
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-slate-500" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
