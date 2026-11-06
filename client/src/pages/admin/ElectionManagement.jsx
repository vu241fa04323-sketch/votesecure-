import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Vote,
  PlusCircle,
  Calendar,
  Clock,
  Play,
  Square,
  Edit,
  Trash2,
  Briefcase,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ElectionManagement = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await electionService.getAll({ status: statusFilter });
      if (res.success) {
        setElections(res.elections);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch elections.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, [statusFilter]);

  const handleStatusChange = async (election, newStatus) => {
    try {
      const res = await electionService.updateStatus(election._id, newStatus);
      if (res.success) {
        showToast(res.message, 'success');
        setElections((prev) =>
          prev.map((e) => (e._id === election._id ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update election status.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedElection) return;
    try {
      setIsDeleting(true);
      const res = await electionService.delete(selectedElection._id);
      if (res.success) {
        showToast('Election deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setSelectedElection(null);
        fetchElections();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete election.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Election Lifecycle Management
          </h2>
          <p className="text-sm text-slate-500">
            Configure elections, manage voting windows, and control balloting periods
          </p>
        </div>

        <Link
          to="/admin/elections/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Election</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {['All', 'Active', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab} Elections
          </button>
        ))}
      </div>

      {/* Elections Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching elections..." />
      ) : elections.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No Elections Found"
          description="Create your first election to start registering positions and candidates."
          actionLabel="Create Election"
          onAction={() => (window.location.href = '/admin/elections/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <div
              key={election._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Status Badge & Header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      election.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : election.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        election.status === 'Active'
                          ? 'bg-emerald-500 animate-pulse'
                          : election.status === 'Upcoming'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {election.status}
                  </span>

                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/admin/elections/${election._id}/edit`}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Election Details"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedElection(election);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Election"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {election.electionName}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {election.description}
                </p>

                {/* Timeline Info */}
                <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 mb-4 text-xs font-medium text-slate-600 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>Start:</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {election.startDate} at {election.startTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>End:</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {election.endDate} at {election.endTime}
                    </span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-6">
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100/60">
                    <p className="text-lg font-bold text-brand-700">{election.postCount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Posts</p>
                  </div>
                  <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100/60">
                    <p className="text-lg font-bold text-purple-700">
                      {election.candidateCount || 0}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Candidates</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                    <p className="text-lg font-bold text-emerald-700">{election.voteCount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Votes Cast</p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {election.status === 'Upcoming' && (
                    <button
                      onClick={() => handleStatusChange(election, 'Active')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Election</span>
                    </button>
                  )}

                  {election.status === 'Active' && (
                    <button
                      onClick={() => handleStatusChange(election, 'Completed')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Close Polls</span>
                    </button>
                  )}

                  {election.status === 'Completed' && (
                    <button
                      onClick={() => handleStatusChange(election, 'Active')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Re-open</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/posts?electionId=${election._id}`}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Posts</span>
                  </Link>
                  <Link
                    to={`/admin/results?electionId=${election._id}`}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Results</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Election"
        message={`Are you sure you want to permanently delete "${selectedElection?.electionName}"? This will also remove all associated posts and candidates. Note: Elections with recorded votes cannot be deleted.`}
        confirmText="Delete Election"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedElection(null);
        }}
      />
    </div>
  );
};

export default ElectionManagement;
