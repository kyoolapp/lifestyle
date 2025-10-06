import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import re
from datetime import datetime, timedelta

key_path = 'keys/lifestyle-health-kyool-firebase-adminsdk-fbsvc-08bd67c569.json'  # Default path if env var not set
# Use environment variable for service account key path, default to Cloud Run secret mount path
#secret_keys = os.environ.get("FIREBASE_KEY_PATH")
#print(f"Using Firebase key path: {secret_keys}")
#key_path= json.loads(secret_keys) 
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
        """Log water intake for today, creating or updating the daily record"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Get or create water_logs subcollection for the user
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        
        doc = water_log_ref.get()
        if doc.exists:
            # Update existing daily record
            current_data = doc.to_dict()
            new_total = current_data.get('glasses', 0) + glasses
            water_log_ref.update({
                'glasses': new_total,
                'last_updated': datetime.now().isoformat()
            })
            return new_total
        else:
            # Create new daily record
            water_log_ref.set({
                'glasses': glasses,
                'date': today,
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            })
            return glasses
    
    def set_water_intake(self, user_id: str, glasses: float):
        """Set the total water intake for today (replace existing value)"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        
        water_log_ref.set({
            'glasses': glasses,
            'date': today,
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }, merge=True)
        
        return glasses
    
    def get_today_water_intake(self, user_id: str):
        """Get today's water intake"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(today)
        doc = water_log_ref.get()
        
        if doc.exists:
            return doc.to_dict().get('glasses', 0)
        return 0
    
    def get_water_intake_history(self, user_id: str, days: int = 7):
        """Get water intake history for the last N days"""
        water_logs = []
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            water_log_ref = db.collection('users').document(user_id).collection('water_logs').document(date)
            doc = water_log_ref.get()
            
            if doc.exists:
                water_logs.append(doc.to_dict())
            else:
                water_logs.append({
                    'date': date,
                    'glasses': 0
                })
        
        return sorted(water_logs, key=lambda x: x['date'])
    
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
        from datetime import datetime

        username = user_data.get('username')
        if self.is_username_taken(username):
            raise ValueError("Username already taken")

        if not self.is_valid_username(username):
            raise ValueError("Invalid username format")
        # Store initial weight log using values from frontend
        weight = user_data.get('weight')
        bmi = user_data.get('bmi')
        bmr = user_data.get('bmr')
        tdee = user_data.get('tdee')
        initial_log = {
            'weight': weight,
            'date': datetime.utcnow().isoformat(),
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
        db.collection('users').document(user_id).update(user_data)
        return True

    def delete_user(self, user_id: str):
        db.collection('users').document(user_id).delete()
        return True
    
    def get_user_by_email(self, email: str):
        users = db.collection('users').where('email', '==', email).stream()
        for user in users:
            return user.to_dict()
        return None
    

    def is_valid_username(self, username:str):
        return re.match(r'^[a-zA-Z0-9_.]{6,20}$', username) is not None


    def is_username_taken(self, username: str) -> bool:
        if not username:
            return False
        users = db.collection('users').where('username', '==', username).stream()
        return any(users)
    
    def update_user_activity(self, user_id: str):
        """Update user's last_active timestamp to track online status"""
        try:
            user_ref = db.collection('users').document(user_id)
            user_ref.update({'last_active': datetime.utcnow().isoformat()})
            return True
        except Exception as e:
            print(f"Error updating user activity: {e}")
            return False
    
    def is_user_online(self, last_active_str: str) -> bool:
        """Check if user is online based on last_active timestamp"""
        if not last_active_str:
            return False
        try:
            last_active = datetime.fromisoformat(last_active_str.replace('Z', '+00:00'))
            now = datetime.utcnow()
            # Consider user online if last active within 5 minutes
            return (now - last_active.replace(tzinfo=None)) < timedelta(minutes=5)
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
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
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
            'updated_at': datetime.utcnow().isoformat()
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
            'updated_at': datetime.utcnow().isoformat()
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

    def are_friends(self, user_id: str, other_user_id: str):
        """Check if two users are friends"""
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            friends = user_data.get('friends', [])
            return other_user_id in friends
        return False