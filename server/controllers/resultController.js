const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');
const Voter = require('../models/Voter');

// Helper to compute election results
const computeElectionResults = async (electionId) => {
  const election = await Election.findById(electionId);
  if (!election) return null;

  const totalEligibleVoters = await Voter.countDocuments({ status: 'Active' });
  const posts = await Post.find({ electionId: election._id });
  const totalVotesCast = await Vote.countDocuments({ electionId: election._id });

  // Count distinct voters who cast at least one vote in this election
  const distinctVoters = await Participation.distinct('voterId', { electionId: election._id });
  const participatingVoterCount = distinctVoters.length;

  const turnoutPercentage =
    totalEligibleVoters > 0
      ? Number(((participatingVoterCount / totalEligibleVoters) * 100).toFixed(2))
      : 0;

  // Process each post
  const postsResults = await Promise.all(
    posts.map(async (post) => {
      const candidates = await Candidate.find({ postId: post._id });
      const totalPostVotes = await Vote.countDocuments({ postId: post._id });

      let maxVotes = -1;
      let winners = [];

      const candidateResults = await Promise.all(
        candidates.map(async (cand) => {
          const votesReceived = await Vote.countDocuments({
            postId: post._id,
            candidateId: cand._id,
          });

          const votePercentage =
            totalPostVotes > 0
              ? Number(((votesReceived / totalPostVotes) * 100).toFixed(2))
              : 0;

          if (votesReceived > maxVotes) {
            maxVotes = votesReceived;
            winners = [
              {
                candidateId: cand._id,
                candidateName: cand.candidateName,
                symbol: cand.symbol,
                votesReceived,
              },
            ];
          } else if (votesReceived === maxVotes && maxVotes > 0) {
            winners.push({
              candidateId: cand._id,
              candidateName: cand.candidateName,
              symbol: cand.symbol,
              votesReceived,
            });
          }

          return {
            candidateId: cand._id,
            candidateName: cand.candidateName,
            candidateCustomId: cand.candidateId,
            symbol: cand.symbol,
            photo: cand.photo,
            department: cand.department,
            votesReceived,
            votePercentage,
          };
        })
      );

      // Sort descending by votes
      candidateResults.sort((a, b) => b.votesReceived - a.votesReceived);

      return {
        postId: post._id,
        postName: post.postName,
        description: post.description,
        totalPostVotes,
        candidates: candidateResults,
        winners: maxVotes > 0 ? winners : [],
        isTie: winners.length > 1,
      };
    })
  );

  return {
    election: {
      id: election._id,
      electionName: election.electionName,
      description: election.description,
      status: election.status,
      startDate: election.startDate,
      endDate: election.endDate,
      startTime: election.startTime,
      endTime: election.endTime,
      resultsPublished: election.resultsPublished,
    },
    totalEligibleVoters,
    totalVotesCast,
    participatingVoterCount,
    turnoutPercentage,
    posts: postsResults,
  };
};

// @desc    Get full election results
// @route   GET /api/results/:electionId
// @access  Private (Admin or Voter if published)
const getElectionResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Role visibility enforcement:
    // Voters can only view if results are explicitly published by Admin
    if (req.user.role === 'voter' && !election.resultsPublished) {
      return res.status(403).json({
        success: false,
        message: 'Election results have not been released yet by the administrator.',
      });
    }

    const results = await computeElectionResults(electionId);
    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post results in an election
// @route   GET /api/results/:electionId/:postId
// @access  Private
const getPostResults = async (req, res, next) => {
  try {
    const { electionId, postId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (req.user.role === 'voter' && !election.resultsPublished) {
      return res.status(403).json({
        success: false,
        message: 'Election results have not been published by the administrator.',
      });
    }

    const results = await computeElectionResults(electionId);
    const postData = results.posts.find((p) => p.postId.toString() === postId);

    if (!postData) {
      return res.status(404).json({ success: false, message: 'Post results not found' });
    }

    res.status(200).json({
      success: true,
      electionName: election.electionName,
      post: postData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export results as CSV report
// @route   GET /api/results/:electionId/export
// @access  Private/Admin
const exportElectionResultsCSV = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const data = await computeElectionResults(electionId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    let csv = `VoteSecure Official Election Result Report\r\n`;
    csv += `Election Name,${data.election.electionName.replace(/,/g, '')}\r\n`;
    csv += `Status,${data.election.status}\r\n`;
    csv += `Voting Period,${data.election.startDate} ${data.election.startTime} to ${data.election.endDate} ${data.election.endTime}\r\n`;
    csv += `Total Eligible Voters,${data.totalEligibleVoters}\r\n`;
    csv += `Turnout Voters,${data.participatingVoterCount}\r\n`;
    csv += `Turnout Rate,${data.turnoutPercentage}%\r\n`;
    csv += `Total Ballots Cast,${data.totalVotesCast}\r\n`;
    csv += `\r\n`;
    csv += `Post Name,Candidate Name,Candidate ID,Department,Votes Received,Vote Percentage,Winner Status\r\n`;

    data.posts.forEach((post) => {
      post.candidates.forEach((cand) => {
        const isWinner = post.winners.some(
          (w) => w.candidateId.toString() === cand.candidateId.toString()
        )
          ? 'Winner'
          : 'Runner-up';
        csv += `"${post.postName}","${cand.candidateName}","${cand.candidateCustomId}","${cand.department || 'N/A'}",${cand.votesReceived},${cand.votePercentage}%,${isWinner}\r\n`;
      });
    });

    const filename = `votesecure_results_${data.election.electionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide statistics for Admin Dashboard
// @route   GET /api/results/admin/summary
// @access  Private/Admin
const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const totalVoters = await Voter.countDocuments();
    const activeVoters = await Voter.countDocuments({ status: 'Active' });
    const totalCandidates = await Candidate.countDocuments();
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'Active' });
    const completedElections = await Election.countDocuments({ status: 'Completed' });
    const upcomingElections = await Election.countDocuments({ status: 'Upcoming' });
    const totalVotes = await Vote.countDocuments();

    // Calculate unique voters who have ever cast a vote
    const uniqueParticipatingVoters = (await Participation.distinct('voterId')).length;
    const voterParticipationPercentage =
      totalVoters > 0
        ? Number(((uniqueParticipatingVoters / totalVoters) * 100).toFixed(2))
        : 0;

    // Recent active elections overview
    const recentElections = await Election.find().sort({ createdAt: -1 }).limit(5);

    // Votes per election distribution for charts
    const electionsForChart = await Promise.all(
      recentElections.map(async (elec) => {
        const votes = await Vote.countDocuments({ electionId: elec._id });
        const postCount = await Post.countDocuments({ electionId: elec._id });
        const candidateCount = await Candidate.countDocuments({ electionId: elec._id });
        return {
          id: elec._id,
          name: elec.electionName,
          status: elec.status,
          votes,
          postCount,
          candidateCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        totalVoters,
        activeVoters,
        totalCandidates,
        totalElections,
        activeElections,
        completedElections,
        upcomingElections,
        totalVotes,
        voterParticipationPercentage,
        uniqueParticipatingVoters,
      },
      electionsChart: electionsForChart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getElectionResults,
  getPostResults,
  exportElectionResultsCSV,
  getAdminDashboardSummary,
};
