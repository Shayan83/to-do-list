from fastapi import FastAPI
from models import SQLModel
from database import engine
from routers import users, teams, lists, tasks
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Include routers
app.include_router(users.router)
app.include_router(teams.router)
app.include_router(lists.router)
app.include_router(tasks.router)
