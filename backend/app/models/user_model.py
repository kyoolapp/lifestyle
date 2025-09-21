from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    username: str
    name: str
    email: str
    phone_number: Optional[str] = None
    height: float = None
    weight: float
    age: int = None
    activity_level: Optional[str] = None
    food_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    bmi: Optional[float] = None
    bmr: Optional[float] = None
    maintenance_calories: Optional[float] = None
    gender: Optional[str] = None
    date_joined: Optional[str] = None