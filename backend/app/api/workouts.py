from fastapi import APIRouter, HTTPException, Body, Request, Depends
from app.services.firebase_service import FirestoreUserService
from app.core.auth import verify_firebase_token
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["workouts"])
user_service = FirestoreUserService()


@router.post("/{user_id}/workouts/log")
async def log_workout(
    user_id: str,
    workout_data: dict = Body(...),
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Log a completed workout for the user.
    
    Request body:
    {
        "routine_name": "Push Day",
        "exercises_completed": [
            {"name": "Bench Press", "sets": 3, "reps": "8-12", "weight": "80kg"},
            {"name": "Push-ups", "sets": 3, "reps": "15-20", "weight": "bodyweight"}
        ],
        "duration_minutes": 45,
        "shared_with": ["friend_id_1", "friend_id_2"]  // optional
    }
    """
    try:
        routine_name = workout_data.get('routine_name')
        exercises_completed = workout_data.get('exercises_completed', [])
        duration_minutes = workout_data.get('duration_minutes', 0)
        shared_with = workout_data.get('shared_with', [])
        
        if not routine_name or not exercises_completed:
            raise HTTPException(status_code=400, detail="Missing required fields: routine_name, exercises_completed")
        
        # Log the workout
        result = user_service.log_workout(
            user_id=user_id,
            routine_name=routine_name,
            exercises_completed=exercises_completed,
            duration_minutes=duration_minutes,
            shared_with=shared_with
        )
        
        return {
            "status": "success",
            "message": f"Workout '{routine_name}' logged successfully",
            "data": result
        }
        
    except Exception as e:
        print(f"Error logging workout for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/workouts/history")
async def get_workout_history(
    user_id: str,
    limit: int = 50,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get user's workout history.
    """
    try:
        workouts = user_service.get_workout_history(user_id, limit=limit)
        
        return {
            "status": "success",
            "data": workouts,
            "total": len(workouts)
        }
        
    except Exception as e:
        print(f"Error fetching workout history for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/workouts/latest")
async def get_latest_workout(
    user_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get user's most recent workout.
    """
    try:
        workouts = user_service.get_workout_history(user_id, limit=1)
        
        if not workouts:
            return {
                "status": "success",
                "data": None,
                "message": "No workouts found"
            }
        
        return {
            "status": "success",
            "data": workouts[0]
        }
        
    except Exception as e:
        print(f"Error fetching latest workout for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/workouts/consistency")
async def get_workout_consistency(
    user_id: str,
    days: int = 7,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get user's workout consistency for the last N days.
    Returns daily workout data (whether a workout was completed each day).
    """
    try:
        consistency_data = user_service.get_workout_consistency(user_id, days=days)
        
        return {
            "status": "success",
            "data": consistency_data
        }
        
    except Exception as e:
        print(f"Error fetching workout consistency for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/workouts/today")
async def check_today_workout(
    user_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Check if user has already logged a workout today.
    """
    try:
        has_logged = user_service.has_logged_today(user_id)
        
        return {
            "status": "success",
            "data": {
                "has_logged_today": has_logged
            }
        }
        
    except Exception as e:
        print(f"Error checking today's workout for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

