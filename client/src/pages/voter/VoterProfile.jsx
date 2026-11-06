import React from 'react';
import { User, ShieldCheck, Mail, Phone, BookOpen, Calendar, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VoterProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center font-extrabold text-3xl text-slate-700 shadow-md">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'V'
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.fullName}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Voter
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Permanent User ID: <strong className="text-brand-600">{user?.userId}</strong>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Registration Number: <strong className="text-slate-700">{user?.registrationNumber}</strong>
            </p>
          </div>
        </div>

        {/* Profile details grid */}
        <div className="pt-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Voter Credentials & Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <Mail className="w-4 h-4 text-brand-600" />
                <span>Official Email</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{user?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Academic Department</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{user?.department}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Academic Year / Class</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{user?.year}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Account Status</span>
              </div>
              <p className="font-bold text-emerald-600 text-sm">{user?.status || 'Active'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
            <strong>Security & Privacy Information:</strong> Voter credentials are created and managed strictly by institutional administrators. If you require credentials update or password assistance, please contact your administrative coordinator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterProfile;
