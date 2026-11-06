const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
  {
    electionName: {
      type: String,
      required: [true, 'Election name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Election description is required'],
      trim: true,
    },
    startDate: {
      type: String, // Stored as YYYY-MM-DD for precise time-zone independent matching
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String, // Stored as HH:mm (24-hour format)
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Stored as HH:mm (24-hour format)
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed'],
      default: 'Upcoming',
    },
    resultsPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if election is currently open for voting
electionSchema.methods.isCurrentlyActive = function () {
  if (this.status !== 'Active') return false;

  const now = new Date();
  const startDateTime = new Date(`${this.startDate}T${this.startTime}:00`);
  const endDateTime = new Date(`${this.endDate}T${this.endTime}:00`);

  return now >= startDateTime && now <= endDateTime;
};

module.exports = mongoose.model('Election', electionSchema);
