import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  PlusCircle,
  Vote,
  Briefcase,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Image,
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { electionService } from '../../services/electionService';
import { postService } from '../../services/postService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const CandidateManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';
  const initialPostId = searchParams.get('postId') || '';

  const [elections, setElections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [selectedElectionId, setSelectedElectionId] = useState(initialElectionId);
  const [selectedPostId, setSelectedPostId] = useState(initialPostId);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchElectionsAndPosts = async () => {
    try {
      const elecRes = await electionService.getAll();
      if (elecRes.success) {
        setElections(elecRes.elections);
      }
    } catch (err) {
      showToast('Failed to load elections.', 'error');
    }
  };

  const fetchPostsForElection = useCallback(async (electionId) => {
    if (!electionId) {
      setPosts([]);
      return;
    }
    try {
      const postRes = await postService.getAll({ electionId });
      if (postRes.success) {
        setPosts(postRes.posts);
      }
    } catch (err) {
      console.warn('Failed to fetch posts:', err);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await candidateService.getAll({
        electionId: selectedElectionId || undefined,
        postId: selectedPostId || undefined,
        status: statusFilter,
      });
      if (res.success) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      showToast('Failed to fetch candidates.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, selectedPostId, statusFilter, showToast]);

  useEffect(() => {
    fetchElectionsAndPosts();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchPostsForElection(selectedElectionId);
    } else {
      setPosts([]);
    }
    fetchCandidates();
  }, [selectedElectionId, selectedPostId, statusFilter, fetchCandidates, fetchPostsForElection]);

  const handleToggleStatus = async (candidate) => {
    try {
      const newStatus = candidate.status === 'Active' ? 'Inactive' : 'Active';
      const res = await candidateService.toggleStatus(candidate._id, newStatus);
      if (res.success) {
        showToast(res.message, 'success');
        setCandidates((prev) =>
          prev.map((c) => (c._id === candidate._id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update candidate status.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCandidate) return;
    try {
      setIsDeleting(true);
      const res = await candidateService.delete(selectedCandidate._id);
      if (res.success) {
        showToast('Candidate deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setSelectedCandidate(null);
        fetchCandidates();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete candidate.', 'error');
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
            Candidate Roster Management
          </h2>
          <p className="text-sm text-slate-500">
            Total {candidates.length} candidates contesting across positions
          </p>
        </div>

        <Link
          to={`/admin/candidates/new${selectedElectionId ? `?electionId=${selectedElectionId}` : ''}`}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Candidate</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Election Filter */}
        <div className="w-full md:w-1/3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Filter by Election
          </label>
          <select
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              setSelectedPostId('');
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Elections</option>
            {elections.map((elec) => (
              <option key={elec._id} value={elec._id}>
                {elec.electionName}
              </option>
            ))}
          </select>
        </div>

        {/* Post Filter */}
        <div className="w-full md:w-1/3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Filter by Position / Post
          </label>
          <select
            value={selectedPostId}
            disabled={!selectedElectionId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            <option value="">All Positions</option>
            {posts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.postName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-1/3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching candidate cards..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Candidates Found"
          description="Register candidate details, upload official candidate portraits and party/candidate symbols."
          actionLabel="Register Candidate"
          onAction={() => (window.location.href = '/admin/candidates/new')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Status and Action Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleToggleStatus(cand)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      cand.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        cand.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {cand.status}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Delete Candidate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Candidate Photo & Symbol Row */}
                <div className="flex items-center space-x-4 mb-4">
                  {/* Candidate Portrait */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                    {cand.photo ? (
                      <img
                        src={cand.photo}
                        alt={cand.candidateName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-brand-50 text-brand-700 text-lg">
                        {cand.candidateName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Symbol Badge */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-slate-400">
                      ID: {cand.candidateId}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
                      {cand.candidateName}
                    </h3>
                    <p className="text-xs text-brand-600 font-semibold truncate">
                      {cand.postId?.postName || 'Position'}
                    </p>
                  </div>

                  {/* Candidate Symbol */}
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center flex-shrink-0" title="Ballot Symbol">
                    {cand.symbol ? (
                      <img
                        src={cand.symbol}
                        alt="Symbol"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Symbol</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                  {cand.description || 'No manifesto or description provided.'}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[150px] font-medium">
                  {cand.electionId?.electionName || 'Election'}
                </span>
                <span className="font-semibold text-slate-600">
                  Dept: {cand.department || 'General'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Candidate"
        message={`Are you sure you want to permanently delete candidate ${selectedCandidate?.candidateName} (${selectedCandidate?.candidateId})? Note: Candidates with cast votes cannot be deleted.`}
        confirmText="Delete Candidate"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
};

export default CandidateManagement;
