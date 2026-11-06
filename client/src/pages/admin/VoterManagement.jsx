import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  MoreVertical,
  ShieldAlert,
} from 'lucide-react';
import { voterService } from '../../services/voterService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const VoterManagement = () => {
  const [voters, setVoters] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { showToast } = useToast();

  const fetchVoters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await voterService.getAll({
        search: search.trim(),
        department,
        status,
      });
      if (res.success) {
        setVoters(res.voters);
        setTotal(res.total);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load voters list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, department, status, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVoters();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVoters]);

  const handleToggleStatus = async (voter) => {
    try {
      const targetStatus = voter.status === 'Active' ? 'Inactive' : 'Active';
      const res = await voterService.toggleStatus(voter._id, targetStatus);
      if (res.success) {
        showToast(res.message, 'success');
        setVoters((prev) =>
          prev.map((v) => (v._id === voter._id ? { ...v, status: targetStatus } : v))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update voter status.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedVoter) return;
    try {
      setIsDeleting(true);
      const res = await voterService.delete(selectedVoter._id);
      if (res.success) {
        showToast('Voter account deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setSelectedVoter(null);
        fetchVoters();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete voter account.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }
    try {
      setIsResetting(true);
      const res = await voterService.resetPassword(selectedVoter._id, newPassword);
      if (res.success) {
        showToast('Voter password reset successfully.', 'success');
        setPasswordModalOpen(false);
        setSelectedVoter(null);
        setNewPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Voter Registry Management
          </h2>
          <p className="text-sm text-slate-500">
            Total {total} provisioned voter accounts in the system
          </p>
        </div>

        <Link
          to="/admin/voters/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Voter</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by voter name, User ID, Registration number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching voter records..." />
        ) : voters.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Voters Found"
            description="No voter accounts match your current search or filter criteria."
            actionLabel="Add Voter Account"
            onAction={() => (window.location.href = '/admin/voters/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Voter Details</th>
                  <th className="py-4 px-6">User ID</th>
                  <th className="py-4 px-6">Registration No</th>
                  <th className="py-4 px-6">Department & Class</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voters.map((voter) => (
                  <tr key={voter._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden flex-shrink-0">
                          {voter.profilePhoto ? (
                            <img
                              src={voter.profilePhoto}
                              alt={voter.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            voter.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {voter.fullName}
                          </p>
                          <p className="text-xs text-slate-400">{voter.email}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {voter.mobileNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                        {voter.userId}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs font-medium text-slate-700">
                      {voter.registrationNumber}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 text-xs">{voter.department}</p>
                      <p className="text-slate-400 text-xs">{voter.year}</p>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(voter)}
                        title="Click to toggle status"
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          voter.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            voter.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {voter.status}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/voters/${voter._id}/edit`}
                          title="Edit Voter"
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedVoter(voter);
                            setPasswordModalOpen(true);
                          }}
                          title="Reset Password"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedVoter(voter);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Voter"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Voter Account"
        message={`Are you sure you want to permanently delete the voter account for ${selectedVoter?.fullName} (${selectedVoter?.userId})? This action cannot be undone.`}
        confirmText="Delete Account"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedVoter(null);
        }}
      />

      {/* Password Reset Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reset Voter Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a new secure password for{' '}
              <strong className="text-slate-800">{selectedVoter?.fullName}</strong> ({selectedVoter?.userId})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setSelectedVoter(null);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-500 transition-all flex items-center space-x-2"
                >
                  {isResetting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />}
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterManagement;
