// frontend/src/pages/Admin/exams/CreateExam.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Users, AlertCircle, CheckCircle, Search } from "lucide-react";
import { API_URL, getAuthToken } from "../../../utils/apiClient";
import { toast } from "../../../utils/toast";
import "../../../styles/CreateExam.css";

const CreateExam = () => {
  const [examData, setExamData] = useState({
    title: "",
    googleFormLink: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [createdExamTitle, setCreatedExamTitle] = useState("");

  const getAuthHeaders = (includeJson = false) => {
    const token = getAuthToken();
    const headers = {};
    if (includeJson) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const normalizeStudent = (student) => ({
    id: student?._id || student?.id,
    fullName: student?.fullName || student?.full_name || "Unknown",
    email: student?.email || "",
  });

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/admin/students`,
          {
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        const list = data?.data || data?.students || [];
        setStudents(Array.isArray(list) ? list.map(normalizeStudent) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const handleExamInputChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateExamData = () => {
    const title = examData.title.trim();
    const googleFormLink = examData.googleFormLink.trim();
    const description = examData.description.trim();
    const { startDate, endDate } = examData;

    if (!title) return (setError("Exam title is required"), false);
    if (title.length < 3) return (setError("Exam title must be at least 3 characters"), false);
    if (!googleFormLink)
      return (setError("Google Form link is required"), false);
    if (!description) return (setError("Description is required"), false);
    if (selectedStudents.size === 0)
      return (setError("Select at least one participant"), false);
    if (!startDate) return (setError("Start date is required"), false);
    if (!endDate) return (setError("End date is required"), false);

    try {
      new URL(googleFormLink);
    } catch {
      setError("Invalid Google Form URL");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Please enter valid start and end dates");
      return false;
    }
    if (start >= end) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  const parseApiError = async (response, fallback) => {
    try {
      const payload = await response.json();
      return payload?.message || payload?.error || fallback;
    } catch {
      return fallback;
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!validateExamData()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setInviteResult(null);

    try {
      const createResponse = await fetch(
        `${API_URL}/admin/exams`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            title: examData.title.trim(),
            googleFormLink: examData.googleFormLink.trim(),
            description: examData.description.trim(),
            startDate: examData.startDate,
            endDate: examData.endDate,
          }),
        },
      );

      if (!createResponse.ok) {
        throw new Error(
          await parseApiError(createResponse, "Failed to create exam"),
        );
      }

      const created = await createResponse.json();
      const exam = created?.data || created?.exam;
      const examId = exam?._id || exam?.id;

      if (!examId) {
        throw new Error("Exam created but ID not returned");
      }

      const studentIds = Array.from(selectedStudents);

      const addParticipantsResponse = await fetch(
        `${API_URL}/admin/exams/${examId}/add-participants`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ studentIds }),
        },
      );

      if (!addParticipantsResponse.ok) {
        throw new Error(
          await parseApiError(
            addParticipantsResponse,
            "Failed to add participants",
          ),
        );
      }

      const sendResponse = await fetch(
        `${API_URL}/admin/exams/${examId}/send-invitations`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ studentIds }),
        },
      );

      if (!sendResponse.ok) {
        throw new Error(
          await parseApiError(sendResponse, "Failed to send invitations"),
        );
      }

      const invitationPayload = await sendResponse.json();
      const results = invitationPayload?.data?.results ||
        invitationPayload?.results || { success: [], failed: [] };

      setInviteResult(results);
      setCreatedExamTitle(exam.title || examData.title.trim());
      setSuccess(true);

      toast.success(
        `Exam created and invitations sent. Success: ${results.success?.length || 0}, Failed: ${results.failed?.length || 0}`,
      );

      setExamData({
        title: "",
        googleFormLink: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      setStudentSearch("");
      setSelectedStudents(new Set());
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to create exam and send invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    const next = new Set(selectedStudents);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setSelectedStudents(next);
  };

  const handleBulkSelect = () => {
    const next = new Set(selectedStudents);
    filteredStudents.forEach((student) => next.add(student.id));
    setSelectedStudents(next);
  };

  const handleClearSelection = () => setSelectedStudents(new Set());

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const selectedStudentList = useMemo(
    () => students.filter((student) => selectedStudents.has(student.id)),
    [students, selectedStudents],
  );

  return (
    <div className="create-exam-container">
      <header className="create-exam__header">
        <div className="create-exam__icon">
          <Users size={32} />
        </div>
        <h1>Create Exam</h1>
        <p className="step-indicator">
          Create exam + pick participants + send emails in one click
        </p>
      </header>

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert--success">
          <CheckCircle size={20} />
          <span>Exam created and invitations sent successfully.</span>
        </div>
      )}

      <form className="create-exam__form" onSubmit={handleCreateExam}>
        <div className="form-group">
          <label htmlFor="title">Exam Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={examData.title}
            onChange={handleExamInputChange}
            placeholder="Enter exam title"
            disabled={loading}
            required
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="googleFormLink">Google Form Link *</label>
          <input
            type="url"
            id="googleFormLink"
            name="googleFormLink"
            value={examData.googleFormLink}
            onChange={handleExamInputChange}
            placeholder="https://forms.google.com/..."
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={examData.description}
            onChange={handleExamInputChange}
            placeholder="Enter exam description"
            disabled={loading}
            required
            rows={3}
          />
        </div>

        <div className="participants-section">
          <div className="participants-head">
            <h3>Select Participants</h3>
            <p>
              Click a student name to add/remove. Hover a name to view email.
            </p>
          </div>

          <div className="participants-toolbar">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by student name or email"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div className="students-count">
              Selected: {selectedStudents.size} / {students.length}
              <div className="bulk-actions">
                <button
                  type="button"
                  onClick={handleBulkSelect}
                  disabled={filteredStudents.length === 0}
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  disabled={selectedStudents.size === 0}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="selected-chips">
            {selectedStudentList.length === 0 ? (
              <span className="selected-empty">
                No participants selected yet
              </span>
            ) : (
              selectedStudentList.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="selected-chip"
                  onClick={() => handleStudentToggle(student.id)}
                  title={student.email}
                >
                  {student.fullName}
                </button>
              ))
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="no-students">
              <p>No students found</p>
            </div>
          ) : (
            <div className="students-table-wrap">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Student Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const selected = selectedStudents.has(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={
                          selected ? "student-row selected" : "student-row"
                        }
                        onClick={() => handleStudentToggle(student.id)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleStudentToggle(student.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <span
                            className="student-name-hover"
                            title={student.email}
                          >
                            {student.fullName}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={examData.startDate}
              onChange={handleExamInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={examData.endDate}
              onChange={handleExamInputChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading || selectedStudents.size === 0}
        >
          {loading ? "Creating & Sending..." : "Create Exam & Send Emails"}
        </button>
      </form>

      {inviteResult && (
        <div className="invitation-summary">
          <h3>Invitation Result</h3>
          <dl>
            <dt>Exam:</dt>
            <dd>{createdExamTitle}</dd>
            <dt>Sent:</dt>
            <dd>{inviteResult.success?.length || 0}</dd>
            <dt>Failed:</dt>
            <dd>{inviteResult.failed?.length || 0}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
