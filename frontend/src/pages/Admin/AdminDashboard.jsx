// frontend/src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "../../components/AdminNav";
import Overview from "./Overview";
import UploadVideo from "./UploadVideo";
import ManageVideos from "./ManageVideos";
import CreateExam from "./exams/CreateExam";
import ManageExams from "./exams/ManageExams";
import ManageUsers from "./ManageUsers";
import "../../styles/AdminDashboard.css";
import { useUserStore } from "../../store/userStore";
import { API_URL, getAuthToken } from "../../utils/apiClient";
import { toast } from "../../utils/toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        console.log("[ADMIN DASHBOARD] Verifying admin access...");
        console.log(
          "[ADMIN DASHBOARD] User:",
          user?.email,
          "Role:",
          user?.role,
        );
        const token = getAuthToken();

        // Check if token exists and user is admin
        if (!token || !user || user.role !== "admin") {
          console.warn(
            "[ADMIN DASHBOARD] ❌ Not authorized - user role:",
            user?.role,
          );
          toast.error("Access denied: Admin privileges required");
          navigate("/", { replace: true });
          return;
        }

        // Enable admin flag on backend if needed
        try {
          const enableResponse = await fetch(
            `${API_URL}/admin/enable-admin`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (enableResponse.ok) {
            const enableData = await enableResponse.json();
            console.log(
              "[ADMIN DASHBOARD] ✅ Admin mode enabled:",
              enableData.user?.email,
            );
          } else {
            console.warn(
              "[ADMIN DASHBOARD] Admin enable response:",
              enableResponse.status,
            );
          }
        } catch (enableError) {
          console.error("[ADMIN DASHBOARD] Error enabling admin:", enableError);
        }

        console.log("[ADMIN DASHBOARD] ✅ Admin verified:", user.email);
        setLoading(false);
      } catch (error) {
        console.error("[ADMIN DASHBOARD] Verification error:", error);
        toast.error("Error verifying admin access");
        navigate("/", { replace: true });
      }
    };

    verifyAdmin();
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("[ADMIN DASHBOARD] Logout error:", error);
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav
        activeSection={activeSection}
        setActiveSection={(section) => {
          setActiveSection(section);
          setNavOpen(false);
        }}
        user={user}
        onLogout={handleLogout}
        isOpen={navOpen}
        onToggle={() => setNavOpen((v) => !v)}
      />
      {!navOpen ? (
        <button
          className="mobile-nav-toggle"
          type="button"
          onClick={() => setNavOpen((v) => !v)}
        >
          Menu
        </button>
      ) : (
        ""
      )}
      <main
        className={`admin-main ${navOpen ? "nav-open" : ""}`}
        onClick={() => {
          if (navOpen) setNavOpen(false);
        }}
      >
        {activeSection === "overview" && <Overview />}
        {/* Videos Section */}
        {activeSection === "upload-video" && <UploadVideo />}
        {activeSection === "manage-videos" && <ManageVideos />}

        {/* Exams Section */}
        {activeSection === "create-exam" && <CreateExam />}
        {activeSection === "manage-exams" && <ManageExams />}

        {/* Users Section */}
        {activeSection === "manage-users" && <ManageUsers />}
      </main>
    </div>
  );
};

export default AdminDashboard;
