from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    members: List["User"] = Relationship(back_populates="team")
    lists: List["TodoList"] = Relationship(back_populates="team")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    password_hash: str
    role: str = Field(default="user")  # 'user' or 'admin'
    team_id: Optional[int] = Field(default=None, foreign_key="team.id")
    team: Optional[Team] = Relationship(back_populates="members")
    lists: List["TodoList"] = Relationship(back_populates="owner")

class TodoList(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    team_id: Optional[int] = Field(default=None, foreign_key="team.id")
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    team: Optional[Team] = Relationship(back_populates="lists")
    owner: Optional[User] = Relationship(back_populates="lists")
    tasks: List["Task"] = Relationship(back_populates="list")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    done: bool = False
    list_id: int = Field(foreign_key="todolist.id")
    list: Optional[TodoList] = Relationship(back_populates="tasks")
