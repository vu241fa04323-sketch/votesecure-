import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Vote,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { resultService } from '../../services/resultService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await resultService.getAdminSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading dashboard statistics..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center space-x-3">
        <ShieldAlert className="w-6 h-6 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const { stats, electionsChart } = data || {};

  const statusPieData = [
    { name: 'Active', value: stats?.activeElections || 0, color: '#10b981' },
    { name: 'Upcoming', value: stats?.upcomingElections || 0, color: '#3b82f6' },
    { name: 'Completed', value: stats?.completedElections || 0, color: '#64748b' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
            System Operational
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Control Center
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Monitor voter turnouts, manage election lifecycles, and audit secure cryptographic ballots in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/voters/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Voter</span>
          </Link>
          <Link
            to="/admin/elections/new"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 border border-white/20 transition-all"
          >
            <Vote className="w-4 h-4" />
            <span>Create Election</span>
          </Link>
          <Link
            to="/admin/results"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Results</span>
          </Link>
        </div>
      </div>

      {/* 7 Core System Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Voters"
          value={stats?.totalVoters || 0}
          icon={Users}
          change={`${stats?.activeVoters || 0} Active / Eligible`}
          trend="up"
          color="brand"
        />
        <StatCard
          title="Total Candidates"
          value={stats?.totalCandidates || 0}
          icon={Award}
          change="Across all election posts"
          color="purple"
        />
        <StatCard
          title="Total Elections"
          value={stats?.totalElections || 0}
          icon={Vote}
          change={`${stats?.activeElections || 0} currently active`}
          color="amber"
        />
        <StatCard
          title="Total Ballots Cast"
          value={stats?.totalVotes || 0}
          icon={CheckCircle2}
          change="Anonymous ballots recorded"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Elections"
          value={stats?.activeElections || 0}
          icon={TrendingUp}
          change="Open for voter balloting"
          color="emerald"
        />
        <StatCard
          title="Completed Elections"
          value={stats?.completedElections || 0}
          icon={Clock}
          change="Concluded election polls"
          color="brand"
        />
        <StatCard
          title="Voter Participation Rate"
          value={`${stats?.voterParticipationPercentage || 0}%`}
          icon={BarChart3}
          change={`${stats?.uniqueParticipatingVoters || 0} voters exercised franchise`}
          trend="up"
          color="emerald"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Votes per Election Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Election Votes Comparison</h3>
              <p className="text-xs text-slate-500">Total votes cast across recent elections</p>
            </div>
            <Link
              to="/admin/results"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {electionsChart && electionsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electionsChart} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                  <Bar dataKey="votes" fill="#0284c7" radius={[8, 8, 0, 0]} name="Votes Cast" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No election voting data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Election Status Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-1">Elections Status Mix</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution of election life-cycle stages</p>

          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No elections created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
