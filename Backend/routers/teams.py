from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Team, Invite, User
from typing import List
from pydantic import BaseModel
from routers.users import get_current_user

router = APIRouter(prefix="/teams", tags=["teams"])


class InviteRequest(BaseModel):
    email: str
    team_id: int


class InviteResponse(BaseModel):
    id: int
    email: str
    team_id: int
    invited_by: int
    status: str
    created_at: str
    team_name: str
    inviter_name: str


@router.get("/", response_model=List[Team])
def get_teams(session: Session = Depends(get_session)):
    return session.exec(select(Team)).all()


@router.post("/", response_model=Team)
def create_team(team: Team, session: Session = Depends(get_session)):
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.post("/invite/", response_model=InviteResponse)
def invite_user(
    invite_data: InviteRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Check if team exists
    team = session.exec(select(Team).where(Team.id == invite_data.team_id)).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if user is part of the team
    if current_user.team_id != invite_data.team_id:
        raise HTTPException(
            status_code=403, detail="You can only invite users to your own team"
        )

    # Check if user with this email already exists in the team
    existing_user = session.exec(
        select(User).where(User.email == invite_data.email)
    ).first()
    if existing_user and existing_user.team_id == invite_data.team_id:
        raise HTTPException(
            status_code=400, detail="User is already a member of this team"
        )

    # Check if invite already exists
    existing_invite = session.exec(
        select(Invite).where(
            Invite.email == invite_data.email,
            Invite.team_id == invite_data.team_id,
            Invite.status == "pending",
        )
    ).first()
    if existing_invite:
        raise HTTPException(
            status_code=400, detail="Invitation already sent to this email"
        )

    # Create new invite
    invite = Invite(
        email=invite_data.email, team_id=invite_data.team_id, invited_by=current_user.id
    )
    session.add(invite)
    session.commit()
    session.refresh(invite)

    # Get team and inviter names for response
    team = session.exec(select(Team).where(Team.id == invite.team_id)).first()
    inviter = session.exec(select(User).where(User.id == invite.invited_by)).first()

    return InviteResponse(
        id=invite.id,
        email=invite.email,
        team_id=invite.team_id,
        invited_by=invite.invited_by,
        status=invite.status,
        created_at=invite.created_at.isoformat(),
        team_name=team.name,
        inviter_name=inviter.name,
    )


@router.get("/invites/pending", response_model=List[InviteResponse])
def get_pending_invites(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Get pending invites for the current user's email
    invites = session.exec(
        select(Invite).where(
            Invite.email == current_user.email, Invite.status == "pending"
        )
    ).all()

    result = []
    for invite in invites:
        team = session.exec(select(Team).where(Team.id == invite.team_id)).first()
        inviter = session.exec(select(User).where(User.id == invite.invited_by)).first()

        result.append(
            InviteResponse(
                id=invite.id,
                email=invite.email,
                team_id=invite.team_id,
                invited_by=invite.invited_by,
                status=invite.status,
                created_at=invite.created_at.isoformat(),
                team_name=team.name,
                inviter_name=inviter.name,
            )
        )

    return result


@router.post("/invites/{invite_id}/accept")
def accept_invite(
    invite_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    invite = session.exec(select(Invite).where(Invite.id == invite_id)).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.email != current_user.email:
        raise HTTPException(
            status_code=403, detail="You can only accept invites sent to your email"
        )

    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Invite has already been processed")

    # Update invite status
    invite.status = "accepted"

    # Add user to team
    current_user.team_id = invite.team_id

    session.add(invite)
    session.add(current_user)
    session.commit()

    return {"message": "Invite accepted successfully"}


@router.post("/invites/{invite_id}/decline")
def decline_invite(
    invite_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    invite = session.exec(select(Invite).where(Invite.id == invite_id)).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.email != current_user.email:
        raise HTTPException(
            status_code=403, detail="You can only decline invites sent to your email"
        )

    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Invite has already been processed")

    # Update invite status
    invite.status = "declined"
    session.add(invite)
    session.commit()

    return {"message": "Invite declined successfully"}
