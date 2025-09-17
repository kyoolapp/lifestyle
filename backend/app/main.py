from fastapi import FastAPI
from api import users, recipes, suggestions

app = FastAPI()

# Include routers for modular features
app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(suggestions.router)

@app.get('/')
def root():
    return {"message": "Kyool Backend is running!"}
