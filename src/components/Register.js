import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const Register = ({ onRegistered, onBack }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    team_id: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);
    try {
      await axios.post(`${API_URL}/users/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        team_id: form.team_id ? parseInt(form.team_id) : undefined,
        role: "user"
      });
      setSuccess(true);
      setTimeout(() => {
        if (onRegistered) onRegistered();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "40px auto" }}>
      {onBack && (
        <button
          type="button"
          className="button-secondary"
          style={{ marginBottom: 20 }}
          onClick={onBack}
        >
          ← Back to Login
        </button>
      )}
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <input
            type="text"
            className="input-field"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <input
            type="number"
            className="input-field"
            placeholder="Team ID (optional)"
            name="team_id"
            value={form.team_id}
            onChange={handleChange}
          />
        </div>
        {error && (
          <div style={{ color: "#dc3545", marginBottom: 10 }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "#28a745", marginBottom: 10 }}>
            Registration successful! Redirecting to login...
          </div>
        )}
        <button
          type="submit"
          className="button-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register; 