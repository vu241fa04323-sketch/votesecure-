import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Vote,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  History,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { electionService } from '../../services/electionService';
import { votingService } from '../../services/votingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoterData = async () => {
      try {
        setLoading(true);
        const [elecRes, histRes] = await Promise.all([
          electionService.getAll(),
          votingService.getStatus(),
        ]);
        if (elecRes.success) {
          setElections(elecRes.elections);
        }
        if (histRes.success) {
          setHistory(histRes.history);
        }
      } catch (err) {
        console.error('Failed to load voter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVoterData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your voter portal..." />;
  }

  const activeElections = elections.filter((e) => e.status === 'Active');
  const upcomingElections = elections.filter((e) => e.status === 'Upcoming');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-brand-300" />
            <span>Authenticated Voter Session</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome, {user?.fullName}!
          </h1>
          <p className="text-brand-100 text-sm mt-2 max-w-xl leading-relaxed">
            Your voter account is verified. Review active elections below and exercise your constitutional voting franchise with guaranteed secrecy.
          </p>
        </div>

        {/* Voter Quick Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[200px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">
            Voter Identifier
          </p>
          <p className="text-xl font-mono font-extrabold text-white tracking-wider">
            {user?.userId}
          </p>
          <span className="inline-flex items-center space-x-1 mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Eligible & Active</span>
          </span>
        </div>
      </div>

      {/* Voter Profile Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Registration No</p>
          <p className="text-sm font-mono font-bold text-slate-800 mt-1">
            {user?.registrationNumber}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
          <p className="text-sm font-bold text-slate-800 mt-1 truncate">{user?.department}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Class / Year</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{user?.year}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ballots Cast</p>
          <p className="text-sm font-bold text-brand-600 mt-1">{history.length} Positions</p>
        </div>
      </div>

      {/* Active Elections Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Elections Open for Voting</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live polls currently accepting voter ballot submissions
            </p>
          </div>

          <Link
            to="/voter/elections"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>View All Elections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeElections.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Vote className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Active Elections Right Now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no polls currently accepting votes. Check scheduled upcoming elections below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeElections.map((elec) => {
              const hasVotedAll = elec.hasUserVotedAllPosts;
              return (
                <div
                  key={elec._id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        Active Poll
                      </span>

                      {hasVotedAll && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-brand-700 border border-blue-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-brand-600" />
                          <span>All Positions Voted</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                      {elec.electionName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {elec.description}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-600 border border-slate-100 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          <span>Voting Period:</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {elec.startDate} to {elec.endDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Daily Window:</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {elec.startTime} - {elec.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/voter/vote/${elec._id}`}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center space-x-2 transition-all shadow-sm ${
                      hasVotedAll
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                    }`}
                  >
                    <Vote className="w-4 h-4" />
                    <span>{hasVotedAll ? 'Review Voted Ballots' : 'Enter Voting Booth'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Elections or History preview */}
      {upcomingElections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Upcoming Scheduled Elections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingElections.map((elec) => (
              <div
                key={elec._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm"
              >
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                  Scheduled
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug mb-1">
                  {elec.electionName}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{elec.description}</p>
                <div className="text-[11px] text-slate-400 font-medium">
                  Opens on: <strong className="text-slate-700">{elec.startDate}</strong> at{' '}
                  <strong className="text-slate-700">{elec.startTime}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;
