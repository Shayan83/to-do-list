from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import TodoList, User
from database import get_session
from routers.users import get_current_user
from typing import List

router = APIRouter(prefix="/lists", tags=["lists"])

@router.get("/", response_model=List[TodoList])
def get_lists(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        return session.exec(select(TodoList)).all()
    return session.exec(select(TodoList).where(TodoList.team_id == current_user.team_id)).all()

@router.post("/", response_model=TodoList)
def create_list(list_in: TodoList, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Only allow creating lists for the user's team (unless admin)
    if current_user.role != "admin" and list_in.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not allowed to create lists for this team")
    session.add(list_in)
    session.commit()
    session.refresh(list_in)
    return list_in
