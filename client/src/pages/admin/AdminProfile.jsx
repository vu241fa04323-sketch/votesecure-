import React from 'react';
import { UserCheck, ShieldCheck, Mail, Key, Server, Database, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/20">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
            <p className="text-sm text-brand-600 font-semibold">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white mt-1">
              Super Administrator
            </span>
          </div>
        </div>

        <div className="pt-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System & Security Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                <Lock className="w-4 h-4 text-brand-600" />
                <span>Authentication Method</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">JSON Web Token (JWT) + bcryptjs</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Database Engine</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">MongoDB Atlas / Mongoose ODM</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Ballot Privacy Architecture</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">Decoupled Secret Balloting</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                <Server className="w-4 h-4 text-amber-600" />
                <span>Runtime Environment</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">Node.js Express REST API</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
            <strong>Administrator Authority Reminder:</strong> Administrators can provision voter accounts, register candidate details, and publish/unpublish election outcomes. In compliance with democratic balloting standards, individual voting choices are strictly confidential and inaccessible.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
