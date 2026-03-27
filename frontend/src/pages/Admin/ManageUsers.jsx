// frontend/src/pages/Admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Search, Loader, Check, X } from 'lucide-react';
import { getAuthToken } from '../../utils/apiClient';
import { toast } from '../../utils/toast';
import '../../styles/ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const nonAdminUsers = (data.users || []).filter(
        (u) => u.role !== 'admin' && u.isAdmin !== true
      );
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

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
      const token = getAuthToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      setUsers((prev) => {
        const next = prev.map((u) => (u._id === userId ? updatedUser.user : u));
        return next.filter((u) => u.role !== 'admin' && u.isAdmin !== true);
      });
      setEditingId(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = getAuthToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
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
