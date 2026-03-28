// frontend/src/components/AdminNav.jsx
import React, { useState } from "react";
import {
  Video,
  BookOpen,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  House,
  FilmIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminNav.css";
import { Link } from "react-router-dom";

const AdminNav = ({ activeSection, setActiveSection, user, onLogout, isOpen = false, onToggle }) => {
  const [expandedGroups, setExpandedGroups] = useState({
    dashboard: true,
    videos: true,
    exams: true,
    users: true,
  });

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  const navGroups = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      items: [{ id: "overview", label: "Overview", section: "overview" }],
    },
    {
      id: "videos",
      label: "Video Management",
      icon: Video,
      items: [
        { id: "upload-video", label: "Upload Video", section: "upload-video" },
        {
          id: "manage-videos",
          label: "Manage Videos",
          section: "manage-videos",
        },
      ],
    },
    {
      id: "exams",
      label: "Exam Management",
      icon: BookOpen,
      items: [
        { id: "create-exam", label: "Create Exam", section: "create-exam" },
        { id: "manage-exams", label: "Past Exams", section: "manage-exams" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      items: [{ id: "manage-users", label: "All Users", section: "manage-users" }],
    },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: BarChart3,
    //   items: [{ id: "stats", label: "Statistics", section: "stats" }],
    // },
  ];

  const getAvatarLetter = () => {
    return (
      user?.fullName?.[0]?.toUpperCase() ||
      user?.email?.[0]?.toUpperCase() ||
      "A"
    );
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <h1>BreathART</h1>
            <p>Admin</p>
          </div>
        </div>
        <button className="sidebar-close" onClick={onToggle}>
          ✕
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.id} className="nav-group">
            <button
              className="nav-group-header"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="group-label">
                <group.icon size={18} className="group-icon" />
                <span>{group.label}</span>
              </div>
              <motion.div
                animate={{ rotate: expandedGroups[group.id] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedGroups[group.id] && (
                <motion.div
                  className="nav-items"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item ${activeSection === item.section ? "active" : ""}`}
                      onClick={() => handleNavigation(item.section)}
                    >
                      <span className="nav-item-dot" />
                      <span className="nav-item-label">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="profile-avatar">{getAvatarLetter()}</div>
          <div className="profile-info">
            <div className="profile-name">{user?.fullName || "Admin"}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>

        <Link to={'/'}>
          <button className="home-button" title="Logout">
            <House size={18} />
            <span>Home</span>
          </button>
        </Link>
        <Link to={'/videos'}>
          <button className="film-button" title="Logout">
            <FilmIcon size={18} />
            <span>Videos</span>
          </button>
        </Link>
        <button className="logout-button" onClick={onLogout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNav;
