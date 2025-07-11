from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import Team
from typing import List

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/", response_model=List[Team])
def get_teams(session: Session = Depends(get_session)):
    return session.exec(select(Team)).all()

@router.post("/", response_model=Team)
def create_team(team: Team, session: Session = Depends(get_session)):
    session.add(team)
    session.commit()
    session.refresh(team)
    return team
