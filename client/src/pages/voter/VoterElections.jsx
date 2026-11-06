import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Calendar, Clock, CheckCircle2, ArrowRight, BarChart3, AlertCircle } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const VoterElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  const { showToast } = useToast();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await electionService.getAll();
        if (res.success) {
          setElections(res.elections);
        }
      } catch (err) {
        showToast('Failed to load elections.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [showToast]);

  const filteredElections = elections.filter((e) => {
    if (tab === 'All') return true;
    return e.status === tab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Elections Directory</h2>
          <p className="text-sm text-slate-500">
            Browse all institutional elections, check status, and cast your votes
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          {['All', 'Active', 'Upcoming', 'Completed'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading elections..." />
      ) : filteredElections.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No Elections In This Category"
          description="There are no elections currently matching this status filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((elec) => {
            const isVoted = elec.hasUserVotedAllPosts;
            return (
              <div
                key={elec._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        elec.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : elec.status === 'Upcoming'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          elec.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {elec.status}
                    </span>

                    {isVoted && (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Voted
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                    {elec.electionName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {elec.description}
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 border border-slate-100 space-y-1 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="font-semibold">{elec.startDate} to {elec.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time:</span>
                      <span className="font-semibold">{elec.startTime} - {elec.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Positions:</span>
                      <span className="font-semibold">{elec.postCount || 0} contested posts</span>
                    </div>
                  </div>
                </div>

                <div>
                  {elec.status === 'Active' && (
                    <Link
                      to={`/voter/vote/${elec._id}`}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
                    >
                      <Vote className="w-4 h-4" />
                      <span>{isVoted ? 'Inspect Ballots Cast' : 'Vote In This Election'}</span>
                    </Link>
                  )}

                  {elec.status === 'Upcoming' && (
                    <div className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-center bg-slate-100 text-slate-500">
                      Voting Opens on {elec.startDate}
                    </div>
                  )}

                  {elec.status === 'Completed' && (
                    <Link
                      to="/voter/results"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
                    >
                      <BarChart3 className="w-4 h-4 text-brand-600" />
                      <span>View Certified Results</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VoterElections;
