import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  Trophy,
  Users,
  Vote,
  Percent,
  EyeOff,
  AlertCircle,
  Award,
} from 'lucide-react';
import { resultService } from '../../services/resultService';
import { electionService } from '../../services/electionService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const VoterResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [resultData, setResultData] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchElections = async () => {
    try {
      const res = await electionService.getAll();
      if (res.success && res.elections.length > 0) {
        setElections(res.elections);
        setSelectedElectionId(res.elections[0]._id);
      }
    } catch (err) {
      showToast('Failed to load elections.', 'error');
    }
  };

  const fetchResults = useCallback(async () => {
    if (!selectedElectionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setIsRestricted(false);
      const res = await resultService.getElectionResults(selectedElectionId);
      if (res.success) {
        setResultData(res.results);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsRestricted(true);
        setResultData(null);
      } else {
        showToast(err.response?.data?.message || 'Failed to load results.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, showToast]);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchResults();
    }
  }, [selectedElectionId, fetchResults]);

  const activeElection = elections.find((e) => e._id === selectedElectionId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Election Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Certified Election Results</h2>
          <p className="text-sm text-slate-500">
            Official outcomes released by the institutional administrator
          </p>
        </div>

        <select
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {elections.map((elec) => (
            <option key={elec._id} value={elec._id}>
              {elec.electionName} ({elec.status})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Checking released election results..." />
      ) : isRestricted ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Results Not Yet Released</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            The administrator has not yet published the official results for{' '}
            <strong className="text-slate-700">{activeElection?.electionName}</strong>. Results will be accessible to voters once polls have closed and audits are complete.
          </p>
        </div>
      ) : !resultData ? (
        <EmptyState
          icon={BarChart3}
          title="No Results Found"
          description="Select an election to check outcomes."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Turnout metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Ballots Cast</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
                {resultData.totalVotesCast}
              </h4>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Turnout Rate</p>
              <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {resultData.turnoutPercentage}%
              </h4>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Positions Contested</p>
              <h4 className="text-2xl font-extrabold text-brand-600 mt-1">
                {resultData.posts?.length || 0}
              </h4>
            </div>
          </div>

          {/* Post by post winner view */}
          {resultData.posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                    Contested Post
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{post.postName}</h3>
                </div>

                {post.winners && post.winners.length > 0 && (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>Winner: {post.winners.map((w) => w.candidateName).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Candidates list in post */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.candidates.map((cand) => {
                  const isWinner = post.winners.some(
                    (w) => w.candidateId.toString() === cand.candidateId.toString()
                  );

                  return (
                    <div
                      key={cand.candidateId}
                      className={`rounded-2xl p-4 border transition-all ${
                        isWinner
                          ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
                          {cand.photo ? (
                            <img
                              src={cand.photo}
                              alt={cand.candidateName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            cand.candidateName.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {cand.candidateName}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ID: {cand.candidateCustomId}
                          </p>
                        </div>
                        {isWinner && <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Votes:</span>
                          <span className="text-slate-900">{cand.votesReceived}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Vote Share:</span>
                          <span className="text-brand-600">{cand.votePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              isWinner ? 'bg-amber-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${cand.votePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoterResults;
