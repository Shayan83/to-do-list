import React, { useState } from "react";
import TodoList from "./components/TodoList";
import UserManagement from "./components/UserManagement";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("todo");
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      return { token, user: JSON.parse(user) };
    }
    return null;
  });
  const [showRegister, setShowRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = ({ token, user }) => {
    setAuth({ token, user });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!auth) {
    if (showRegister) {
      return (
        <Register
          onRegistered={() => {
            setShowRegister(false);
            setRegisterSuccess(true);
          }}
          onBack={() => {
            setShowRegister(false);
            setRegisterSuccess(false);
          }}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => {
          setShowRegister(true);
          setRegisterSuccess(false);
        }}
      >
        {registerSuccess && (
          <div style={{ color: "#28a745", marginBottom: 10 }}>
            Registration successful! Please log in.
          </div>
        )}
      </Login>
    );
  }

  const isAdmin = auth.user.role === "admin";

  return (
    <div className="App">
      <header className="App-header">
        <nav className="nav-tabs" style={{ alignItems: "center" }}>
          <button
            className={`nav-tab ${activeTab === "todo" ? "active" : ""}`}
            onClick={() => setActiveTab("todo")}
            style={{ marginLeft: "20px" }}
          >
            📝 To-Do Lists
          </button>
          {isAdmin && (
            <button
              className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Admin Page
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", gap: 16 }}>
            <span style={{ fontSize: 14, color: "#555" }}>
              Logged in as: <b>{auth.user.name}</b> ({auth.user.role})
            </span>
            <button
              className="nav-tab"
              style={{ background: "#dc3545", color: "white", marginRight: "20px" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === "todo" && <TodoList />}
        {activeTab === "users" && isAdmin && <UserManagement token={auth.token} />}
      </main>
    </div>
  );
}

export default App;
