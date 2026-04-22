// frontend/src/pages/Admin/exams/ManageExams.jsx
import React, { useState } from "react";
import { Trash2, Loader, Link as LinkIcon } from "lucide-react";
import { useAllExams, useExamFunctions } from "../../../hooks/useConvexFunctions";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api.js";
import { toast } from "../../../utils/toast";
import { getConvexErrorMessage } from "../../../utils/convexError";
import { useUserStore } from "../../../store/userStore";
import "../../../styles/ManageExams.css";

const ManageExams = () => {
  const { user } = useUserStore();
  const adminId = user?._id || user?.id;

  const allExams = useAllExams(adminId);
  const { deleteExam } = useExamFunctions();

  const loading = allExams === undefined;
  const rawExams = allExams || [];

  const [selectedExamId, setSelectedExamId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load detail for the selected exam via Convex query
  const selectedExam = useQuery(
    api.exams.getExamDetail,
    selectedExamId ? { examId: selectedExamId } : "skip"
  );

  const normalizeExam = (exam) => ({
    id: exam?._id || exam?.id,
    title: exam?.title || "Untitled Exam",
    status: exam?.status || "draft",
    googleFormLink: exam?.googleFormLink || exam?.google_form_link || "",
    createdAt: exam?._creationTime || exam?.createdAt,
    description: exam?.description || "",
  });

  const exams = rawExams.map(normalizeExam);

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam({ examId });
      setShowDetails(false);
      toast.success("Exam deleted");
    } catch (error) {
      const msg = getConvexErrorMessage(error, "Failed to delete exam");
      toast.error(msg);
    }
  };

  const handleViewDetails = (exam) => {
    setSelectedExamId(exam.id);
    setShowDetails(true);
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
                            {p.user?.fullName || "-"}
                          </td>
                          <td>
                            {p.user?.email || p.userEmail || "-"}
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
                            {p.emailSent ? "Sent" : "Pending"}
                          </td>
                          <td>
                            {p.emailSentAt
                              ? new Date(p.emailSentAt).toLocaleString()
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
