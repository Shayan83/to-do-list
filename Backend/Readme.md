
## 📘 To-Do List Backend (FastAPI + SQLModel)

## 📦 Installation

```bash
git clone <your-repo-url>
cd todo_backend
pip install -r requirements.txt
```

---

## ⚙️ Running the Server

```bash
uvicorn main:app --reload
```

The app will start at:
📍 `http://127.0.0.1:8000`

Swagger UI is available at:
📘 `http://127.0.0.1:8000/docs`

---

## 🧪 Sample API Calls (Using `curl`)

> You can also test all endpoints in `/docs` UI.

### ✅ Create a Team

```bash
curl -X POST http://127.0.0.1:8000/teams/ \
     -H "Content-Type: application/json" \
     -d '{"id": 1, "name": "Dev Team"}'
```

### ✅ Create a User

```bash
curl -X POST http://127.0.0.1:8000/users/ \
     -H "Content-Type: application/json" \
     -d '{"id": 1, "name": "Alice", "email": "alice@example.com", "team_id": 1}'
```

### ✅ Create a To-Do List

```bash
curl -X POST http://127.0.0.1:8000/lists/ \
     -H "Content-Type: application/json" \
     -d '{"id": 1, "title": "Sprint Tasks", "team_id": 1, "owner_id": 1}'
```

### ✅ Create a Task

```bash
curl -X POST http://127.0.0.1:8000/tasks/ \
     -H "Content-Type: application/json" \
     -d '{"id": 1, "title": "Fix bug", "description": "Null pointer crash", "done": false, "list_id": 1}'
```

### ✅ Get All Users

```bash
curl http://127.0.0.1:8000/users/
```

### ✅ Get All Tasks

```bash
curl http://127.0.0.1:8000/tasks/
```

---

## 📁 Folder Structure

```
todo_backend/
├── main.py              # Entry point
├── models.py            # SQLModel models
├── database.py          # DB engine & session
├── .env                 # SQLite DB config
├── requirements.txt     # Python dependencies
├── routers/
│   ├── users.py
│   ├── teams.py
│   ├── lists.py
│   └── tasks.py
```
