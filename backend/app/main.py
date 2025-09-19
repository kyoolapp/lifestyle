from fastapi import FastAPI
from app.api import users, recipes, suggestions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for modular features
app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(suggestions.router)

@app.get('/')
def root():
    return {"message": "Kyool Backend is running!"}
