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
        last_active = data.get("last_active")
        is_online = user_service.is_user_online(last_active) if last_active else False
        users.append({
            "id": user.id,
            "username": data.get("username"),
            "name": data.get("name"),
            "avatar": data.get("avatar"),
            "online": is_online
        })
    return {"results": users}

# --- DYNAMIC ROUTES AFTER ---

# User profile endpoints
@router.get("/{user_id}")
def get_user(user_id: str):
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add online status to user data
    last_active = user.get("last_active")
    is_online = user_service.is_user_online(last_active) if last_active else False
    user["online"] = is_online
    
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

# Update user activity (heartbeat endpoint)
@router.post("/{user_id}/activity")
def update_user_activity(user_id: str):
    success = user_service.update_user_activity(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update activity")
    return {"success": True}

#Friend Request System

@router.post("/{user_id}/send-friend-request")
def send_friend_request(user_id: str, request: dict):
    try:
        receiver_id = request.get('receiver_id')
        if not receiver_id:
            raise HTTPException(status_code=400, detail="receiver_id is required")
        
        success = user_service.send_friend_request(user_id, receiver_id)
        return {"success": success, "message": "Friend request sent successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{user_id}/accept-friend-request")
def accept_friend_request(user_id: str, request: dict):
    try:
        sender_id = request.get('sender_id')
        if not sender_id:
            raise HTTPException(status_code=400, detail="sender_id is required")
        
        success = user_service.accept_friend_request(user_id, sender_id)
        return {"success": success, "message": "Friend request accepted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{user_id}/reject-friend-request")
def reject_friend_request(user_id: str, request: dict):
    try:
        sender_id = request.get('sender_id')
        if not sender_id:
            raise HTTPException(status_code=400, detail="sender_id is required")
        
        success = user_service.reject_friend_request(user_id, sender_id)
        return {"success": success, "message": "Friend request rejected"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{user_id}/revoke-friend-request")
def revoke_friend_request(user_id: str, request: dict):
    try:
        receiver_id = request.get('receiver_id')
        if not receiver_id:
            raise HTTPException(status_code=400, detail="receiver_id is required")
        
        success = user_service.revoke_friend_request(user_id, receiver_id)
        return {"success": success, "message": "Friend request revoked"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}/friend-requests/incoming")
def get_incoming_friend_requests(user_id: str):
    requests = user_service.get_incoming_friend_requests(user_id)
    return {"requests": requests}

@router.get("/{user_id}/friend-requests/outgoing")
def get_outgoing_friend_requests(user_id: str):
    requests = user_service.get_outgoing_friend_requests(user_id)
    return {"requests": requests}

@router.get("/{user_id}/friend-request-status/{other_user_id}")
def get_friend_request_status(user_id: str, other_user_id: str):
    status = user_service.get_friend_request_status(user_id, other_user_id)
    return {"status": status}

@router.post("/{user_id}/remove-friend")
def remove_friend(user_id: str, request: dict):
    try:
        friend_id = request.get('friend_id')
        if not friend_id:
            raise HTTPException(status_code=400, detail="friend_id is required")
        
        success = user_service.remove_friend(user_id, friend_id)
        return {"success": success, "message": "Friend removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}/friends")
def get_user_friends(user_id: str):
    friends = user_service.get_user_friends(user_id)
    return {"friends": friends}

@router.get("/{user_id}/friendship-status/{other_user_id}")
def check_friendship_status(user_id: str, other_user_id: str):
    are_friends = user_service.are_friends(user_id, other_user_id)
    return {"are_friends": are_friends}

@router.get("/{user_id}/debug-friendship/{other_user_id}")
def debug_friendship_data(user_id: str, other_user_id: str):
    debug_data = user_service.debug_friendship_data(user_id, other_user_id)
    return debug_data