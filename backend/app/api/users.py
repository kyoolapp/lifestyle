from fastapi import APIRouter, HTTPException, Body, Query, Request
from app.models.user_model import UserProfile
from app.services.firebase_service import FirestoreUserService
from app.services.firebase_service import db  # Import the Firestore client

router = APIRouter(prefix="/users", tags=["users"])
user_service = FirestoreUserService()


# --- STATIC ROUTES FIRST ---

@router.get("/search")
def search_users(q: str = Query(..., min_length=1)):
    users_ref = db.collection('users')
    # Simple search by username or name (case-insensitive)
    results = users_ref.where('username', '>=', q).where('username', '<=', q + '\uf8ff').stream()
    users = []
    for user in results:
        data = user.to_dict()
        users.append({
            "id": user.id,
            "username": data.get("username"),
            "name": data.get("name"),
            "avatar": data.get("avatar"),
        })
    return {"results": users}

# --- DYNAMIC ROUTES AFTER ---

# User profile endpoints
@router.get("/{user_id}", response_model=UserProfile)
def get_user(user_id: str):
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/{user_id}", response_model=dict)
def create_user(user_id: str, user: UserProfile):
    try:
        user_service.create_user(user_id, user.dict())
        return {"id": user_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{user_id}", response_model=dict)
def update_user(user_id: str, user: UserProfile):
    try:
        success = user_service.update_user(user_id, user.dict())
        return {"success": success}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
def add_weight_log(user_id: str, weight: float = Body(...), date: str = Body(...), bmi: float = Body(...), bmr: float = Body(None), tdee: float = Body(None)):
    success = user_service.add_weight_log(user_id, weight, date, bmi, bmr, tdee)
    return {"success": success}

@router.get("/{user_id}/weight-logs")
def get_weight_logs(user_id: str):
    return user_service.get_weight_logs(user_id)

@router.get("/{user_id}/check-username")
def check_username(username: str):
    is_taken = user_service.is_username_taken(username)
    return {"available": not is_taken}

# Add friend/follow endpoint
@router.post("/{user_id}/add-friend")
def add_friend(user_id: str, body: dict = Body(...)):
    target_user_id = body.get("targetUserId")
    if not target_user_id:
        raise HTTPException(status_code=400, detail="targetUserId required")
    # Add target_user_id to user's 'friends' array
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user_doc.to_dict()
    friends = user_data.get('friends', [])
    if target_user_id not in friends:
        friends.append(target_user_id)
        user_ref.update({'friends': friends})
    return {"success": True}