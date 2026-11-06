import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Trophy,
  Users,
  Vote,
  Percent,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { resultService } from '../../services/resultService';
import { electionService } from '../../services/electionService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const ResultsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(initialElectionId);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  const { showToast } = useToast();

  const fetchElections = async () => {
    try {
      const res = await electionService.getAll();
      if (res.success && res.elections.length > 0) {
        setElections(res.elections);
        if (!selectedElectionId) {
          setSelectedElectionId(res.elections[0]._id);
        }
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
      const res = await resultService.getElectionResults(selectedElectionId);
      if (res.success) {
        setResultData(res.results);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load election results.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, showToast]);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      setSearchParams({ electionId: selectedElectionId });
      fetchResults();
    }
  }, [selectedElectionId, fetchResults, setSearchParams]);

  const handleTogglePublish = async () => {
    if (!resultData?.election?.id) return;
    try {
      setTogglingPublish(true);
      const newStatus = !resultData.election.resultsPublished;
      const res = await electionService.update(resultData.election.id, {
        resultsPublished: newStatus,
      });
      if (res.success) {
        showToast(
          newStatus
            ? 'Results released! Voters can now inspect these outcomes.'
            : 'Results hidden from voter access.',
          'success'
        );
        setResultData((prev) => ({
          ...prev,
          election: { ...prev.election, resultsPublished: newStatus },
        }));
      }
    } catch (err) {
      showToast('Failed to update result release policy.', 'error');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedElectionId) return;
    try {
      setExporting(true);
      const blobData = await resultService.exportCSV(selectedElectionId);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `votesecure_results_${resultData?.election?.electionName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'report'}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Official result CSV report downloaded!', 'success');
    } catch (err) {
      showToast('Failed to export CSV report.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Election Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Election Results & Audit Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Certified tallies, turnout percentages, and anonymized secret-ballot audits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Election Picker */}
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

          {/* Toggle Publish to Voters */}
          {resultData && (
            <button
              onClick={handleTogglePublish}
              disabled={togglingPublish}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                resultData.election.resultsPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {resultData.election.resultsPublished ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Public to Voters (Live)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hidden from Voters</span>
                </>
              )}
            </button>
          )}

          {/* CSV Download Button */}
          {resultData && (
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Download CSV Report'}</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Computing election results and candidate tallies..." />
      ) : !resultData ? (
        <EmptyState
          icon={BarChart3}
          title="No Results To Display"
          description="Select an election with recorded posts to review vote tallies."
        />
      ) : (
        <div className="space-y-8">
          {/* Key Aggregate Turnout Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Eligible Voters
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900">
                {resultData.totalEligibleVoters}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Active voter accounts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Turnout Voters
              </p>
              <h4 className="text-3xl font-extrabold text-brand-600">
                {resultData.participatingVoterCount}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Exercised franchise</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Turnout Percentage
              </p>
              <h4 className="text-3xl font-extrabold text-emerald-600">
                {resultData.turnoutPercentage}%
              </h4>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, resultData.turnoutPercentage)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Ballots Recorded
              </p>
              <h4 className="text-3xl font-extrabold text-purple-600">
                {resultData.totalVotesCast}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Across all positions</p>
            </div>
          </div>

          {/* Privacy & Secret Ballot Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <span>
                <strong>Cryptographic Privacy Guarantee:</strong> These metrics reflect aggregated anonymous ballot tallies. Individual voter selections remain cryptographically decoupled and secret from all administrative accounts.
              </span>
            </div>
          </div>

          {/* Post-by-Post Results Section */}
          <div className="space-y-8">
            {resultData.posts.map((post, idx) => {
              const barChartData = post.candidates.map((cand) => ({
                name: cand.candidateName,
                votes: cand.votesReceived,
                percentage: cand.votePercentage,
              }));

              const pieChartData = post.candidates
                .filter((c) => c.votesReceived > 0)
                .map((cand, i) => ({
                  name: cand.candidateName,
                  value: cand.votesReceived,
                  color: COLORS[i % COLORS.length],
                }));

              return (
                <div
                  key={post.postId}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
                >
                  {/* Post Header & Winner Callout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                        Contested Position
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1.5">{post.postName}</h3>
                      <p className="text-xs text-slate-500">
                        Total ballots cast for this post: <strong className="text-slate-800">{post.totalPostVotes}</strong>
                      </p>
                    </div>

                    {/* Winner Badge Callout */}
                    {post.winners && post.winners.length > 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                          <Trophy className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {post.isTie ? 'Tie Declared' : 'Elected Winner'}
                          </p>
                          <p className="text-base font-extrabold text-amber-950">
                            {post.winners.map((w) => w.candidateName).join(' & ')}
                          </p>
                          <p className="text-xs font-semibold text-amber-800">
                            {post.winners[0]?.votesReceived} Votes (
                            {post.totalPostVotes > 0
                              ? ((post.winners[0]?.votesReceived / post.totalPostVotes) * 100).toFixed(1)
                              : 0}
                            %)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-500">
                        No votes recorded yet for this post
                      </div>
                    )}
                  </div>

                  {/* Visual Analytics Charts for this post */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        Candidate Vote Comparison (Tallies)
                      </h4>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '12px',
                              }}
                            />
                            <Bar dataKey="votes" fill="#0284c7" radius={[8, 8, 0, 0]} name="Votes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Vote Share %
                      </h4>
                      <div className="h-48 w-full flex items-center justify-center">
                        {pieChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={65}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`pie-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1e293b',
                                  borderRadius: '12px',
                                  color: '#fff',
                                  fontSize: '12px',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-xs text-slate-400">No votes cast</p>
                        )}
                      </div>
                      <div className="text-center text-[11px] text-slate-400">
                        {post.totalPostVotes} total votes
                      </div>
                    </div>
                  </div>

                  {/* Candidate Table Details */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Candidate</th>
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Symbol</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4 text-center">Votes Received</th>
                          <th className="py-3 px-4">Percentage</th>
                          <th className="py-3 px-4 text-right">Standing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {post.candidates.map((cand, candIdx) => {
                          const isWinner = post.winners.some(
                            (w) => w.candidateId.toString() === cand.candidateId.toString()
                          );

                          return (
                            <tr
                              key={cand.candidateId}
                              className={`transition-colors ${
                                isWinner ? 'bg-amber-50/40 font-semibold' : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0">
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
                                  <span className="font-bold text-slate-900">
                                    {cand.candidateName}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">
                                {cand.candidateCustomId}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center">
                                  {cand.symbol ? (
                                    <img
                                      src={cand.symbol}
                                      alt="Symbol"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-400">SYM</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-xs text-slate-500">
                                {cand.department || 'N/A'}
                              </td>

                              <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 text-base">
                                {cand.votesReceived}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-brand-500 h-2 rounded-full"
                                      style={{ width: `${cand.votePercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">
                                    {cand.votePercentage}%
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {isWinner ? (
                                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Winner</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">
                                    #{candIdx + 1}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
