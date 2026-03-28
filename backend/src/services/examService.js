// backend/src/services/examService.js
import { Exam } from '../models/Exam.js';
import { ExamParticipant } from '../models/ExamParticipant.js';
import { User } from '../models/User.js';
import { sendBulkExamInvitations } from './emailService.js';

/**
 * Get all exams created by admin (IDOR-protected)
 */
export const getAllExams = async (adminId) => {
  if (!adminId) {
    throw new Error('Admin ID required');
  }

  // Only return exams created by this specific admin (or legacy exams without createdBy)
  const query = {
    $or: [
      { createdBy: adminId },
      { createdBy: { $exists: false } },
      { createdBy: null }
    ]
  };

  const exams = await Exam.find(query)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  return exams;
};

/**
 * Verify exam ownership - IDOR protection
 */
export const verifyExamOwnership = async (examId, adminId) => {
  if (!examId || !adminId) {
    throw new Error('Invalid exam ID or admin ID');
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Check ownership (allow non-owned legacy exams to be viewed)
  if (exam.createdBy && exam.createdBy.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to access this exam');
  }

  return exam;
};

/**
 * Get single exam with participants and user details (IDOR-protected)
 */
export const getExamWithParticipants = async (examId, adminId = null) => {
  const exam = await Exam.findById(examId).populate('createdBy', 'fullName email');

  if (!exam) {
    throw new Error('Exam not found');
  }

  // Verify ownership if adminId provided (for API requests)
  if (adminId && exam.createdBy && exam.createdBy._id.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to access this exam');
  }

  const participants = await ExamParticipant.find({ examId })
    .populate('userId', 'fullName email');

  return { exam, participants };
};

/**
 * Search available students
 */
export const searchStudents = async (searchTerm = null) => {
  let query = { role: 'user' };

  if (searchTerm) {
    query = {
      role: 'user',
      $or: [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };
  }

  const students = await User.find(query)
    .select('_id fullName email')
    .sort({ fullName: 1 });

  return students;
};

/**
 * Create new exam
 */
export const createExam = async (examData, adminId) => {
  const { title, googleFormLink, description, startDate, endDate } = examData;

  const exam = new Exam({
    title,
    googleFormLink,
    description: description || null,
    createdBy: adminId,
    startDate: startDate || null,
    endDate: endDate || null,
    status: 'draft',
  });

  await exam.save();
  return exam.populate('createdBy', 'fullName email');
};

/**
 * Add participants to exam (IDOR-protected)
 */
export const addParticipants = async (examId, studentIds, adminId = null) => {
  // Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Verify ownership (IDOR protection)
  if (adminId && exam.createdBy && exam.createdBy.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to modify this exam');
  }

  // Verify students exist
  const students = await User.find({ _id: { $in: studentIds } });
  if (students.length !== studentIds.length) {
    throw new Error('One or more students not found');
  }

  // Create participant records
  const participants = [];
  for (const student of students) {
    const existingParticipant = await ExamParticipant.findOne({
      examId,
      userId: student._id,
    });

    if (!existingParticipant) {
      const participant = new ExamParticipant({
        examId,
        userId: student._id,
        userEmail: student.email,
        emailSent: false,
      });
      await participant.save();
      participants.push(participant);
    }
  }

  return participants;
};

/**
 * Send exam invitations to students (IDOR-protected)
 */
export const sendExamInvitations = async (examId, studentIds = null, adminId = null) => {
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Verify ownership (IDOR protection)
  if (adminId && exam.createdBy && exam.createdBy.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to send invitations for this exam');
  }

  // Get participants and their details
  let query = ExamParticipant.find({
    examId,
    emailSent: false // Only send to those who haven't received yet
  }).populate('userId', '_id fullName email');

  if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
    query = query.where('userId').in(studentIds);
  }

  const participants = await query.exec();

  if (participants.length === 0) {
    return { message: 'No students to send invitations to', results: { success: [], failed: [] } };
  }

  // Prepare student data for email service
  const studentsToNotify = participants.map(p => ({
    email: p.userId.email,
    fullName: p.userId.fullName,
  }));

  // Send emails
  const emailResults = await sendBulkExamInvitations(studentsToNotify, {
    title: exam.title,
    googleFormLink: exam.googleFormLink,
    description: exam.description,
    startDate: exam.startDate,
    endDate: exam.endDate,
  });

  // Update emailSent status for successful sends
  const successfulParticipants = participants.filter(p =>
    emailResults.success.includes(p.userId.email)
  );

  if (successfulParticipants.length > 0) {
    const participantIds = successfulParticipants.map(p => p._id);
    await ExamParticipant.updateMany(
      { _id: { $in: participantIds } },
      {
        emailSent: true,
        emailSentAt: new Date(),
      }
    );
  }

  return {
    message: `Invitations sent to ${emailResults.success.length} student(s)`,
    results: emailResults,
  };
};

/**
 * Update exam (IDOR-protected)
 */
export const updateExam = async (examId, updateData, adminId = null) => {
  // Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Verify ownership (IDOR protection)
  if (adminId && exam.createdBy && exam.createdBy.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to modify this exam');
  }

  const dataToUpdate = {
    updatedAt: new Date(),
  };

  if (updateData.title) dataToUpdate.title = updateData.title;
  if (updateData.googleFormLink) dataToUpdate.googleFormLink = updateData.googleFormLink;
  if (updateData.description !== undefined) dataToUpdate.description = updateData.description || null;
  if (updateData.startDate !== undefined) dataToUpdate.startDate = updateData.startDate || null;
  if (updateData.endDate !== undefined) dataToUpdate.endDate = updateData.endDate || null;
  if (updateData.status) dataToUpdate.status = updateData.status;

  const updatedExam = await Exam.findByIdAndUpdate(
    examId,
    dataToUpdate,
    { returnDocument: 'after' }
  );

  if (!updatedExam) throw new Error('Exam not found');
  return updatedExam;
};

/**
 * Delete exam (IDOR-protected, cascades to participants)
 */
export const deleteExam = async (examId, adminId = null) => {
  // Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Verify ownership (IDOR protection)
  if (adminId && exam.createdBy && exam.createdBy.toString() !== adminId.toString()) {
    throw new Error('You do not have permission to delete this exam');
  }

  // Delete the exam
  await Exam.findByIdAndDelete(examId);
  
  // Delete all participants for this exam (cascade)
  await ExamParticipant.deleteMany({ examId });
  
  return { message: 'Exam deleted successfully' };
};

/**
 * Publish exam
 */
export const publishExam = async (examId) => {
  const exam = await Exam.findByIdAndUpdate(
    examId,
    { status: 'published' },
    { returnDocument: 'after' }
  ).populate('createdBy', 'fullName email');

  if (!exam) {
    throw new Error('Exam not found');
  }

  return exam;
};

/**
 * Get exam statistics
 */
export const getExamStats = async (examId) => {
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  const participants = await ExamParticipant.find({ examId });
  const submittedParticipants = participants.filter((p) => p.submitted);

  return {
    totalParticipants: participants.length,
    submittedParticipants: submittedParticipants.length,
    pendingParticipants: participants.length - submittedParticipants.length,
    submissionRate: participants.length > 0
      ? Math.round((submittedParticipants.length / participants.length) * 100)
      : 0,
  };
};

export default {
  getAllExams,
  getExamWithParticipants,
  searchStudents,
  createExam,
  addParticipants,
  sendExamInvitations,
  updateExam,
  deleteExam,
  publishExam,
  getExamStats,
};
