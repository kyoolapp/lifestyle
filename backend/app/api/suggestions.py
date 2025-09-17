from fastapi import APIRouter

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

@router.get("/")
def get_suggestions():
    return {"message": "Suggestions endpoint"}
