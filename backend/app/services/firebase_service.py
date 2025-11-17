import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from .timezone_utils import (
    get_utc_now,
    get_utc_now_iso,
    iso_to_utc_datetime,
    get_user_local_date,
    get_user_local_datetime,
    convert_utc_to_user_local,
    should_reset_daily_metrics,
    get_local_date_range,
    is_valid_timezone
)


#key_path = 'keys/lifestyle-health-kyool-firebase-adminsdk-fbsvc-08bd67c569.json'  # Default path if env var not set
# Use environment variable for service account key path, default to Cloud Run secret mount path
secret_keys = os.environ.get("FIREBASE_KEY_PATH")
#print(f"Using Firebase key path: {secret_keys}")
key_path= json.loads(secret_keys) 
#print(f"Decoded Firebase key path: {key_path}")

cred = credentials.Certificate(key_path)
if not firebase_admin._apps:
    # Initialize Firebase - let it auto-detect the storage bucket
    firebase_admin.initialize_app(cred)
db = firestore.client()

class FirestoreUserService:
    #Adding Weight log functionality
    def add_weight_log(self, user_id: str, weight: float, date: str, bmi: float = None, bmr: float = None, tdee: float = None):
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            logs = doc.to_dict().get('weight_logs', [])
            logs.append({'weight': weight, 'date': date, 'bmi': bmi, 'bmr': bmr, 'tdee': tdee})
            doc_ref.update({'weight_logs': logs})
            return True
        return False
    
    #Retrieving Weight log functionality
    def get_weight_logs(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return doc.to_dict().get('weight_logs', [])
        return []
    
    #Adding Water log functionality
    def log_water_intake(self, user_id: str, glasses: float):
        """
        Log water intake for today (in user's local timezone), creating or updating the daily record.
        Uses atomic increment to avoid race conditions with concurrent requests.
        Batches consecutive water logs within 30 seconds into a single activity event.
        Also updates the water logging streak automatically.
        
        Args:
            user_id: The user's Firebase ID.
            glasses: Amount of water in glasses to add to today's total.
            
        Returns:
            dict: Dictionary with 'glasses' (updated total) and 'streak' (updated streak data)
        """
        # Get user's local date based on stored timezone
        today = get_user_local_date(self._get_user_timezone(user_id))
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        
        now_utc_iso = get_utc_now_iso()
        
        try:
            # Try to atomically increment existing record
            water_log_ref.update({
                'glasses': firestore.Increment(glasses),
                'last_updated': now_utc_iso
            })
        except Exception:
            # Document doesn't exist, create it
            water_log_ref.set({
                'glasses': glasses,
                'date': today,
                'created_at': now_utc_iso,
                'last_updated': now_utc_iso
            })
        
        # Fetch updated water value
        doc = water_log_ref.get()
        glasses_total = doc.to_dict().get('glasses', glasses) if doc.exists else glasses
        
        # Create cumulative water event using a session document approach
        try:
            water_events_ref = db.collection('users').document(user_id).collection('water_events')
            session_ref = db.collection('users').document(user_id).collection('water_session').document('current')
            
            # Get or create the current session
            session_doc = session_ref.get()
            
            if session_doc.exists:
                session_data = session_doc.to_dict()
                session_timestamp = session_data.get('created_at', '')
                session_glasses = session_data.get('glasses', 0)
                
                # Parse timestamps to check if still within 30 seconds
                try:
                    from datetime import datetime
                    current_time = datetime.fromisoformat(now_utc_iso.replace('Z', '+00:00'))
                    session_time = datetime.fromisoformat(session_timestamp.replace('Z', '+00:00'))
                    time_diff = (current_time - session_time).total_seconds()
                    
                    if time_diff < 30:
                        # Still within 30 seconds, update existing session
                        session_ref.update({
                            'glasses': firestore.Increment(glasses),
                            'last_added_at': now_utc_iso
                        })
                    else:
                        # Outside 30 second window, save old session and create new one
                        # Save the old session to events
                        water_events_ref.add({
                            'glasses': session_glasses,
                            'created_at': session_timestamp,
                            'date': today,
                            'type': 'water_logged_session'
                        })
                        # Create new session
                        session_ref.set({
                            'glasses': glasses,
                            'created_at': now_utc_iso,
                            'last_added_at': now_utc_iso,
                            'date': today
                        })
                except Exception as e:
                    print(f"Error parsing timestamps: {e}")
                    # Fallback: just create a new event
                    water_events_ref.add({
                        'glasses': glasses,
                        'created_at': now_utc_iso,
                        'date': today,
                        'type': 'water_logged_session'
                    })
            else:
                # No existing session, create new one
                session_ref.set({
                    'glasses': glasses,
                    'created_at': now_utc_iso,
                    'last_added_at': now_utc_iso,
                    'date': today
                })
        except Exception as e:
            print(f"Error managing water session: {e}")
        
        # Update streak for water logging
        streak_data = self.update_streak(user_id, 'water')
        
        return {
            'glasses': glasses_total,
            'streak': streak_data
        }
    
    def set_water_intake(self, user_id: str, glasses: float):
        """
        Set the total water intake for today (in user's local timezone).
        Replaces the existing value instead of incrementing.
        Also creates cumulative water events for tracking activity changes.
        Also updates the water logging streak automatically.
        
        Args:
            user_id: The user's Firebase ID.
            glasses: Exact amount of water in glasses to set for today.
            
        Returns:
            dict: Dictionary with 'glasses' (set value) and 'streak' (updated streak data)
        """
        today = get_user_local_date(self._get_user_timezone(user_id))
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        now_utc_iso = get_utc_now_iso()
        
        # Get the old value to calculate delta
        old_glasses = 0
        doc = water_log_ref.get()
        if doc.exists:
            old_glasses = doc.to_dict().get('glasses', 0)
            # Update existing record, preserving created_at
            water_log_ref.update({
                'glasses': glasses,
                'last_updated': now_utc_iso
            })
        else:
            # Create new record
            water_log_ref.set({
                'glasses': glasses,
                'date': today,
                'created_at': now_utc_iso,
                'last_updated': now_utc_iso
            })
        
        # Calculate the delta (change) and create cumulative water event
        # Only create events if there's a change
        delta = glasses - old_glasses
        if delta != 0:
            try:
                water_events_ref = db.collection('users').document(user_id).collection('water_events')
                session_ref = db.collection('users').document(user_id).collection('water_session').document('current')
                
                # Get or create the current session
                session_doc = session_ref.get()
                
                if session_doc.exists:
                    session_data = session_doc.to_dict()
                    session_timestamp = session_data.get('created_at', '')
                    session_glasses = session_data.get('glasses', 0)
                    
                    # Parse timestamps to check if still within 30 seconds
                    try:
                        from datetime import datetime
                        current_time = datetime.fromisoformat(now_utc_iso.replace('Z', '+00:00'))
                        session_time = datetime.fromisoformat(session_timestamp.replace('Z', '+00:00'))
                        time_diff = (current_time - session_time).total_seconds()
                        
                        if time_diff < 30:
                            # Still within 30 seconds, update existing session
                            session_ref.update({
                                'glasses': firestore.Increment(delta),
                                'last_added_at': now_utc_iso
                            })
                        else:
                            # Outside 30 second window, save old session and create new one
                            # Save the old session to events
                            water_events_ref.add({
                                'glasses': session_glasses,
                                'created_at': session_timestamp,
                                'date': today,
                                'type': 'water_logged_session'
                            })
                            # Create new session
                            session_ref.set({
                                'glasses': delta,
                                'created_at': now_utc_iso,
                                'last_added_at': now_utc_iso,
                                'date': today
                            })
                    except Exception as e:
                        print(f"Error parsing timestamps: {e}")
                        # Fallback: just create a new event
                        water_events_ref.add({
                            'glasses': delta,
                            'created_at': now_utc_iso,
                            'date': today,
                            'type': 'water_logged_session'
                        })
                else:
                    # No existing session, create new one
                    session_ref.set({
                        'glasses': delta,
                        'created_at': now_utc_iso,
                        'last_added_at': now_utc_iso,
                        'date': today
                    })
            except Exception as e:
                print(f"Error managing water session: {e}")
        
        # Update streak for water logging
        streak_data = self.update_streak(user_id, 'water')
        
        return {
            'glasses': glasses,
            'streak': streak_data
        }
    
    def get_today_water_intake(self, user_id: str):
        """
        Get today's water intake (in user's local timezone).
        
        Args:
            user_id: The user's Firebase ID.
            
        Returns:
            float: Today's total water intake in glasses.
        """
        today = get_user_local_date(self._get_user_timezone(user_id))
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        doc = water_log_ref.get()
        
        if doc.exists:
            return doc.to_dict().get('glasses', 0)
        return 0
    
    def get_water_intake_history(self, user_id: str, days: int = 7):
        """
        Get water intake history for the last N days (in user's local timezone).
        
        Args:
            user_id: The user's Firebase ID.
            days: Number of past days to retrieve (default 7).
            
        Returns:
            list: List of dictionaries with 'date' and 'glasses' keys, sorted by date.
        """
        user_tz = self._get_user_timezone(user_id)
        date_range = get_local_date_range(user_tz, days)
        
        water_logs = []
        for date in date_range:
            water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(date)
            doc = water_log_ref.get()
            
            if doc.exists:
                water_logs.append({
                    'date': date,
                    'glasses': doc.to_dict().get('glasses', 0)
                })
            else:
                water_logs.append({
                    'date': date,
                    'glasses': 0
                })
        
        # Already sorted in descending order from get_local_date_range, so reverse for ascending
        return list(reversed(water_logs))
    
    # ============ GLOBAL STREAK LOGIC ============
    # These methods support streaks for any activity type (water, workout, food, etc.)
    
    def get_streak(self, user_id: str, streak_type: str = "water"):
        """
        Get the current streak for a user for a specific activity.
        
        Args:
            user_id: The user's Firebase ID.
            streak_type: Type of streak to retrieve (e.g., 'water', 'workout', 'food').
                        Allows reuse of this logic for different activities.
        
        Returns:
            dict: Streak data with keys:
                  - current_streak: Number of consecutive days
                  - last_logged_date: Date (YYYY-MM-DD) when activity was last logged
                  - start_date: Date when the current streak started
        """
        streak_ref = db.collection('users').document(user_id).collection('streaks').document(streak_type)
        doc = streak_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        
        # Return default streak if none exists
        return {
            'current_streak': 0,
            'last_logged_date': None,
            'start_date': None,
            'streak_type': streak_type
        }
    
    def update_streak(self, user_id: str, streak_type: str = "water") -> dict:
        """
        Update user's streak for a specific activity. Call this when user logs an activity.
        Automatically handles timezone-aware daily resets.
        
        Streak logic:
        - If user logs today: Increment streak by 1 (only once per day)
        - If user logs after missing a day: Reset streak to 1
        - If user logs after taking a day off: Streak becomes 1
        - Streak updates only once per calendar day (in user's timezone)
        
        Args:
            user_id: The user's Firebase ID.
            streak_type: Type of streak (e.g., 'water', 'workout', 'food').
        
        Returns:
            dict: Updated streak data
        """
        user_tz = self._get_user_timezone(user_id)
        today = get_user_local_date(user_tz)
        
        streak_ref = db.collection('users').document(user_id).collection('streaks').document(streak_type)
        streak_doc = streak_ref.get()
        
        if not streak_doc.exists:
            # First time logging this activity - start a new streak
            new_streak = {
                'current_streak': 1,
                'last_logged_date': today,
                'start_date': today,
                'streak_type': streak_type,
                'updated_at': get_utc_now_iso()
            }
            streak_ref.set(new_streak)
            return new_streak
        
        streak_data = streak_doc.to_dict()
        last_logged = streak_data.get('last_logged_date')
        current_count = streak_data.get('current_streak', 0)
        
        # If already logged today, don't update (once per day rule)
        if last_logged == today:
            print(f"User {user_id} already logged {streak_type} today. Streak not updated.")
            return streak_data
        
        # Calculate yesterday's date
        today_obj = datetime.strptime(today, '%Y-%m-%d').date()
        yesterday = (today_obj - timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Determine new streak count
        if last_logged == yesterday:
            # Logged yesterday - continue the streak
            new_count = current_count + 1
            start_date = streak_data.get('start_date')
        else:
            # Missed at least one day - reset to 1
            new_count = 1
            start_date = today
        
        # Update the streak
        updated_streak = {
            'current_streak': new_count,
            'last_logged_date': today,
            'start_date': start_date,
            'streak_type': streak_type,
            'updated_at': get_utc_now_iso()
        }
        streak_ref.update(updated_streak)
        
        return updated_streak
    
    def reset_streak(self, user_id: str, streak_type: str = "water"):
        """
        Manually reset a streak (rarely needed - usually handled automatically).
        
        Args:
            user_id: The user's Firebase ID.
            streak_type: Type of streak to reset.
        
        Returns:
            dict: Reset streak data
        """
        streak_ref = db.collection('users').document(user_id).collection('streaks').document(streak_type)
        reset_streak = {
            'current_streak': 0,
            'last_logged_date': None,
            'start_date': None,
            'streak_type': streak_type,
            'updated_at': get_utc_now_iso()
        }
        streak_ref.set(reset_streak)
        return reset_streak
    
    def get_all_streaks(self, user_id: str) -> dict:
        """
        Get all streaks for a user across all activity types.
        
        Args:
            user_id: The user's Firebase ID.
        
        Returns:
            dict: Dictionary mapping streak_type to streak data
        """
        streaks_ref = db.collection('users').document(user_id).collection('streaks')
        docs = streaks_ref.stream()
        
        all_streaks = {}
        for doc in docs:
            all_streaks[doc.id] = doc.to_dict()
        
        return all_streaks
    
    def log_body_fat(self, user_id: str, height: float, neck: float, waist: float, 
                     body_fat_percentage: float, hip: float = None):
        """
        Log body fat measurement with circumference measurements.
        Uses today's date in user's local timezone as the document ID.
        
        Args:
            user_id: The user's Firebase ID.
            height: Height in centimeters.
            neck: Neck circumference in centimeters.
            waist: Waist circumference in centimeters.
            body_fat_percentage: Calculated body fat percentage.
            hip: Hip circumference in centimeters (for women).
            
        Returns:
            dict: The created body fat log entry
        """
        today = get_user_local_date(self._get_user_timezone(user_id))
        now_utc_iso = get_utc_now_iso()
        
        body_fat_ref = db.collection('users').document(user_id).collection('body_fat_logs').document(today)
        
        body_fat_data = {
            'date': today,
            'height': height,
            'neck': neck,
            'waist': waist,
            'body_fat': body_fat_percentage,
            'timestamp': now_utc_iso,
            'created_at': now_utc_iso
        }
        
        if hip:
            body_fat_data['hip'] = hip
        
        body_fat_ref.set(body_fat_data)
        
        return {
            'id': today,
            'height': height,
            'neck': neck,
            'waist': waist,
            'hip': hip,
            'body_fat': body_fat_percentage,
            'timestamp': now_utc_iso
        }
    
    def get_latest_body_fat(self, user_id: str):
        """
        Get the most recent body fat measurement for a user.
        
        Args:
            user_id: The user's Firebase ID.
            
        Returns:
            dict: The latest body fat log entry, or None if no logs exist
        """
        body_fat_ref = db.collection('users').document(user_id).collection('body_fat_logs')
        docs = body_fat_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(1).stream()
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        
        return None
    
    def get_body_fat_history(self, user_id: str, limit: int = 100):
        """
        Get body fat measurement history for a user.
        
        Args:
            user_id: The user's Firebase ID.
            limit: Maximum number of records to return.
            
        Returns:
            list: Array of body fat log entries sorted by date (newest first)
        """
        body_fat_ref = db.collection('users').document(user_id).collection('body_fat_logs')
        docs = body_fat_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).stream()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            history.append(data)
        
        return history
    #Getting user by ID
    def generate_avatar_url(self, name: str, username: str):
        """Generate a fallback avatar URL using ui-avatars.com"""
        display_name = name or username or "User"
        # Use the full name for better avatar generation - ui-avatars.com will extract initials
        return f"https://ui-avatars.com/api/?name={display_name}&background=0d8488&color=fff&size=128"
    
    def get_user(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        if not doc.exists:
            return None
        
        user_data = doc.to_dict()
        
        # Ensure user has an avatar - only generate fallback if no avatar exists
        if not user_data.get('avatar'):
            name = user_data.get('name', '')
            username = user_data.get('username', '')
            fallback_avatar = self.generate_avatar_url(name, username)
            user_data['avatar'] = fallback_avatar
            
            # Update the user document with the fallback avatar only if none exists
            try:
                db.collection('users').document(user_id).update({'avatar': fallback_avatar})
            except Exception as e:
                print(f"Failed to update avatar for user {user_id}: {e}")
        # If avatar already exists (including Google photos), keep it as is
        
        return user_data
    
    #Creating user with initial weight log
    def create_user(self, user_id: str, user_data: dict):
        """
        Create a new user with initial data.
        
        Args:
            user_id: The user's Firebase ID.
            user_data: Dictionary with user fields. Should include 'timezone' if available.
            
        Returns:
            str: The created user's ID.
        """
        username = user_data.get('username')
        if self.is_username_taken(username):
            raise ValueError("Username already taken")

        if not self.is_valid_username(username):
            raise ValueError("Invalid username format")
        
        # DEBUG: Log what timezone was received
        print(f"DEBUG: user_data received: {user_data}")
        print(f"DEBUG: timezone in user_data: {user_data.get('timezone')}")
        
        # Capture timezone from request (default to UTC if not provided)
        user_tz = user_data.get('timezone')
        print(f"DEBUG: user_tz after get: {user_tz}")
        print(f"DEBUG: type of user_tz: {type(user_tz)}")
        print(f"DEBUG: repr of user_tz: {repr(user_tz)}")
        
        is_valid = is_valid_timezone(user_tz)
        print(f"DEBUG: is_valid_timezone('{user_tz}') returned: {is_valid}")
        
        if not is_valid:
            print(f"DEBUG: timezone '{user_tz}' is invalid, setting to UTC")
            user_tz = 'UTC'
        print(f"DEBUG: final user_tz: {user_tz}")
        user_data['timezone'] = user_tz
        
        # Set initial last_activity timestamp
        user_data['last_activity'] = get_utc_now_iso()
        
        # Store initial weight log using values from frontend
        weight = user_data.get('weight')
        bmi = user_data.get('bmi')
        bmr = user_data.get('bmr')
        tdee = user_data.get('tdee')
        initial_log = {
            'weight': weight,
            'date': get_utc_now_iso(),
            'bmi': bmi,
            'bmr': bmr,
            'tdee': tdee
        } if weight else None
        user_data['weight_logs'] = [initial_log] if initial_log else []
        
        db.collection('users').document(user_id).set(user_data)
        return user_id

    def update_user(self, user_id: str, user_data: dict):
        username = user_data.get('username')
        if username:
            # Check if username is taken by another user
            users = db.collection('users').where('username', '==', username).stream()
            for user in users:
                if user.id != user_id:
                    raise ValueError("Username already taken")
        
        # Check if document exists before updating
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            # If document doesn't exist, create it instead (handles edge case of missing user)
            db.collection('users').document(user_id).set(user_data)
        else:
            # Document exists, perform update
            db.collection('users').document(user_id).update(user_data)
        return True

    def delete_user(self, user_id: str):
        db.collection('users').document(user_id).delete()
        return True
    
    def get_user_by_email(self, email: str):
        users = db.collection('users').where('email', '==', email).stream()
        for user in users:
            user_data = user.to_dict()
            user_data['id'] = user.id  # Include the document ID
            return user_data
        return None
    

    def is_valid_username(self, username:str):
        return re.match(r'^[a-zA-Z0-9_.]{6,20}$', username) is not None


    def is_username_taken(self, username: str) -> bool:
        if not username:
            return False
        users = db.collection('users').where('username', '==', username).stream()
        return any(users)
    
    def update_user_activity(self, user_id: str):
        """
        Update user's last_active timestamp to track online status.
        
        Args:
            user_id: The user's Firebase ID.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            user_ref = db.collection('users').document(user_id)
            timestamp = get_utc_now_iso()
            #print(f"DEBUG: Updating last_active for user {user_id} with timestamp: {timestamp}")
            user_ref.update({'last_active': timestamp})
            #print(f"DEBUG: Successfully updated last_active for user {user_id}")
            return True
        except Exception as e:
            print(f"Error updating user activity: {e}")
            return False
    
    def is_user_online(self, last_active_str: str) -> bool:
        """
        Check if user is online based on last_active timestamp.
        A user is considered online if their last activity was within 5 minutes.
        
        Args:
            last_active_str: ISO format UTC timestamp string.
            
        Returns:
            bool: True if user is online, False otherwise.
        """
        if not last_active_str:
            return False
        try:
            last_active_utc = iso_to_utc_datetime(last_active_str)
            if not last_active_utc:
                return False
            
            now_utc = get_utc_now()
            # Consider user online if last active within 5 minutes
            return (now_utc - last_active_utc) < timedelta(minutes=5)
        except Exception as e:
            print(f"Error checking online status: {e}")
            return False
        

    #Friends functionality   
    def send_friend_request(self, sender_id: str, receiver_id: str):
        """Send a friend request"""
        if sender_id == receiver_id:
            raise ValueError("Cannot send friend request to yourself")
        
        # Check if already friends (this should be reliable after remove_friend cleanup)
        if self.are_friends(sender_id, receiver_id):
            raise ValueError("Already friends with this user")
        
        # Check for any existing pending requests only
        # Direction 1: sender -> receiver
        pending_requests1 = db.collection('friend_requests').where('sender_id', '==', sender_id).where('receiver_id', '==', receiver_id).where('status', '==', 'pending').stream()
        for req in pending_requests1:
            raise ValueError("Friend request already sent")
        
        # Direction 2: receiver -> sender (maybe they sent us a request)
        pending_requests2 = db.collection('friend_requests').where('sender_id', '==', receiver_id).where('receiver_id', '==', sender_id).where('status', '==', 'pending').stream()
        for req in pending_requests2:
            raise ValueError("This user has already sent you a friend request. Check your incoming requests.")
        
        # Create friend request
        request_data = {
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'status': 'pending',
            'created_at': get_utc_now_iso(),
            'updated_at': get_utc_now_iso()
        }
        
        # Add to friend_requests collection
        db.collection('friend_requests').add(request_data)
        return True

    def accept_friend_request(self, receiver_id: str, sender_id: str):
        """Accept a friend request and make both users friends"""
        # Find the pending request
        requests = db.collection('friend_requests').where('sender_id', '==', sender_id).where('receiver_id', '==', receiver_id).where('status', '==', 'pending').stream()
        
        request_doc = None
        for req in requests:
            request_doc = req
            break
        
        if not request_doc:
            raise ValueError("Friend request not found")
        
        # Update request status to accepted
        request_doc.reference.update({
            'status': 'accepted',
            'updated_at': get_utc_now_iso()
        })
        
        # Add each user to the other's friends list
        sender_ref = db.collection('users').document(sender_id)
        receiver_ref = db.collection('users').document(receiver_id)
        
        # Add receiver to sender's friends
        sender_doc = sender_ref.get()
        if sender_doc.exists:
            sender_data = sender_doc.to_dict()
            sender_friends = sender_data.get('friends', [])
            if receiver_id not in sender_friends:
                sender_friends.append(receiver_id)
                sender_ref.update({'friends': sender_friends})
        
        # Add sender to receiver's friends
        receiver_doc = receiver_ref.get()
        if receiver_doc.exists:
            receiver_data = receiver_doc.to_dict()
            receiver_friends = receiver_data.get('friends', [])
            if sender_id not in receiver_friends:
                receiver_friends.append(sender_id)
                receiver_ref.update({'friends': receiver_friends})
        
        return True

    def reject_friend_request(self, receiver_id: str, sender_id: str):
        """Reject a friend request"""
        # Find the pending request
        requests = db.collection('friend_requests').where('sender_id', '==', sender_id).where('receiver_id', '==', receiver_id).where('status', '==', 'pending').stream()
        
        request_doc = None
        for req in requests:
            request_doc = req
            break
        
        if not request_doc:
            raise ValueError("Friend request not found")
        
        # Update request status to rejected
        request_doc.reference.update({
            'status': 'rejected',
            'updated_at': get_utc_now_iso()
        })
        
        return True

    def revoke_friend_request(self, sender_id: str, receiver_id: str):
        """Revoke/cancel a pending friend request that was sent"""
        # Find the pending request sent by sender to receiver
        requests = db.collection('friend_requests').where('sender_id', '==', sender_id).where('receiver_id', '==', receiver_id).where('status', '==', 'pending').stream()
        
        request_doc = None
        for req in requests:
            request_doc = req
            break
        
        if not request_doc:
            raise ValueError("No pending friend request found to revoke")
        
        # Delete the request (completely remove it)
        request_doc.reference.delete()
        
        return True

    def get_friend_request_status(self, sender_id: str, receiver_id: str):
        """Get the status of a friend request between two users"""
        # Check Direction 1: sender_id -> receiver_id
        requests1 = db.collection('friend_requests').where('sender_id', '==', sender_id).where('receiver_id', '==', receiver_id).stream()
        for req in requests1:
            return req.to_dict().get('status')
        
        # Check Direction 2: receiver_id -> sender_id
        requests2 = db.collection('friend_requests').where('sender_id', '==', receiver_id).where('receiver_id', '==', sender_id).stream()
        for req in requests2:
            return req.to_dict().get('status')
        
        return None

    def debug_friendship_data(self, user1_id: str, user2_id: str):
        """Debug method to check friendship and request data between two users"""
        # Check friendship status
        are_friends = self.are_friends(user1_id, user2_id)
        
        # Get all friend requests between these users
        all_requests = []
        requests1 = db.collection('friend_requests').where('sender_id', '==', user1_id).where('receiver_id', '==', user2_id).stream()
        for req in requests1:
            data = req.to_dict()
            data['request_id'] = req.id
            all_requests.append(data)
        
        requests2 = db.collection('friend_requests').where('sender_id', '==', user2_id).where('receiver_id', '==', user1_id).stream()
        for req in requests2:
            data = req.to_dict()
            data['request_id'] = req.id
            all_requests.append(data)
        
        return {
            'are_friends': are_friends,
            'friend_requests': all_requests
        }

    def get_incoming_friend_requests(self, user_id: str):
        """Get pending friend requests sent to this user"""
        requests = db.collection('friend_requests').where('receiver_id', '==', user_id).where('status', '==', 'pending').stream()
        
        incoming_requests = []
        for req in requests:
            req_data = req.to_dict()
            sender_id = req_data.get('sender_id')
            
            # Get sender's profile
            sender_doc = db.collection('users').document(sender_id).get()
            if sender_doc.exists:
                sender_data = sender_doc.to_dict()
                last_active = sender_data.get('last_active')
                incoming_requests.append({
                    'request_id': req.id,
                    'sender_id': sender_id,
                    'username': sender_data.get('username'),
                    'name': sender_data.get('name'),
                    'avatar': sender_data.get('avatar'),
                    'online': self.is_user_online(last_active),
                    'created_at': req_data.get('created_at')
                })
        
        return incoming_requests

    def get_outgoing_friend_requests(self, user_id: str):
        """Get pending friend requests sent by this user"""
        requests = db.collection('friend_requests').where('sender_id', '==', user_id).where('status', '==', 'pending').stream()
        
        outgoing_requests = []
        for req in requests:
            req_data = req.to_dict()
            receiver_id = req_data.get('receiver_id')
            
            # Get receiver's profile
            receiver_doc = db.collection('users').document(receiver_id).get()
            if receiver_doc.exists:
                receiver_data = receiver_doc.to_dict()
                last_active = receiver_data.get('last_active')
                outgoing_requests.append({
                    'request_id': req.id,
                    'receiver_id': receiver_id,
                    'username': receiver_data.get('username'),
                    'name': receiver_data.get('name'),
                    'avatar': receiver_data.get('avatar'),
                    'online': self.is_user_online(last_active),
                    'created_at': req_data.get('created_at')
                })
        
        return outgoing_requests

    def remove_friend(self, user_id: str, friend_id: str):
        """Remove a friend from user's friends list and clean up friend request records"""
        # Remove from current user's list
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            friends = user_data.get('friends', [])
            if friend_id in friends:
                friends.remove(friend_id)
                user_ref.update({'friends': friends})
        
        # Remove from friend's list
        friend_ref = db.collection('users').document(friend_id)
        friend_doc = friend_ref.get()
        if friend_doc.exists:
            friend_data = friend_doc.to_dict()
            friend_friends = friend_data.get('friends', [])
            if user_id in friend_friends:
                friend_friends.remove(user_id)
                friend_ref.update({'friends': friend_friends})
        
        # Clean up friend request records (both directions)
        # Direction 1: user_id -> friend_id
        requests1 = db.collection('friend_requests').where('sender_id', '==', user_id).where('receiver_id', '==', friend_id).stream()
        for req in requests1:
            req.reference.delete()
        
        # Direction 2: friend_id -> user_id  
        requests2 = db.collection('friend_requests').where('sender_id', '==', friend_id).where('receiver_id', '==', user_id).stream()
        for req in requests2:
            req.reference.delete()
        
        return True

    def get_user_friends(self, user_id: str):
        """Get list of user's friends with their details"""
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return []
        
        user_data = user_doc.to_dict()
        friend_ids = user_data.get('friends', [])
        
        friends = []
        for friend_id in friend_ids:
            friend_doc = db.collection('users').document(friend_id).get()
            if friend_doc.exists:
                friend_data = friend_doc.to_dict()
                last_active = friend_data.get('last_active')
                
                # Ensure friend has an avatar - only generate if none exists
                avatar = friend_data.get('avatar')
                if not avatar:
                    avatar = self.generate_avatar_url(friend_data.get('name', ''), friend_data.get('username', ''))
                    # Save the generated avatar back to the database only if none exists
                    try:
                        db.collection('users').document(friend_id).update({'avatar': avatar})
                    except Exception as e:
                        print(f"Failed to update avatar for friend {friend_id}: {e}")
                # If avatar already exists (including Google photos), keep it as is
                
                friends.append({
                    'id': friend_id,
                    'username': friend_data.get('username'),
                    'name': friend_data.get('name'),
                    'avatar': avatar,
                    'online': self.is_user_online(last_active),
                    'last_active': last_active
                })
        
        return friends

    # ===== Timezone & Daily Reset Helper Methods =====
    
    def _get_user_timezone(self, user_id: str) -> str:
        """
        Helper method to retrieve user's stored timezone.
        
        Args:
            user_id: The user's Firebase ID.
            
        Returns:
            str: IANA timezone name (e.g., 'Asia/Kolkata'), or 'UTC' if not set.
        """
        try:
            user_doc = db.collection('users').document(user_id).get()
            if user_doc.exists:
                user_tz = user_doc.to_dict().get('timezone')
                if user_tz and is_valid_timezone(user_tz):
                    return user_tz
        except Exception as e:
            print(f"Error retrieving user timezone: {e}")
        
        return 'UTC'
    
    def check_and_reset_daily_metrics(self, user_id: str) -> bool:
        """
        Check if a new day has started for the user and reset daily metrics if needed.
        
        This method:
        1. Fetches the user's last_activity timestamp and timezone.
        2. Converts both UTC timestamps to the user's local timezone.
        3. Compares local dates—if different, a new day has started.
        4. Resets daily metrics (e.g., water intake) to 0 and updates last_activity.
        
        Args:
            user_id: The user's Firebase ID.
            
        Returns:
            bool: True if metrics were reset, False otherwise.
        """
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return False
        
        user_data = user_doc.to_dict()
        last_activity_utc_iso = user_data.get('last_activity')
        user_tz = user_data.get('timezone', 'UTC')
        
        # Check if new day has started
        if not should_reset_daily_metrics(last_activity_utc_iso, user_tz):
            return False
        
        # Get today's date in user's local timezone
        today_local = get_user_local_date(user_tz)
        
        # Reset water intake for today
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today_local)
        water_log_ref.set({
            'glasses': 0,
            'date': today_local,
            'created_at': get_utc_now_iso(),
            'last_updated': get_utc_now_iso()
        })
        
        # Update last_activity to mark that we've reset for this day
        user_ref = db.collection('users').document(user_id)
        user_ref.update({'last_activity': get_utc_now_iso()})
        
        print(f"Reset daily metrics for user {user_id} on {today_local}")
        return True

    def are_friends(self, user_id: str, other_user_id: str):
        """Check if two users are friends"""
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            friends = user_data.get('friends', [])
            return other_user_id in friends
        return False

    def get_user_activities(self, user_id: str, limit: int = 50) -> list:
        """
        Get recent activities for a user aggregated from various sources:
        - Water intake logs
        - Friend additions/removals
        - Body fat measurements
        - Streaks and achievements
        - Friend request acceptances
        
        Args:
            user_id: The user's Firebase ID
            limit: Maximum number of activities to return
        
        Returns:
            List of activity dictionaries sorted by timestamp (newest first)
        """
        activities = []
        
        try:
            user_doc = db.collection('users').document(user_id).get()
            if not user_doc.exists:
                return []
            
            user_data = user_doc.to_dict()
            user_name = user_data.get('name', 'User')
            user_avatar = user_data.get('avatar', '')
            
            # ===== 1. WATER INTAKE ACTIVITIES =====
            # Fetch water events and current session
            try:
                water_events_ref = db.collection('users').document(user_id).collection('water_events')
                water_session_ref = db.collection('users').document(user_id).collection('water_session').document('current')
                
                # Fetch all events and sort in memory (avoids index requirement)
                water_events_docs = list(water_events_ref.stream())
                
                # Also check if there's a current session in progress
                current_session_doc = water_session_ref.get()
                if current_session_doc.exists:
                    water_events_docs.append(current_session_doc)
                
                # Sort by created_at descending (newest first)
                water_events_docs.sort(key=lambda x: x.to_dict().get('created_at', ''), reverse=True)
                
                for event in water_events_docs[:50]:  # Limit to 50 most recent
                    event_data = event.to_dict()
                    glasses = event_data.get('glasses', 0)
                    created_at = event_data.get('created_at', '')
                    
                    if glasses > 0 and created_at:
                        # Format description with the number of glasses
                        glasses_word = 'glass' if glasses == 1 else 'glasses'
                        activities.append({
                            'type': 'nutrition',
                            'title': f'You logged water intake',
                            'description': f'Logged {glasses} {glasses_word} of water',
                            'timestamp': created_at,
                            'user': {
                                'name': user_name,
                                'avatar': user_avatar
                            },
                            'icon_type': 'water'
                        })
            except Exception as e:
                print(f"Error fetching water events: {e}")
                # Fallback to old water_logs for backwards compatibility
                try:
                    water_logs_ref = db.collection('users').document(user_id).collection('water_logs')
                    water_logs = water_logs_ref.limit(20).stream()
                    
                    for log in water_logs:
                        log_data = log.to_dict()
                        glasses = log_data.get('glasses', 0)
                        created_at = log_data.get('created_at', '') or log_data.get('last_updated', '')
                        
                        if glasses > 0 and created_at:
                            glasses_word = 'glass' if glasses == 1 else 'glasses'
                            activities.append({
                                'type': 'nutrition',
                                'title': f'You logged water intake',
                                'description': f'Logged {glasses} {glasses_word} of water',
                                'timestamp': created_at,
                                'user': {
                                    'name': user_name,
                                    'avatar': user_avatar
                                },
                                'icon_type': 'water'
                            })
                except Exception as e2:
                    print(f"Error fetching water logs fallback: {e2}")
            
            # ===== 2. BODY FAT ACTIVITIES =====
            try:
                body_fat_ref = db.collection('users').document(user_id).collection('body_fat_logs')
                body_fat_logs = body_fat_ref.limit(20).stream()
                
                for log in body_fat_logs:
                    log_data = log.to_dict()
                    body_fat_pct = log_data.get('body_fat_percentage', 0)
                    created_at = log_data.get('created_at', '')
                    
                    if body_fat_pct > 0 and created_at:
                        activities.append({
                            'type': 'achievement',
                            'title': f'You logged body measurements',
                            'description': f'Body fat: {body_fat_pct}%',
                            'timestamp': created_at,
                            'user': {
                                'name': user_name,
                                'avatar': user_avatar
                            },
                            'icon_type': 'body_fat'
                        })
            except Exception as e:
                print(f"Error fetching body fat logs: {e}")
            
            # ===== 3. FRIEND ACTIVITIES =====
            # Get accepted friend requests to show when user added friends OR was added by friends
            try:
                # Case 1: When this user sent the friend request (user_id is sender)
                sent_requests_ref = db.collection('friend_requests').where('sender_id', '==', user_id).where('status', '==', 'accepted')
                sent_requests = sent_requests_ref.limit(20).stream()
                
                for req in sent_requests:
                    req_data = req.to_dict()
                    receiver_id = req_data.get('receiver_id')
                    updated_at = req_data.get('updated_at', '') or req_data.get('created_at', '')
                    
                    if receiver_id and updated_at:
                        # Get friend's info
                        friend_doc = db.collection('users').document(receiver_id).get()
                        if friend_doc.exists:
                            friend_data = friend_doc.to_dict()
                            friend_name = friend_data.get('name', 'Unknown')
                            
                            activities.append({
                                'type': 'social',
                                'title': f'You added a friend',
                                'description': f'Added {friend_name}',
                                'timestamp': updated_at,
                                'user': {
                                    'name': user_name,
                                    'avatar': user_avatar
                                },
                                'icon_type': 'friend_add'
                            })
                
                # Case 2: When another user sent friend request to this user (user_id is receiver)
                received_requests_ref = db.collection('friend_requests').where('receiver_id', '==', user_id).where('status', '==', 'accepted')
                received_requests = received_requests_ref.limit(20).stream()
                
                for req in received_requests:
                    req_data = req.to_dict()
                    sender_id = req_data.get('sender_id')
                    updated_at = req_data.get('updated_at', '') or req_data.get('created_at', '')
                    
                    if sender_id and updated_at:
                        # Get sender's info
                        sender_doc = db.collection('users').document(sender_id).get()
                        if sender_doc.exists:
                            sender_data = sender_doc.to_dict()
                            sender_name = sender_data.get('name', 'Unknown')
                            
                            activities.append({
                                'type': 'social',
                                'title': f'{sender_name} added you as a friend',
                                'description': f'Your friendship is now active',
                                'timestamp': updated_at,
                                'user': {
                                    'name': user_name,
                                    'avatar': user_avatar
                                },
                                'icon_type': 'friend_add'
                            })
            except Exception as e:
                print(f"Error fetching friend activities: {e}")
            
            # ===== 4. STREAK ACTIVITIES =====
            try:
                streaks_ref = db.collection('users').document(user_id).collection('streaks')
                streaks = streaks_ref.stream()
                
                for streak_doc in streaks:
                    streak_data = streak_doc.to_dict()
                    current_streak = streak_data.get('current_streak', 0)
                    streak_type = streak_data.get('streak_type', 'unknown')
                    updated_at = streak_data.get('updated_at', '')
                    
                    # Only show streaks of 3+ days or major milestones (5, 10, 14, 30, 60, 90, 100, etc.)
                    if updated_at and current_streak > 0:
                        is_milestone = current_streak in [5, 10, 14, 21, 30, 60, 90, 100, 365]
                        if current_streak >= 3 or is_milestone:
                            streak_emoji = {
                                'water': '💧',
                                'workout': '💪',
                                'food': '🍎'
                            }.get(streak_type, '🔥')
                            
                            activities.append({
                                'type': 'achievement',
                                'title': f'{streak_emoji} {current_streak}-day {streak_type} streak!',
                                'description': f'Keep it up! Your {streak_type} streak is going strong',
                                'timestamp': updated_at,
                                'user': {
                                    'name': user_name,
                                    'avatar': user_avatar
                                },
                                'icon_type': f'streak_{streak_type}'
                            })
            except Exception as e:
                print(f"Error fetching streak activities: {e}")
            
            # ===== 5. SORT BY TIMESTAMP AND LIMIT =====
            # Convert all timestamps to ISO strings for consistent sorting
            activities_with_normalized_timestamps = []
            for activity in activities:
                timestamp = activity.get('timestamp', '')
                # Handle Firestore DatetimeWithNanoseconds objects
                if hasattr(timestamp, 'isoformat'):
                    # It's a datetime object, convert to ISO string
                    timestamp_str = timestamp.isoformat()
                else:
                    # It's already a string
                    timestamp_str = str(timestamp) if timestamp else ''
                
                activity['timestamp'] = timestamp_str
                activities_with_normalized_timestamps.append(activity)
            
            # Sort by timestamp descending (newest first)
            activities_with_normalized_timestamps.sort(
                key=lambda x: x.get('timestamp', ''),
                reverse=True
            )
            
            return activities_with_normalized_timestamps[:limit]
            
        except Exception as e:
            print(f"Error fetching activities for user {user_id}: {e}")
            import traceback
            traceback.print_exc()
            return []
