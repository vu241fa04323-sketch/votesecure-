const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    candidateId: {
      type: String,
      required: [true, 'Candidate ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    photo: {
      type: String,
      default: '',
    },
    symbol: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post / Position ID is required'],
      index: true,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Candidate', candidateSchema);
