from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.services.firebase_service import FirestoreUserService

router = APIRouter(prefix="/goals", tags=["goals"])
user_service = FirestoreUserService()

class Goal(BaseModel):
    title: str
    description: str
    category: str  # 'fitness' | 'nutrition' | 'hydration' | 'sleep' | 'wellness' | 'weight'
    targetValue: int
    currentValue: int = 0
    unit: str
    deadline: str  # ISO date string
    priority: str = 'medium'  # 'low' | 'medium' | 'high'
    status: str = 'active'  # 'active' | 'completed' | 'paused'

class GoalUpdate(BaseModel):
    currentValue: Optional[int] = None
    status: Optional[str] = None

# Create a new goal
@router.post("/{user_id}/goals")
def create_goal(user_id: str, goal: Goal):
    """Create a new goal for a user"""
    try:
        goal_data = goal.dict()
        goal_data['id'] = f"{user_id}_{datetime.now().timestamp()}"
        goal_data['createdDate'] = datetime.now().isoformat()
        
        success = user_service.create_goal(user_id, goal_data)
        if success:
            return {"success": True, "goal": goal_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to create goal")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all goals for a user
@router.get("/{user_id}/goals")
def get_user_goals(user_id: str, status: Optional[str] = None):
    """Get all goals for a user, optionally filtered by status"""
    try:
        goals = user_service.get_user_goals(user_id, status)
        return {"goals": goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Update goal progress
@router.put("/{user_id}/goals/{goal_id}")
def update_goal(user_id: str, goal_id: str, update: GoalUpdate):
    """Update goal progress or status"""
    try:
        success = user_service.update_goal(user_id, goal_id, update.dict(exclude_none=True))
        if success:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Goal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete a goal
@router.delete("/{user_id}/goals/{goal_id}")
def delete_goal(user_id: str, goal_id: str):
    """Delete a goal"""
    try:
        success = user_service.delete_goal(user_id, goal_id)
        if success:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Goal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get goal statistics
@router.get("/{user_id}/goals/stats")
def get_goal_stats(user_id: str):
    """Get goal statistics for a user"""
    try:
        stats = user_service.get_goal_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
