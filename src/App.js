import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API_URL}/lists/`);
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
      const res = await axios.get(`${API_URL}/tasks/`);
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

  const handleAddList = async () => { // Posts a new task (for the selected list) to the backend.
    if (!newListTitle.trim()) return;
    try {
      const newList = { // todo: for user (database schema)
        title: newListTitle,
        team_id: null,
        owner_id: null,
      };
      const res = await axios.post(`${API_URL}/lists/`, newList);
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
      const res = await axios.post(`${API_URL}/tasks/`, newTask);
      setTasks([...tasks, res.data]);
      setNewTaskTitle("");
    } catch (err) {
      alert("Error adding task");
      console.error(err);
    }
  };

  const toggleTaskDone = async (task) => {
    try {
      const updated = { ...task, done: !task.done };
      const res = await axios.put(`${API_URL}/tasks/${task.id}`, updated);
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      alert("Error updating task");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>To-Do Lists</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New list title "
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
        />
        <button onClick={handleAddList}>Add List</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleListSelect(list)}
            style={{
              padding: "10px 15px",
              backgroundColor: selectedList?.id === list.id ? "#007bff" : "#eee",
              color: selectedList?.id === list.id ? "white" : "black",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {list.title}
          </button>
        ))}
      </div>

      <h2>Tasks for: {selectedList?.title || "No list selected"}</h2>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: 5 }}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTaskDone(task)}
            />
            <span
              style={{
                textDecoration: task.done ? "line-through" : "none",
                marginLeft: 8,
              }}
            >
              {task.title}
            </span>

            <span               
            style={{
                marginLeft: 8, color: "red"
              }}>
              {task.description}
            </span>

          </li>
        ))}
      </ul>

      {selectedList && (
        <div style={{ marginTop: 20 }}>
          <input
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <button onClick={handleAddTask}>Add Task</button>
        </div>
      )}
    </div>
  );
}

export default App;
