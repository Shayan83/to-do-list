import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    team_id: ''
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users: ' + (error.response?.data?.detail || ''));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      team_id: ''
    });
    setEditingUser(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      setError('Name, email, and password are required');
      return;
    }
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || undefined,
        role: formData.role,
        team_id: formData.team_id ? parseInt(formData.team_id) : null
      };
      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser.id}`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/users/`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.detail || 'Error saving user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      team_id: user.team_id ? user.team_id.toString() : ''
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      setError('Error deleting user: ' + (error.response?.data?.detail || ''));
    }
  };

  if (!token) {
    return <div className="card" style={{ margin: 40, color: 'red' }}>You must be logged in as admin to view this page.</div>;
  }

  return (
    <div className="card">
      <h2>User Management (Admin Only)</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Name: *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Email: *
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Password: {editingUser ? '(leave blank to keep unchanged)' : '*'}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  required={!editingUser}
                />
              </label>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Role:
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Team ID (optional):
                <input
                  type="number"
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="button-primary"
                style={{ marginRight: 10 }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      <div className="card">
        <h3>Users ({users.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Team ID</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{user.id}</td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{user.name}</td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{user.email}</td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{user.role}</td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{user.team_id || '-'}</td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                        marginRight: 5,
                        fontWeight: 'bold'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
            No users found. Create your first user above!
          </p>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 