import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle2, ShieldCheck, Calendar, Lock, Vote, ArrowRight } from 'lucide-react';
import { votingService } from '../../services/votingService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const VotingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await votingService.getStatus();
        if (res.success) {
          setHistory(res.history || []);
        }
      } catch (err) {
        showToast('Failed to load voting history.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [showToast]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Voting Participation Audit Trail
          </h2>
          <p className="text-sm text-slate-500">
            Certified record of positions in which your franchise was exercised
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Voter Roll Integrity Verified</span>
        </div>
      </div>

      {/* Secret Ballot Explainer Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start space-x-3">
        <Lock className="w-5 h-5 flex-shrink-0 text-brand-600 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Privacy Guarantee:</strong> This audit trail proves that your participation was recorded to prevent duplicate voting. In strict compliance with secret ballot standards, your selected candidates are stored in an anonymous decoupled table and cannot be viewed here or by system administrators.
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving participation records..." />
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Participation Records Yet"
          description="You have not voted in any election yet. Head over to Active Elections to cast your vote."
          actionLabel="View Active Elections"
          onAction={() => (window.location.href = '/voter/elections')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {history.map((record) => (
              <div
                key={record._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                      Position: {record.postId?.postName || 'Position'}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">
                      {record.electionId?.electionName || 'Election'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Submitted on{' '}
                        <strong className="text-slate-600">
                          {new Date(record.submittedAt).toLocaleDateString()}
                        </strong>{' '}
                        at{' '}
                        <strong className="text-slate-600">
                          {new Date(record.submittedAt).toLocaleTimeString()}
                        </strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ballot Sealed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingHistory;
