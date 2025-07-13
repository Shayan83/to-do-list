import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const Login = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      const res = await axios.post(`${API_URL}/users/login`, form);
      const { access_token } = res.data;
      // Get user info
      const userRes = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      onLogin({ token: access_token, user: userRes.data });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div style={{ color: "#dc3545", marginBottom: 10 }}>{error}</div>
        )}
        <button
          type="submit"
          className="button-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span>Don't have an account? </span>
        <button
          type="button"
          className="button-secondary"
          style={{ padding: "6px 16px", fontSize: 14 }}
          onClick={onShowRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login; 