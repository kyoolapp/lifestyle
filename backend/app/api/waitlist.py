from fastapi import APIRouter, HTTPException, Body
from app.services.firebase_service import db
from datetime import datetime
from typing import List, Dict, Any
import uuid

router = APIRouter(prefix="/waitlist", tags=["waitlist"])

@router.post("/join")
def join_waitlist(
    person_type: str = Body(...),
    activity_level: str = Body(...),
    current_situation: str = Body(...),
    desired_results: str = Body(...),
    biggest_challenge: str = Body(...),
    previous_attempts: str = Body(...),
    budget: str = Body(...),
    email: str = Body(...),
    phone: str = Body(None)
):
    """Add a new person to the waitlist"""
    try:
        # Check if email already exists in waitlist
        existing_entries = db.collection('waitlist').where('email', '==', email).stream()
        for entry in existing_entries:
            raise HTTPException(status_code=400, detail="Email already registered in waitlist")
        
        # Create waitlist entry
        waitlist_entry = {
            "id": str(uuid.uuid4()),
            "person_type": person_type,
            "activity_level": activity_level,
            "current_situation": current_situation,
            "desired_results": desired_results,
            "biggest_challenge": biggest_challenge,
            "previous_attempts": previous_attempts,
            "budget": budget,
            "email": email,
            "phone": phone,
            "joined_at": datetime.utcnow(),
            "status": "active",  # active, contacted, converted
            "priority_score": calculate_priority_score(person_type, budget, current_situation),
            "tags": generate_tags(person_type, activity_level, current_situation, desired_results)
        }
        
        # Save to Firestore
        doc_ref = db.collection('waitlist').document(waitlist_entry["id"])
        doc_ref.set(waitlist_entry)
        
        # TODO: Send confirmation email and WhatsApp message here
        
        return {
            "success": True,
            "message": "Successfully joined the waitlist",
            "waitlist_id": waitlist_entry["id"],
            "position": get_waitlist_position(waitlist_entry["id"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error joining waitlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to join waitlist")

@router.get("/stats")
def get_waitlist_stats():
    """Get waitlist statistics"""
    try:
        waitlist_ref = db.collection('waitlist')
        
        # Count total entries
        total_entries = len(list(waitlist_ref.stream()))
        
        # Count by person type
        executives = len(list(waitlist_ref.where('person_type', '==', 'executive').stream()))
        professionals = len(list(waitlist_ref.where('person_type', '==', 'professional').stream()))
        students = len(list(waitlist_ref.where('person_type', '==', 'student').stream()))
        
        # Count by budget (high value prospects)
        high_budget = len(list(waitlist_ref.where('budget', 'in', ['500-plus', 'flexible', '200-500']).stream()))
        
        return {
            "total_entries": total_entries,
            "by_type": {
                "executives": executives,
                "professionals": professionals,
                "students": students
            },
            "high_value_prospects": high_budget
        }
        
    except Exception as e:
        print(f"Error getting waitlist stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get waitlist statistics")

@router.get("/entries")
def get_waitlist_entries(limit: int = 50, status: str = None):
    """Get waitlist entries (admin only - should add auth later)"""
    try:
        query = db.collection('waitlist').order_by('joined_at', direction='DESCENDING')
        
        if status:
            query = query.where('status', '==', status)
            
        entries = query.limit(limit).stream()
        
        waitlist_data = []
        for entry in entries:
            data = entry.to_dict()
            # Convert datetime to string for JSON serialization
            if 'joined_at' in data:
                data['joined_at'] = data['joined_at'].isoformat() if data['joined_at'] else None
            waitlist_data.append(data)
        
        return {
            "entries": waitlist_data,
            "count": len(waitlist_data)
        }
        
    except Exception as e:
        print(f"Error getting waitlist entries: {e}")
        raise HTTPException(status_code=500, detail="Failed to get waitlist entries")

@router.put("/entries/{waitlist_id}/status")
def update_waitlist_status(waitlist_id: str, status: str = Body(...)):
    """Update waitlist entry status"""
    try:
        if status not in ['active', 'contacted', 'converted']:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        doc_ref = db.collection('waitlist').document(waitlist_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Waitlist entry not found")
        
        doc_ref.update({
            'status': status,
            'updated_at': datetime.utcnow()
        })
        
        return {"success": True, "message": f"Status updated to {status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating waitlist status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")

def calculate_priority_score(person_type: str, budget: str, current_situation: str) -> int:
    """Calculate priority score for waitlist entry"""
    score = 0
    
    # Person type scoring
    if person_type == 'executive':
        score += 10
    elif person_type == 'professional':
        score += 7
    elif person_type == 'student':
        score += 3
    
    # Budget scoring
    budget_scores = {
        'flexible': 15,
        '500-plus': 12,
        '200-500': 8,
        '100-200': 5,
        '50-100': 3,
        'under-50': 1
    }
    score += budget_scores.get(budget, 0)
    
    # Urgency scoring based on current situation
    urgent_situations = ['stressed', 'health-concerns', 'no-time']
    if current_situation in urgent_situations:
        score += 5
    
    return score

def generate_tags(person_type: str, activity_level: str, current_situation: str, desired_results: str) -> List[str]:
    """Generate tags for easier filtering and segmentation"""
    tags = [person_type, activity_level, current_situation, desired_results]
    
    # Add additional tags based on combinations
    if person_type == 'executive' and current_situation == 'no-time':
        tags.append('time-pressed-executive')
    
    if activity_level == 'sedentary' and desired_results == 'fitness-routine':
        tags.append('fitness-beginner')
    
    if current_situation == 'stressed' and desired_results == 'stress-management':
        tags.append('stress-focused')
    
    return list(set(tags))  # Remove duplicates

def get_waitlist_position(waitlist_id: str) -> int:
    """Get position in waitlist based on join date"""
    try:
        # Get the entry
        doc = db.collection('waitlist').document(waitlist_id).get()
        if not doc.exists:
            return -1
        
        entry_data = doc.to_dict()
        joined_at = entry_data.get('joined_at')
        
        if not joined_at:
            return -1
        
        # Count entries that joined before this one
        earlier_entries = db.collection('waitlist').where('joined_at', '<', joined_at).stream()
        position = len(list(earlier_entries)) + 1
        
        return position
        
    except Exception as e:
        print(f"Error calculating waitlist position: {e}")
        return -1