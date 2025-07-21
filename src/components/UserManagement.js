import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const UserManagement = () => {
  const [user, setUser] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchPendingInvites()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/me`, {
        headers: getAuthHeaders(),
      })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingInvites = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams/invites/pending`, {
        headers: getAuthHeaders(),
      })
      setPendingInvites(res.data)
    } catch (err) {
      console.error('Error fetching pending invites:', err)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !user?.team_id) {
      alert(
        'Please enter an email address and make sure you are part of a team',
      )
      return
    }

    try {
      await axios.post(
        `${API_URL}/teams/invite/`,
        {
          email: inviteEmail,
          team_id: user.team_id,
        },
        {
          headers: getAuthHeaders(),
        },
      )
      alert('Invitation sent successfully!')
      setInviteEmail('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Error sending invitation')
      console.error(err)
    }
  }

  const handleAcceptInvite = async (inviteId) => {
    try {
      await axios.post(
        `${API_URL}/teams/invites/${inviteId}/accept`,
        {},
        {
          headers: getAuthHeaders(),
        },
      )
      alert('Invitation accepted! You are now part of the team.')
      fetchUserData() // Refresh user data to get updated team_id
      fetchPendingInvites() // Refresh pending invites
    } catch (err) {
      alert(err.response?.data?.detail || 'Error accepting invitation')
      console.error(err)
    }
  }

  const handleDeclineInvite = async (inviteId) => {
    try {
      await axios.post(
        `${API_URL}/teams/invites/${inviteId}/decline`,
        {},
        {
          headers: getAuthHeaders(),
        },
      )
      alert('Invitation declined.')
      fetchPendingInvites() // Refresh pending invites
    } catch (err) {
      alert(err.response?.data?.detail || 'Error declining invitation')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="card">Loading...</div>
  }

  return (
    <div className="card">
      <h1>User Management</h1>

      {user && (
        <div style={{ marginBottom: 30 }}>
          <h2>Your Profile</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Team ID:</strong> {user.team_id || 'No team'}
          </p>
        </div>
      )}

      {/* Send Invites Section */}
      {user?.team_id && (
        <div className="card" style={{ marginBottom: 30 }}>
          <h2>Invite Users to Your Team</h2>
          <p style={{ color: '#666', marginBottom: 15 }}>
            Invite others to collaborate on your team's to-do lists
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: '250px' }}
            />
            <button onClick={handleSendInvite} className="button-primary">
              Send Invite
            </button>
          </div>
        </div>
      )}

      {/* Pending Invites Section */}
      <div className="card">
        <h2>Pending Invitations</h2>
        {pendingInvites.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No pending invitations
          </p>
        ) : (
          <div>
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <p>
                    <strong>Team:</strong> {invite.team_name}
                  </p>
                  <p>
                    <strong>Invited by:</strong> {invite.inviter_name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(invite.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="button-primary"
                    style={{ background: '#28a745' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="button-secondary"
                    style={{ background: '#dc3545', color: 'white' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!user?.team_id && (
        <div
          className="card"
          style={{
            marginTop: 20,
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
          }}
        >
          <h3>Join a Team</h3>
          <p>
            You need to be part of a team to invite others. Ask a team member to
            invite you, or create a new team if you're an admin.
          </p>
        </div>
      )}
    </div>
  )
}

export default UserManagement
