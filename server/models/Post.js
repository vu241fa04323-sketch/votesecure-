const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    postName: {
      type: String,
      required: [true, 'Post / Position name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
