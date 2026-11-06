const mongoose = require('mongoose');

// Participation tracks that a voter has exercised their franchise for a given post.
// It stores participation status to prevent duplicate voting without revealing the voter's choice.
const participationSchema = new mongoose.Schema(
  {
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voter',
      required: true,
      index: true,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    hasVoted: {
      type: Boolean,
      default: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL UNIQUE CONSTRAINT: A voter can only participate once per post per election
participationSchema.index({ voterId: 1, electionId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);
