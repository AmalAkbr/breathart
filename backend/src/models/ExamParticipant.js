import mongoose from 'mongoose';

const examParticipantSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate participants per exam
examParticipantSchema.index({ examId: 1, userId: 1 }, { unique: true });

export const ExamParticipant = mongoose.model('ExamParticipant', examParticipantSchema);
