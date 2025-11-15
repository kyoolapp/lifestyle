from fastapi import APIRouter, HTTPException, Body, Query, Request
from app.models.user_model import UserProfile
from app.services.firebase_service import FirestoreUserService
from app.services.firebase_service import db  # Import the Firestore client

router = APIRouter(prefix="/users", tags=["users"])
user_service = FirestoreUserService()


# --- STATIC ROUTES FIRST ---



@router.post("/fix-avatars")
def fix_user_avatars():
    """Fix missing avatars for all users - prioritize Google photos, then generate fallback"""
    from firebase_admin import auth
    
    users_ref = db.collection('users')
    all_users = users_ref.stream()
    
    fixed_count = 0
    restored_google_photos = 0
    
    for user in all_users:
        data = user.to_dict()
        user_id = user.id
        email = data.get('email')
        
        # Check if user needs avatar fix
        current_avatar = data.get('avatar')
        needs_fix = not current_avatar
        
        # Also check if current avatar is a generated one that could be replaced with Google photo
        if current_avatar and 'ui-avatars.com' in current_avatar:
            needs_fix = True
        
        if needs_fix and email:
            try:
                # Try to get the user's Firebase Auth record to get Google photo
                auth_user = auth.get_user_by_email(email)
                if auth_user.photo_url:
                    # User has Google photo, use it
                    db.collection('users').document(user_id).update({'avatar': auth_user.photo_url})
                    restored_google_photos += 1
                    fixed_count += 1
                    print(f"Restored Google photo for user {user_id}: {data.get('name', email)}")
                    continue
            except Exception as e:
                print(f"Could not get Firebase Auth data for {email}: {e}")
        
        # If no Google photo available and no avatar, generate fallback
        if not current_avatar:
            name = data.get('name', '')
            username = data.get('username', '')
            fallback_avatar = user_service.generate_avatar_url(name, username)
            
            try:
                db.collection('users').document(user_id).update({'avatar': fallback_avatar})
                fixed_count += 1
                print(f"Generated fallback avatar for user {user_id}: {name or username}")
            except Exception as e:
                print(f"Failed to update avatar for user {user_id}: {e}")
    
    return {
        "message": f"Fixed avatars for {fixed_count} users",
        "google_photos_restored": restored_google_photos,
        "fallback_avatars_generated": fixed_count - restored_google_photos
    }

@router.get("/search")
def search_users(q: str = Query(..., min_length=1)):
    users_ref = db.collection('users')
    query_lower = q.lower()
    
    # Get all users and filter on the server side for better search capabilities
    # Note: For production with large datasets, consider using dedicated search services
    all_users = users_ref.stream()
    
    user_matches = []
    for user in all_users:
        data = user.to_dict()
        username = data.get("username", "").lower()
        name = data.get("name", "").lower()
        
        # Check if query matches username or name (case-insensitive, partial match)
        if query_lower in username or query_lower in name:
            last_active = data.get("last_active")
            is_online = user_service.is_user_online(last_active) if last_active else False
            
            # Ensure user has an avatar
            avatar = data.get("avatar")
            if not avatar:
                avatar = user_service.generate_avatar_url(data.get("name", ""), data.get("username", ""))
                # Save the generated avatar back to the database
                try:
                    db.collection('users').document(user.id).update({'avatar': avatar})
                except Exception as e:
                    print(f"Failed to update avatar for user {user.id}: {e}")
            # Keep existing avatar (including Google photos) as is
            
            user_matches.append({
                "id": user.id,
                "username": data.get("username"),
                "name": data.get("name"),
                "avatar": avatar,
                "online": is_online,
                # Add match score for sorting (exact matches first, then starts with, then contains)
                "match_score": (
                    0 if username == query_lower or name == query_lower else
                    1 if username.startswith(query_lower) or name.startswith(query_lower) else
                    2
                )
            })
    
    # Sort by match relevance and limit results
    user_matches.sort(key=lambda x: (x['match_score'], x['username'] or ''))
    
    # Remove match_score from final results and limit to 50 results
    users = [{k: v for k, v in user.items() if k != 'match_score'} for user in user_matches[:50]]
    
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
        user_dict = user.dict()
        print(f"DEBUG API: user_id = {user_id}")
        print(f"DEBUG API: user.dict() = {user_dict}")
        print(f"DEBUG API: timezone field = {user_dict.get('timezone')}")
        user_service.create_user(user_id, user_dict)
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

@router.patch("/{user_id}", response_model=dict)
def partial_update_user(user_id: str, updates: dict = Body(...)):
    """Partial update - only updates provided fields"""
    try:
        success = user_service.update_user(user_id, updates)
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
    print(f"DEBUG API: /activity endpoint called for user {user_id}")
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

