// frontend/src/pages/Admin/exams/ManageExams.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Loader, Link as LinkIcon } from "lucide-react";
import { getAuthToken } from "../../../utils/apiClient";
import "../../../styles/ManageExams.css";

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const normalizeExam = (exam) => ({
    id: exam?._id || exam?.id,
    title: exam?.title || "Untitled Exam",
    status: exam?.status || "draft",
    googleFormLink: exam?.googleFormLink || exam?.google_form_link || "",
    createdAt: exam?.createdAt || exam?.created_at,
    description: exam?.description || "",
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/exams`,
          {
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) throw new Error("Failed to fetch exams");

        const data = await response.json();
        const list = data?.data || data?.exams || [];
        setExams(Array.isArray(list) ? list.map(normalizeExam) : []);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/exams/${examId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to delete exam");

      setExams((prev) => prev.filter((e) => e.id !== examId));
      setShowDetails(false);
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam");
    }
  };

  const handleViewDetails = async (exam) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/exams/${exam.id}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch exam details");

      const data = await response.json();
      setSelectedExam(data?.data || data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching exam details:", error);
      alert("Failed to load exam details");
    }
  };

  if (loading) {
    return (
      <div className="manage-exams-container">
        <div className="loading">
          <Loader size={40} />
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-exams-container">
      <header className="manage-exams__header">
        <h1>Past Exams</h1>
        <p>Review invites, links, and delivery status</p>
      </header>

      <div className="exams-count">Total Exams: {exams.length}</div>

      {exams.length === 0 ? (
        <div className="no-exams">
          <p>No exams created yet</p>
        </div>
      ) : (
        <table className="exams-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Form</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>
                  <a
                    href={exam.googleFormLink}
                    target="_blank"
                    rel="noreferrer"
                    className="table-link"
                  >
                    <LinkIcon size={14} />
                    Open Form
                  </a>
                </td>
                <td>
                  {exam.createdAt
                    ? new Date(exam.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <span className={`badge badge--${exam.status || "draft"}`}>
                    {exam.status || "Draft"}
                  </span>
                </td>
                <td className="table-actions">
                  <button
                    className="action-btn action-btn--view"
                    onClick={() => handleViewDetails(exam)}
                  >
                    View
                  </button>
                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => handleDelete(exam.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDetails && selectedExam && (
        <div
          className="modal-overlay"
          style={{ top: "50%" }}
          onClick={() => setShowDetails(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedExam.exam?.title}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <section>
                <h4>Exam Details</h4>
                <dl>
                  <dt>Title:</dt>
                  <dd>{selectedExam.exam?.title}</dd>
                  <dt>Status:</dt>
                  <dd>{selectedExam.exam?.status || "Draft"}</dd>
                  <dt>Description:</dt>
                  <dd>{selectedExam.exam?.description || "No description"}</dd>
                  <dt>Google Form Link:</dt>
                  <dd>
                    <a
                      href={
                        selectedExam.exam?.googleFormLink ||
                        selectedExam.exam?.google_form_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Form
                    </a>
                  </dd>
                </dl>
              </section>

              <section>
                <h4>Participants ({selectedExam.participants?.length || 0})</h4>
                {!selectedExam.participants ||
                selectedExam.participants.length === 0 ? (
                  <p>No participants added yet</p>
                ) : (
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Exam Title</th>
                        <th>Form Link</th>
                        <th>Email Sent</th>
                        <th>Email Sent At</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExam.participants.map((p) => (
                        <tr key={p._id || p.id}>
                          <td>
                            {p.userId?.fullName || p.users?.full_name || "-"}
                          </td>
                          <td>
                            {p.userId?.email ||
                              p.users?.email ||
                              p.userEmail ||
                              "-"}
                          </td>
                          <td>{selectedExam.exam?.title}</td>
                          <td>
                            <a
                              href={
                                selectedExam.exam?.googleFormLink ||
                                selectedExam.exam?.google_form_link
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="table-link"
                            >
                              <LinkIcon size={14} /> Form
                            </a>
                          </td>
                          <td>
                            {p.emailSent || p.email_sent ? "Sent" : "Pending"}
                          </td>
                          <td>
                            {p.emailSentAt || p.email_sent_at
                              ? new Date(
                                  p.emailSentAt || p.email_sent_at,
                                ).toLocaleString()
                              : "-"}
                          </td>
                          <td>{p.submitted ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--secondary"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;
