import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    googleFormLink: {
      type: String,
      required: [true, 'Google Form link is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'published',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamParticipant',
      },
    ],
  },
  { timestamps: true }
);

export const Exam = mongoose.model('Exam', examSchema);
