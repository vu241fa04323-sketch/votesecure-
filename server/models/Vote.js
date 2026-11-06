const mongoose = require('mongoose');

// Vote represents the anonymous ballot choice.
// PRIVACY NOTICE: This collection intentionally contains NO reference to voterId.
const voteSchema = new mongoose.Schema(
  {
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
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    ballotToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for aggregating results efficiently
voteSchema.index({ electionId: 1, postId: 1, candidateId: 1 });

module.exports = mongoose.model('Vote', voteSchema);
