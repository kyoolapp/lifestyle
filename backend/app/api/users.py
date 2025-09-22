from fastapi import APIRouter, HTTPException
from app.models.user_model import UserProfile
from app.services.firebase_service import FirestoreUserService

router = APIRouter(prefix="/users", tags=["users"])
user_service = FirestoreUserService()

from fastapi import Body

@router.get("/{user_id}", response_model=UserProfile)
def get_user(user_id: str):
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/{user_id}", response_model=dict)
def create_user(user_id: str, user: UserProfile):
    user_service.create_user(user_id, user.dict())
    return {"id": user_id}

@router.put("/{user_id}", response_model=dict)
def update_user(user_id: str, user: UserProfile):
    success = user_service.update_user(user_id, user.dict())
    return {"success": success}

@router.delete("/{user_id}", response_model=dict)
def delete_user(user_id: str):
    success = user_service.delete_user(user_id)
    return {"success": success}

@router.get("/by-email/{email}", response_model=UserProfile)
def get_user_by_email(email: str):
    user = user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Weight log endpoints
@router.post("/{user_id}/weight-log")
def add_weight_log(user_id: str, weight: float = Body(...), date: str = Body(...)):
    success = user_service.add_weight_log(user_id, weight, date)
    return {"success": success}

@router.get("/{user_id}/weight-logs")
def get_weight_logs(user_id: str):
    return user_service.get_weight_logs(user_id)