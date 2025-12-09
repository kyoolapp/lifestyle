from pydantic import BaseModel
from typing import List, Optional

class UnitPreferences(BaseModel):
    """User's preferred units for different measurement types"""
    weight: Optional[str] = 'kg'  # 'kg', 'lbs', 'stone'
    height: Optional[str] = 'cm'  # 'cm', 'ft_in'
    distance: Optional[str] = 'km'  # 'km', 'mi'
    energy: Optional[str] = 'kcal'  # 'kcal', 'kj'
    water: Optional[str] = 'ml'  # 'ml', 'cup', 'fl_oz'

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
    tdee: Optional[float] = None
    timezone: Optional[str] = 'UTC'  # IANA timezone name (e.g., 'Asia/Kolkata')
    unit_system: Optional[str] = 'metric'  # DEPRECATED: use unit_preferences instead
    unit_preferences: Optional[UnitPreferences] = UnitPreferences()