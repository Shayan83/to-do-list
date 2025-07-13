import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const TodoList = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API_URL}/lists/`, {
        headers: getAuthHeaders(),
      });
      setLists(res.data);
      if (res.data.length > 0) {
        setSelectedList(res.data[0]);
        fetchTasks(res.data[0].id);
      }
    } catch (err) {
      alert("Error fetching lists");
      console.error(err);
    }
  };

  const fetchTasks = async (listId) => {
    try {
      const res = await axios.get(`${API_URL}/tasks/`, {
        headers: getAuthHeaders(),
      });
      const filtered = res.data.filter((t) => t.list_id === listId);
      setTasks(filtered);
    } catch (err) {
      alert("Error fetching tasks");
      console.error(err);
    }
  };

  const handleListSelect = (list) => {
    setSelectedList(list);
    fetchTasks(list.id);
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const newList = {
        title: newListTitle,
        team_id: user?.team_id || null,
        owner_id: user?.id || null,
      };
      const res = await axios.post(`${API_URL}/lists/`, newList, {
        headers: getAuthHeaders(),
      });
      setLists([...lists, res.data]);
      setNewListTitle("");
    } catch (err) {
      alert("Error adding list");
      console.error(err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedList) return;
    try {
      const newTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        done: false,
        list_id: selectedList.id,
      };
      const res = await axios.post(`${API_URL}/tasks/`, newTask, {
        headers: getAuthHeaders(),
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (err) {
      alert("Error adding task");
      console.error(err);
    }
  };

  const toggleTaskDone = async (task) => {
    try {
      const updated = { ...task, done: !task.done };
      const res = await axios.put(`${API_URL}/tasks/${task.id}`, updated, {
        headers: getAuthHeaders(),
      });
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      alert("Error updating task");
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h1>To-Do Lists</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New list title"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="input-field"
          style={{ marginRight: 10, width: 'auto' }}
        />
        <button onClick={handleAddList} className="button-primary">Add List</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleListSelect(list)}
            style={{
              padding: "10px 15px",
              backgroundColor: selectedList?.id === list.id ? "#007bff" : "#f8f9fa",
              color: selectedList?.id === list.id ? "white" : "#333",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            {list.title}
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Tasks for: {selectedList?.title || "No list selected"}</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ 
              marginBottom: 10, 
              padding: "10px", 
              backgroundColor: "#f8f9fa", 
              borderRadius: 5,
              display: "flex",
              alignItems: "center"
            }}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTaskDone(task)}
                style={{ marginRight: 10 }}
              />
              <span
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                  flex: 1,
                  fontWeight: "bold"
                }}
              >
                {task.title}
              </span>

              {task.description && (
                <span style={{
                  marginLeft: 8, 
                  color: "#666",
                  fontSize: "0.9em"
                }}>
                  {task.description}
                </span>
              )}
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No tasks in this list. Add some tasks below!
          </p>
        )}
      </div>

      {selectedList && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Add New Task</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="New task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: "200px" }}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: "200px" }}
            />
            <button onClick={handleAddTask} className="button-primary">Add Task</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList; 