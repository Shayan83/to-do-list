from sqlmodel import SQLModel, create_engine
from models import Team, User, TodoList, Task, Invite
from database import engine


def setup_database():
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    setup_database()
