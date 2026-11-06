import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Vote,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  Calendar,
  Clock,
  Check,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { electionService } from '../../services/electionService';
import { votingService } from '../../services/votingService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const VotingBooth = () => {
  const { electionId } = useParams();
  const { showToast } = useToast();

  const [electionData, setElectionData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [votedPostIds, setVotedPostIds] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Voting action state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);

  const fetchElectionAndPosts = async () => {
    try {
      setLoading(true);
      const res = await electionService.getById(electionId);
      if (res.success) {
        setElectionData(res.election);
        setPosts(res.posts || []);
        setVotedPostIds(res.votedPostIds || []);

        // Default to first post that hasn't been voted yet, or first post
        if (res.posts && res.posts.length > 0) {
          const firstUnvoted = res.posts.find((p) => !res.votedPostIds.includes(p._id.toString()));
          setSelectedPostId(firstUnvoted ? firstUnvoted._id.toString() : res.posts[0]._id.toString());
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load election booth.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionAndPosts();
  }, [electionId]);

  const activePost = posts.find((p) => p._id.toString() === selectedPostId);
  const isCurrentPostVoted = votedPostIds.includes(selectedPostId);

  const handleSelectCandidate = (candidate) => {
    if (isCurrentPostVoted) return;
    setSelectedCandidate(candidate);
    setConfirmModalOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !activePost) return;

    try {
      setSubmittingVote(true);
      const res = await votingService.castVote({
        electionId,
        postId: activePost._id,
        candidateId: selectedCandidate._id,
      });

      if (res.success) {
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // Fallback if canvas is unavailable
        }

        setVoteReceipt(res.receipt);
        setVotedPostIds((prev) => [...prev, activePost._id.toString()]);
        setConfirmModalOpen(false);
        showToast('Your vote has been cast and securely recorded!', 'success');

        // Refetch to ensure synced state
        fetchElectionAndPosts();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit ballot. Duplicate prevented.';
      showToast(msg, 'error');
      setConfirmModalOpen(false);
    } finally {
      setSubmittingVote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Entering secure voting booth..." />;
  }

  if (!electionData) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Election Not Found"
        description="The requested election could not be loaded."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Election Details Banner */}
      <div className="flex items-center justify-between">
        <Link
          to="/voter/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Booth to Dashboard</span>
        </Link>
      </div>

      {/* Official Election Booth Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Live Official Ballot
            </span>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              <span>Decoupled Secret Balloting</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {electionData.electionName}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {electionData.description}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs space-y-1.5 self-start md:self-auto min-w-[220px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Positions:</span>
            <span className="font-bold">{posts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Positions Voted:</span>
            <span className="font-bold text-emerald-400">
              {votedPostIds.length} of {posts.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">End Deadline:</span>
            <span className="font-bold">{electionData.endDate} {electionData.endTime}</span>
          </div>
        </div>
      </div>

      {/* Post Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2 overflow-x-auto">
        {posts.map((post, idx) => {
          const isVoted = votedPostIds.includes(post._id.toString());
          const isSelected = selectedPostId === post._id.toString();

          return (
            <button
              key={post._id}
              onClick={() => {
                setSelectedPostId(post._id.toString());
                setVoteReceipt(null);
              }}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{post.postName}</span>
              {isVoted && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Check className="w-3 h-3 mr-0.5" />
                  Voted
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Receipt Banner (after vote) */}
      {voteReceipt && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-950">
                  Ballot Confirmed & Cryptographically Recorded!
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your vote for <strong>{voteReceipt.postName}</strong> has been secured in the database.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono font-bold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300/60">
                    Ballot Token: {voteReceipt.ballotToken}
                  </span>
                  <span className="text-emerald-600">
                    Timestamp: {new Date(voteReceipt.submittedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVoteReceipt(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 underline self-start sm:self-auto"
            >
              Dismiss Receipt
            </button>
          </div>
        </div>
      )}

      {/* Active Post Contest Details */}
      {activePost ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                Contested Position
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {activePost.postName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {activePost.description || 'Review the candidates below and cast your secret vote for this position.'}
              </p>
            </div>

            {isCurrentPostVoted ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>You have already exercised your vote for this position</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Select 1 Candidate
              </div>
            )}
          </div>

          {/* Candidate Ballot Cards */}
          {activePost.candidates && activePost.candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePost.candidates.map((cand) => (
                <div
                  key={cand._id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    isCurrentPostVoted
                      ? 'border-slate-200 opacity-80'
                      : 'border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-500/60'
                  }`}
                >
                  <div>
                    {/* Top Portrait & Symbol Banner */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Candidate Portrait */}
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                        {cand.photo ? (
                          <img
                            src={cand.photo}
                            alt={cand.candidateName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-2xl">
                            {cand.candidateName.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Candidate Symbol */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shadow-sm"
                          title="Candidate Symbol"
                        >
                          {cand.symbol ? (
                            <img
                              src={cand.symbol}
                              alt="Symbol"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Award className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          Symbol
                        </span>
                      </div>
                    </div>

                    {/* Candidate Details */}
                    <p className="font-mono text-xs font-bold text-brand-600">
                      ID: {cand.candidateId}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      {cand.candidateName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Dept: {cand.department || 'General'}
                    </p>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {cand.description || 'No election manifesto published.'}
                    </p>
                  </div>

                  {/* Vote Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectCandidate(cand)}
                      disabled={isCurrentPostVoted}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                        isCurrentPostVoted
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                      }`}
                    >
                      <Vote className="w-4 h-4" />
                      <span>{isCurrentPostVoted ? 'Position Voted' : `Vote for ${cand.candidateName}`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No Candidates Found"
              description="No candidates are contesting for this position."
            />
          )}
        </div>
      ) : null}

      {/* Confirmation & Review Modal */}
      {confirmModalOpen && selectedCandidate && activePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Vote className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Confirm Your Ballot Selection
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please review your vote carefully before permanent submission
              </p>
            </div>

            {/* Candidate Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {selectedCandidate.photo ? (
                  <img
                    src={selectedCandidate.photo}
                    alt={selectedCandidate.candidateName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-slate-700">{selectedCandidate.candidateName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-600 uppercase">
                  Position: {activePost.postName}
                </p>
                <h4 className="text-lg font-bold text-slate-900 truncate">
                  {selectedCandidate.candidateName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedCandidate.candidateId} &bull; {selectedCandidate.department || 'General'}
                </p>
              </div>
              {selectedCandidate.symbol && (
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                  <img src={selectedCandidate.symbol} alt="Symbol" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Immutability warning */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Irreversible Submission:</strong> Once you confirm this ballot, it is cryptographically sealed in the database and cannot be modified or withdrawn.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={submittingVote}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Change Choice
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                disabled={submittingVote}
                className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center space-x-2"
              >
                {submittingVote && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                )}
                <span>Confirm & Submit Vote</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingBooth;
