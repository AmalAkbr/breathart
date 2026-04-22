// frontend/src/pages/Admin/ManageUsers.jsx
import React, { useState } from 'react';
import { Trash2, Edit2, Search, Loader, Check, X } from 'lucide-react';
import {
  useAllUsers,
  useAuthFunctions,
} from '../../hooks/useConvexFunctions';
import { toast } from '../../utils/toast';
import { getConvexErrorMessage } from '../../utils/convexError';
import '../../styles/ManageUsers.css';

const ManageUsers = () => {
  const allUsers = useAllUsers();
  const { updateUserAdmin, deleteUserAdmin } = useAuthFunctions();

  const loading = allUsers === undefined;
  // Filter out admins for display
  const users = (allUsers || []).filter(
    (u) => u.role !== 'admin' && u.isAdmin !== true
  );

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditStart = (user) => {
    setEditingId(user._id);
    setEditData({
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'user',
      isActive: Boolean(user.isActive),
      isEmailVerified: Boolean(user.isEmailVerified),
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditSave = async (userId) => {
    try {
      await updateUserAdmin({ userId, ...editData });
      setEditingId(null);
      toast.success('User updated successfully');
    } catch (error) {
      const msg = getConvexErrorMessage(error, 'Failed to update user');
      toast.error(msg);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUserAdmin({ userId });
      toast.success('User deleted successfully');
    } catch (error) {
      const msg = getConvexErrorMessage(error, 'Failed to delete user');
      toast.error(msg);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-users-container">
        <div className="loading">
          <Loader size={40} />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <header className="manage-users__header">
        <h1>Manage Users</h1>
        <p>View and edit user details (password excluded)</p>
      </header>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="user-count">
          Total: {filteredUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Email Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className={editingId === user._id ? 'editing' : ''}>
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="edit-select"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`badge ${user.role === 'admin' ? 'badge--info' : 'badge--neutral'}`}>
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <label className="toggle-wrap">
                        <input
                          type="checkbox"
                          checked={Boolean(editData.isActive)}
                          onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                        />
                        <span>{editData.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    ) : (
                      <span className={`badge ${user.isActive ? 'badge--success' : 'badge--danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <label className="toggle-wrap">
                        <input
                          type="checkbox"
                          checked={Boolean(editData.isEmailVerified)}
                          onChange={(e) => setEditData({ ...editData, isEmailVerified: e.target.checked })}
                        />
                        <span>{editData.isEmailVerified ? 'Verified' : 'Pending'}</span>
                      </label>
                    ) : (
                      <span className={`badge ${user.isEmailVerified ? 'badge--success' : 'badge--danger'}`}>
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td className="date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    {editingId === user._id ? (
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon--success"
                          onClick={() => handleEditSave(user._id)}
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={handleEditCancel}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon--edit"
                          onClick={() => handleEditStart(user)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn-icon btn-icon--delete"
                          onClick={() => handleDelete(user._id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
