from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Task, TodoList, User
from routers.users import get_current_user, get_current_admin_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Get all tasks (filtered by team for regular users)
@router.get("/", response_model=List[Task])
def get_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return session.exec(select(Task)).all()
    # Get all lists for the user's team
    lists = session.exec(select(TodoList).where(TodoList.team_id == current_user.team_id)).all()
    list_ids = [l.id for l in lists]
    if not list_ids:
        return []
    return session.exec(select(Task).where(Task.list_id.in_(list_ids))).all()

# Create a new task
@router.post("/", response_model=Task)
def create_task(task: Task, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Only allow creating tasks in lists belonging to the user's team (unless admin)
    if current_user.role != "admin":
        todo_list = session.get(TodoList, task.list_id)
        if not todo_list or todo_list.team_id != current_user.team_id:
            raise HTTPException(status_code=403, detail="Not allowed to add tasks to this list")
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

# Get a specific task by ID
@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin":
        todo_list = session.get(TodoList, task.list_id)
        if not todo_list or todo_list.team_id != current_user.team_id:
            raise HTTPException(status_code=403, detail="Not allowed to view this task")
    return task

# Update a task (e.g. mark as done)
@router.put("/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: Task, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin":
        todo_list = session.get(TodoList, task.list_id)
        if not todo_list or todo_list.team_id != current_user.team_id:
            raise HTTPException(status_code=403, detail="Not allowed to update this task")
    for field, value in updated_task.dict(exclude_unset=True).items():
        setattr(task, field, value)
    session.commit()
    session.refresh(task)
    return task

# Delete a task
@router.delete("/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin":
        todo_list = session.get(TodoList, task.list_id)
        if not todo_list or todo_list.team_id != current_user.team_id:
            raise HTTPException(status_code=403, detail="Not allowed to delete this task")
    session.delete(task)
    session.commit()
    return {"detail": "Task deleted"}
