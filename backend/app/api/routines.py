from fastapi import APIRouter, HTTPException, Body, Depends
from app.services.firebase_service import FirestoreUserService
from app.core.auth import verify_firebase_token
from typing import List, Optional
import json
import os

router = APIRouter(prefix="/users", tags=["routines"])
user_service = FirestoreUserService()

# Load exercises database
EXERCISES_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'exercises.json')
def load_exercises_db():
    try:
        with open(EXERCISES_DB_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading exercises database: {e}")
        return {"exercises": [], "targetMuscles": [], "equipment": []}


@router.post("/{user_id}/routines")
async def create_routine(
    user_id: str,
    routine_data: dict = Body(...),
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Create and save a routine template.
    
    Request body:
    {
        "name": "Push Day",
        "exercises": [
            {
                "id": "exercise_id",
                "name": "Bench Press",
                "target": "chest",
                "equipment": "barbell",
                "sets": [
                    {"setNumber": 1, "weight": 225, "reps": 5},
                    {"setNumber": 2, "weight": 225, "reps": 5}
                ]
            }
        ],
        "notes": "Optional routine notes"
    }
    """
    try:
        routine_name = routine_data.get('name')
        exercises = routine_data.get('exercises', [])
        notes = routine_data.get('notes', '')
        
        if not routine_name or not exercises:
            raise HTTPException(status_code=400, detail="Missing required fields: name, exercises")
        
        result = user_service.save_routine(
            user_id=user_id,
            routine_name=routine_name,
            exercises=exercises,
            notes=notes
        )
        
        return {
            "status": "success",
            "message": f"Routine '{routine_name}' saved successfully",
            "data": result
        }
        
    except Exception as e:
        print(f"Error creating routine for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/routines")
async def get_routines(
    user_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get all saved routine templates for the user.
    """
    try:
        routines = user_service.get_routines(user_id)
        
        return {
            "status": "success",
            "data": routines,
            "total": len(routines)
        }
        
    except Exception as e:
        print(f"Error fetching routines for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/routines/{routine_id}")
async def get_routine(
    user_id: str,
    routine_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get a specific routine template by ID.
    """
    try:
        routine = user_service.get_routine(user_id, routine_id)
        
        if not routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        return {
            "status": "success",
            "data": routine
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching routine {routine_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}/routines/{routine_id}")
async def update_routine(
    user_id: str,
    routine_id: str,
    routine_data: dict = Body(...),
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Update an existing routine template.
    """
    try:
        result = user_service.update_routine(user_id, routine_id, routine_data)
        
        return {
            "status": "success",
            "message": "Routine updated successfully",
            "data": result
        }
        
    except Exception as e:
        print(f"Error updating routine {routine_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/routines/{routine_id}")
async def delete_routine(
    user_id: str,
    routine_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Delete a routine template.
    """
    try:
        user_service.delete_routine(user_id, routine_id)
        
        return {
            "status": "success",
            "message": "Routine deleted successfully"
        }
        
    except Exception as e:
        print(f"Error deleting routine {routine_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== EXERCISE ENDPOINTS ==========

def format_exercise(ex: dict) -> dict:
    """Convert ExerciseDB format to API format."""
    return {
        "id": ex.get("exerciseId", ""),
        "name": ex.get("name", ""),
        "gifUrl": ex.get("gifUrl", ""),
        "targetMuscles": ex.get("targetMuscles", []),
        "bodyParts": ex.get("bodyParts", []),
        "equipments": ex.get("equipments", []),
        "secondaryMuscles": ex.get("secondaryMuscles", []),
        "instructions": ex.get("instructions", [])
    }


@router.get("/exercises/filters")
async def get_exercise_filters():
    """
    Get available exercise filters (target muscles and equipment).
    """
    try:
        db = load_exercises_db()
        bodyparts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'bodyparts.json')
        equipments_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'equipments.json')
        
        bodyparts = []
        equipments = []
        
        if os.path.exists(bodyparts_file):
            with open(bodyparts_file, 'r') as f:
                bodyparts = json.load(f)
        if os.path.exists(equipments_file):
            with open(equipments_file, 'r') as f:
                equipments = json.load(f)
        
        return {
            "status": "success",
            "data": {
                "bodyParts": bodyparts,
                "equipments": equipments
            }
        }
    except Exception as e:
        print(f"Error fetching exercise filters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercises/all")
async def get_all_exercises():
    """
    Get all available exercises.
    """
    try:
        db = load_exercises_db()
        exercises = [format_exercise(ex) for ex in db] if isinstance(db, list) else db.get("exercises", [])
        
        return {
            "status": "success",
            "data": exercises,
            "total": len(exercises)
        }
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercises/target/{target_muscle}")
async def get_exercises_by_target(target_muscle: str):
    """
    Get exercises for a specific target muscle.
    """
    try:
        db = load_exercises_db()
        exercises_list = db if isinstance(db, list) else db.get("exercises", [])
        exercises = [
            format_exercise(ex) for ex in exercises_list
            if target_muscle.lower() in [t.lower() for t in ex.get("targetMuscles", [])]
        ]
        
        return {
            "status": "success",
            "data": exercises,
            "total": len(exercises)
        }
    except Exception as e:
        print(f"Error fetching exercises for target {target_muscle}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercises/equipment/{equipment}")
async def get_exercises_by_equipment(equipment: str):
    """
    Get exercises for a specific equipment type.
    """
    try:
        db = load_exercises_db()
        exercises_list = db if isinstance(db, list) else db.get("exercises", [])
        exercises = [
            format_exercise(ex) for ex in exercises_list
            if equipment.lower() in [e.lower() for e in ex.get("equipments", [])]
        ]
        
        return {
            "status": "success",
            "data": exercises,
            "total": len(exercises)
        }
    except Exception as e:
        print(f"Error fetching exercises for equipment {equipment}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercises/search")
async def search_exercises(q: str):
    """
    Search exercises by name.
    """
    try:
        db = load_exercises_db()
        exercises_list = db if isinstance(db, list) else db.get("exercises", [])
        query = q.lower()
        exercises = [
            format_exercise(ex) for ex in exercises_list
            if query in ex.get("name", "").lower()
        ]
        
        return {
            "status": "success",
            "data": exercises,
            "total": len(exercises)
        }
    except Exception as e:
        print(f"Error searching exercises: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/schedule")
async def save_schedule(
    user_id: str,
    schedule_data: dict = Body(...),
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Save the user's weekly workout schedule.
    
    Request body:
    {
        "monday": "routine_id_1",
        "tuesday": "routine_id_2",
        "wednesday": "routine_id_1",
        "thursday": "",
        "friday": "routine_id_3",
        "saturday": "routine_id_1",
        "sunday": ""
    }
    """
    print(f"\n[SCHEDULE ENDPOINT HIT] Incoming request")
    print(f"[DEBUG] User ID: {user_id}")
    print(f"[DEBUG] Decoded Token: {decoded_token}")
    print(f"[DEBUG] Schedule Data: {schedule_data}")
    
    try:
        print(f"[DEBUG] Calling user_service.save_schedule({user_id}, {schedule_data})")
        result = user_service.save_schedule(user_id, schedule_data)
        print(f"[DEBUG] Schedule saved successfully: {result}")
        
        return {
            "status": "success",
            "message": "Schedule saved successfully",
            "data": result
        }
        
    except Exception as e:
        print(f"[ERROR] Error saving schedule for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/schedule")
async def get_schedule(
    user_id: str,
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Get the user's weekly workout schedule.
    """
    try:
        schedule = user_service.get_schedule(user_id)
        
        return {
            "status": "success",
            "data": schedule or {}
        }
        
    except Exception as e:
        print(f"Error fetching schedule for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
