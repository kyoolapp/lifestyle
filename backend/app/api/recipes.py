from fastapi import APIRouter

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.get("/")
def get_recipes():
    return {"message": "Recipe endpoint"}
