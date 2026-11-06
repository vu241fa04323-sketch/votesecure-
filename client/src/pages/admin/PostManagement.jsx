import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Vote,
  Award,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { postService } from '../../services/postService';
import { electionService } from '../../services/electionService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const PostManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(initialElectionId);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Post Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postName, setPostName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchElections = async () => {
    try {
      const res = await electionService.getAll();
      if (res.success) {
        setElections(res.elections);
        if (!selectedElectionId && res.elections.length > 0) {
          setSelectedElectionId(res.elections[0]._id);
        }
      }
    } catch (err) {
      showToast('Failed to load elections list.', 'error');
    }
  };

  const fetchPosts = useCallback(async () => {
    if (!selectedElectionId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await postService.getAll({ electionId: selectedElectionId });
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load posts.', 'error');
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
      fetchPosts();
    }
  }, [selectedElectionId, fetchPosts, setSearchParams]);

  const handleOpenAdd = () => {
    setEditingPost(null);
    setPostName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setPostName(post.postName);
    setDescription(post.description || '');
    setModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postName.trim()) {
      showToast('Position name cannot be empty.', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (editingPost) {
        const res = await postService.update(editingPost._id, { postName, description });
        if (res.success) {
          showToast('Post updated successfully!', 'success');
          setModalOpen(false);
          fetchPosts();
        }
      } else {
        const res = await postService.create({
          postName,
          description,
          electionId: selectedElectionId,
        });
        if (res.success) {
          showToast('Position added successfully!', 'success');
          setModalOpen(false);
          fetchPosts();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save position.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      setIsDeleting(true);
      const res = await postService.delete(selectedPost._id);
      if (res.success) {
        showToast('Position deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setSelectedPost(null);
        fetchPosts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete position.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeElection = elections.find((e) => e._id === selectedElectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Position & Post Management
          </h2>
          <p className="text-sm text-slate-500">
            Configure ballot posts (e.g. President, Vice President) and assign candidates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={!selectedElectionId}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Election Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected Election
            </label>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="mt-1 font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {elections.map((elec) => (
                <option key={elec._id} value={elec._id}>
                  {elec.electionName} ({elec.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeElection && (
          <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
            <span>Status: <strong className="text-slate-800">{activeElection.status}</strong></span>
            <span>Period: <strong className="text-slate-800">{activeElection.startDate} to {activeElection.endDate}</strong></span>
          </div>
        )}
      </div>

      {/* Posts Roster */}
      {loading ? (
        <LoadingSpinner message="Fetching positions for selected election..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Positions Added Yet"
          description="Create the positions/posts (e.g. President, Secretary) that candidates will contest in this election."
          actionLabel="Add Position"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                    Position #{posts.indexOf(post) + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">{post.postName}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {post.description || 'No description provided for this position.'}
                </p>

                {/* Candidate Roster Preview */}
                <div className="border-t border-slate-100 pt-3 mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700">Contesting Candidates:</span>
                    <span className="font-semibold text-brand-600">
                      {post.candidates?.length || 0} Registered
                    </span>
                  </div>

                  {post.candidates && post.candidates.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {post.candidates.map((cand) => (
                        <div
                          key={cand._id}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs border border-slate-100"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{cand.candidateName}</span>
                            <span className="font-mono text-[10px] text-slate-400">({cand.candidateId})</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cand.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {cand.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">
                      No candidates assigned to this position yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Votes: <strong className="text-slate-700">{post.voteCount || 0}</strong>
                </span>

                <Link
                  to={`/admin/candidates/new?electionId=${selectedElectionId}&postId=${post._id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Assign Candidate</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Post Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingPost ? 'Edit Position' : 'Add New Position'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              In election: <strong className="text-slate-800">{activeElection?.electionName}</strong>
            </p>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Position / Post Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. President, General Secretary"
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Position Description & Role
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline responsibilities and requirements for this post..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-500 transition-all flex items-center space-x-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />}
                  <span>{editingPost ? 'Update Position' : 'Save Position'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Position"
        message={`Are you sure you want to delete "${selectedPost?.postName}"? This will also remove all candidates assigned to this position. Note: Positions with cast votes cannot be deleted.`}
        confirmText="Delete Position"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
};

export default PostManagement;
