from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import TodoList
from database import get_session
from typing import List

router = APIRouter(prefix="/lists", tags=["lists"])

@router.get("/", response_model=List[TodoList])
def get_lists(session: Session = Depends(get_session)):
    return session.exec(select(TodoList)).all()

@router.post("/", response_model=TodoList)
def create_list(list_in: TodoList, session: Session = Depends(get_session)):
    session.add(list_in)
    session.commit()
    session.refresh(list_in)
    return list_in