# Water intake logging endpoints
@router.post("/{user_id}/water/log")
def log_water_intake(user_id: str, request: dict):
    """Add glasses to today's water intake and update streak"""
    try:
        glasses = request.get('glasses')
        if glasses is None or glasses <= 0:
            raise HTTPException(status_code=400, detail="glasses must be a positive number")
        
        result = user_service.log_water_intake(user_id, glasses)
        return {
            "success": True,
            "new_total": result.get('glasses'),
            "glasses_added": glasses,
            "streak": result.get('streak')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/water/set")
def set_water_intake(user_id: str, request: dict):
    """Set total water intake for today and update streak"""
    try:
        glasses = request.get('glasses')
        if glasses is None or glasses < 0:
            raise HTTPException(status_code=400, detail="glasses must be a non-negative number")
        
        result = user_service.set_water_intake(user_id, glasses)
        return {
            "success": True,
            "total": result.get('glasses'),
            "streak": result.get('streak')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/water/today")
def get_today_water_intake(user_id: str):
    """Get today's water intake"""
    try:
        glasses = user_service.get_today_water_intake(user_id)
        return {"glasses": glasses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/water/history")
def get_water_history(user_id: str, days: int = 7):
    """Get water intake history for the last N days"""
    try:
        if days > 30:
            days = 30  # Limit to 30 days max
        
        history = user_service.get_water_intake_history(user_id, days)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ STREAK ENDPOINTS (Reusable for any activity type) ============

@router.get("/{user_id}/streak/{streak_type}")
def get_streak(user_id: str, streak_type: str = "water"):
    """
    Get current streak for a user for a specific activity type.
    
    Args:
        user_id: The user's Firebase ID
        streak_type: Type of streak (water, workout, food, etc.)
    
    Returns:
        Streak data with current_streak, last_logged_date, start_date
    """
    try:
        streak = user_service.get_streak(user_id, streak_type)
        return streak
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/streak/{streak_type}/update")
def update_streak(user_id: str, streak_type: str = "water"):
    """
    Update streak for a user. Call this when an activity is logged.
    Automatically handles timezone-aware daily resets.
    
    Args:
        user_id: The user's Firebase ID
        streak_type: Type of streak (water, workout, food, etc.)
    
    Returns:
        Updated streak data
    """
    try:
        streak = user_service.update_streak(user_id, streak_type)
        return streak
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/streaks")
def get_all_streaks(user_id: str):
    """
    Get all streaks for a user across all activity types.
    
    Args:
        user_id: The user's Firebase ID
    
    Returns:
        Dictionary mapping streak_type to streak data
    """
    try:
        streaks = user_service.get_all_streaks(user_id)
        return {"streaks": streaks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/streak/{streak_type}/reset")
def reset_streak(user_id: str, streak_type: str = "water"):
    """
    Manually reset a streak (rarely needed).
    
    Args:
        user_id: The user's Firebase ID
        streak_type: Type of streak to reset
    
    Returns:
        Reset streak data
    """
    try:
        streak = user_service.reset_streak(user_id, streak_type)
        return streak
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- BODY FAT ENDPOINTS ---

@router.post("/{user_id}/body-fat/log")
def log_body_fat(user_id: str, body_data: dict = Body(...)):
    """
    Log a body fat measurement for a user.
    
    Args:
        user_id: The user's Firebase ID
        body_data: Dictionary with 'height', 'neck', 'waist', 'hip' (optional), 'body_fat_percentage'
    
    Returns:
        The created body fat log entry
    """
    try:
        height = body_data.get('height')
        neck = body_data.get('neck')
        waist = body_data.get('waist')
        hip = body_data.get('hip')
        body_fat_percentage = body_data.get('body_fat_percentage')
        
        if not all([height, neck, waist, body_fat_percentage]):
            raise HTTPException(status_code=400, detail="Missing required fields: height, neck, waist, body_fat_percentage")
        
        result = user_service.log_body_fat(user_id, height, neck, waist, body_fat_percentage, hip)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/body-fat/latest")
def get_latest_body_fat(user_id: str):
    """
    Get the most recent body fat measurement for a user.
    
    Args:
        user_id: The user's Firebase ID
    
    Returns:
        The latest body fat log entry, or 404 if none exists
    """
    try:
        result = user_service.get_latest_body_fat(user_id)
        if not result:
            raise HTTPException(status_code=404, detail="No body fat measurements found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/body-fat/history")
def get_body_fat_history(user_id: str, limit: int = Query(100, ge=1, le=500)):
    """
    Get body fat measurement history for a user.
    
    Args:
        user_id: The user's Firebase ID
        limit: Maximum number of records to return (default 100, max 500)
    
    Returns:
        Array of body fat log entries sorted by date (newest first)
    """
    try:
        result = user_service.get_body_fat_history(user_id, limit)
        return {"logs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ ACTIVITY FEED ENDPOINT ============

@router.get("/{user_id}/activities")
def get_user_activities(user_id: str, limit: int = Query(50, ge=1, le=100)):
    """
    Get recent activities for a user (water logged, friends added/removed, achievements, etc.).
    Returns activities sorted by timestamp (newest first).
    
    Activity types:
    - water: User logged water intake
    - fitness: User completed a workout or logged body fat
    - social: User added/removed friend or accepted friend request
    - achievement: Streak milestones, goals reached
    
    Args:
        user_id: The user's Firebase ID
        limit: Maximum number of activities to return (default 50, max 100)
    
    Returns:
        Array of activity objects with: type, title, description, timestamp, related_user (optional)
    """
    try:
        activities = user_service.get_user_activities(user_id, limit)
        return {"activities": activities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))