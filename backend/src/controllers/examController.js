// backend/src/controllers/examController.js
import * as examService from '../services/examService.js';

/**
 * GET /api/admin/exams - Get all exams
 */
export const getAllExams = async (req, res) => {
  try {
    const exams = await examService.getAllExams(req.admin._id);
    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/exams/:id - Get exam with participants
 */
export const getExamDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { exam, participants } = await examService.getExamWithParticipants(id);
    res.json({
      success: true,
      data: { exam, participants }
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(404).json({
      success: false,
      message: 'Exam not found',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/students - Search students
 */
export const searchStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const students = await examService.searchStudents(search);
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/exams - Create new exam
 */
export const createExam = async (req, res) => {
  try {
    const { title, googleFormLink, description, startDate, endDate } = req.body;

    if (!title || !googleFormLink) {
      return res.status(400).json({
        success: false,
        message: 'Title and Google Form link are required'
      });
    }

    const exam = await examService.createExam(
      { title, googleFormLink, description, startDate, endDate },
      req.admin._id
    );

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exam',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/exams/:id/add-participants - Add students to exam
 */
export const addParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    const participants = await examService.addParticipants(id, studentIds);

    res.status(201).json({
      success: true,
      message: `${participants.length} participants added successfully`,
      data: participants
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding participants',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/exams/:id/send-invitations - Send exam invitations
 */
export const sendInvitations = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body || {};
    const result = await examService.sendExamInvitations(id, studentIds);

    res.json({
      success: true,
      message: result.message,
      data: {
        count: result?.results?.success?.length || 0,
        results: result.results,
      }
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitations',
      error: error.message
    });
  }
};

/**
 * PUT /api/admin/exams/:id - Update exam
 */
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await examService.updateExam(id, req.body);

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/exams/:id - Delete exam
 */
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    await examService.deleteExam(id);

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exam',
      error: error.message
    });
  }
};

export default {
  getAllExams,
  getExamDetail,
  searchStudents,
  createExam,
  addParticipants,
  sendInvitations,
  updateExam,
  deleteExam,
};
