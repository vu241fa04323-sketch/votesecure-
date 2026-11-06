import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Vote, Lock, User, ArrowLeft, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const VoterLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.voterLogin({ userId, password });
      if (response.success) {
        login(response.token, response.user);
        showToast(`Welcome, ${response.user.fullName}!`, 'success');
        navigate('/voter/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Invalid User ID or Password. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUserId('VOTER202601');
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-800 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-4">
            <Vote className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Voter Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with the User ID and Password issued by your administrator
          </p>
        </div>

        {/* Institutional notice about no self-registration */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start space-x-3">
          <Info className="w-5 h-5 flex-shrink-0 text-brand-600 mt-0.5" />
          <div className="leading-relaxed font-medium">
            <span className="font-bold">Institutional Security Notice:</span> Self-registration is strictly disabled to guarantee election roll integrity. If you do not have credentials, please contact your administrator.
          </div>
        </div>

        <div className="mt-6 bg-white border border-slate-200/80 py-8 px-6 sm:px-10 rounded-3xl shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Assigned User ID / Voter ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                  placeholder="e.g. VOTER202601"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Secret Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Enter Voting Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center space-x-2 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Fill Sample Test Voter Credentials</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          VoteSecure End-to-End Secret Balloting
        </div>
      </div>
    </div>
  );
};

export default VoterLogin;
