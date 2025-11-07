"""
Timezone and datetime utility functions for handling user-local time operations.

This module provides reusable functions for:
- Converting UTC timestamps to user's local timezone
- Computing user's local date string
- Checking if a new day has started for the user
- Normalizing timestamps to ISO UTC format
"""

from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from typing import Optional


def get_utc_now() -> datetime:
    """
    Get current time as a timezone-aware UTC datetime.
    
    Returns:
        datetime: Current time in UTC with timezone info.
    """
    return datetime.now(timezone.utc)


def get_utc_now_iso() -> str:
    """
    Get current time as ISO format UTC string.
    
    Returns:
        str: Current UTC time as ISO string (e.g., '2025-11-02T10:30:45.123456+00:00').
    """
    return get_utc_now().isoformat()


def iso_to_utc_datetime(iso_string: str) -> Optional[datetime]:
    """
    Convert ISO format string to timezone-aware UTC datetime object.
    
    Args:
        iso_string: ISO formatted datetime string (e.g., '2025-11-02T10:30:45+00:00').
        
    Returns:
        datetime: Timezone-aware UTC datetime, or None if parsing fails.
    """
    try:
        # Handle 'Z' suffix (UTC indicator in ISO 8601)
        clean_string = iso_string.replace('Z', '+00:00')
        dt = datetime.fromisoformat(clean_string)
        # Ensure UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt
    except (ValueError, TypeError):
        return None


def get_user_local_date(user_timezone: str) -> str:
    """
    Get the current date in the user's local timezone (IANA timezone name).
    
    Args:
        user_timezone: IANA timezone name (e.g., 'Asia/Kolkata', 'America/New_York').
                      If invalid or None, defaults to 'UTC'.
        
    Returns:
        str: Date string in format 'YYYY-MM-DD' in the user's local timezone.
    """
    try:
        tz = ZoneInfo(user_timezone)
    except Exception:
        # Fallback to UTC if timezone is invalid
        tz = timezone.utc
    
    now_utc = get_utc_now()
    local_now = now_utc.astimezone(tz)
    
    return local_now.strftime('%Y-%m-%d')


def get_user_local_datetime(user_timezone: str) -> datetime:
    """
    Get current time as a timezone-aware datetime in the user's local timezone.
    
    Args:
        user_timezone: IANA timezone name (e.g., 'Asia/Kolkata', 'America/New_York').
                      If invalid or None, defaults to 'UTC'.
        
    Returns:
        datetime: Timezone-aware datetime in user's local timezone.
    """
    try:
        tz = ZoneInfo(user_timezone)
    except Exception:
        tz = timezone.utc
    
    now_utc = get_utc_now()
    return now_utc.astimezone(tz)


def convert_utc_to_user_local(utc_dt: datetime, user_timezone: str) -> datetime:
    """
    Convert a UTC datetime to the user's local timezone.
    
    Args:
        utc_dt: UTC timezone-aware datetime object.
        user_timezone: IANA timezone name.
        
    Returns:
        datetime: Timezone-aware datetime in user's local timezone.
    """
    try:
        tz = ZoneInfo(user_timezone)
    except Exception:
        tz = timezone.utc
    
    # Ensure input is UTC
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    elif utc_dt.tzinfo != timezone.utc:
        utc_dt = utc_dt.astimezone(timezone.utc)
    
    return utc_dt.astimezone(tz)


def should_reset_daily_metrics(last_activity_utc_iso: Optional[str], user_timezone: str) -> bool:
    """
    Check if a new day has started for the user in their local timezone.
    
    Compares the local date of the last activity with the current local date.
    If they differ, a new day has started in the user's timezone.
    
    Args:
        last_activity_utc_iso: Last activity timestamp as ISO UTC string (or None).
        user_timezone: IANA timezone name.
        
    Returns:
        bool: True if a new day has started, False otherwise.
    """
    if not last_activity_utc_iso:
        # First time, no reset needed
        return False
    
    try:
        last_activity_utc = iso_to_utc_datetime(last_activity_utc_iso)
        if not last_activity_utc:
            return False
        
        tz = ZoneInfo(user_timezone)
    except Exception:
        return False
    
    # Convert both times to user's local timezone
    last_activity_local = last_activity_utc.astimezone(tz)
    now_utc = get_utc_now()
    now_local = now_utc.astimezone(tz)
    
    # Compare local dates
    last_date = last_activity_local.strftime('%Y-%m-%d')
    current_date = now_local.strftime('%Y-%m-%d')
    
    return last_date != current_date


def get_local_date_range(user_timezone: str, days: int = 7) -> list:
    """
    Get a list of date strings for the past N days in the user's local timezone.
    
    Args:
        user_timezone: IANA timezone name.
        days: Number of days to generate (default 7).
        
    Returns:
        list: List of date strings in format 'YYYY-MM-DD', sorted in descending order (newest first).
    """
    try:
        tz = ZoneInfo(user_timezone)
    except Exception:
        tz = timezone.utc
    
    now_utc = get_utc_now()
    now_local = now_utc.astimezone(tz)
    
    date_range = []
    for i in range(days):
        date_local = (now_local - timedelta(days=i)).strftime('%Y-%m-%d')
        date_range.append(date_local)
    
    return date_range


def is_valid_timezone(timezone_name: str) -> bool:
    """
    Check if a timezone name is valid (IANA timezone database).
    
    Args:
        timezone_name: IANA timezone name to validate.
        
    Returns:
        bool: True if valid, False otherwise.
    """
    try:
        ZoneInfo(timezone_name)
        print(f"DEBUG: is_valid_timezone() - '{timezone_name}' is valid.")
        return True
    except Exception as e:
        print(f"DEBUG: is_valid_timezone() exception for '{timezone_name}': {type(e).__name__}: {e}")
        return False


def get_browser_timezone_js_snippet() -> str:
    """
    Get JavaScript snippet for capturing browser timezone (for frontend use).
    
    Returns:
        str: JavaScript code snippet that returns user's timezone.
    """
    return """
    // Get user's timezone from browser
    const getUserTimezone = () => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    };
    // Usage: send this value to backend during signup/profile update
    // timezone: getUserTimezone()  // e.g., "Asia/Kolkata"
    """
