import { Platform } from 'react-native';

// Get the base URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // For web, try to get from Vite env variables or fall back to Expo
    if (typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_API_URL) {
      return (window as any).import.meta.env.VITE_API_URL;
    }
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  }
  // For mobile, use your production API URL or localhost for development
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();

// Universal event dispatcher for React Native
const dispatchEvent = (eventName: string, detail: any) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  } else {
    // For mobile, we'll use a simple event emitter pattern
    // You could use a library like EventEmitter3 or implement your own
    console.log(`Event dispatched: ${eventName}`, detail);
  }
};

// Search users by query (username, name, email)
export async function searchUsers(query: string) {
  if (!query) return [];
  const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Update user activity (heartbeat)
export async function updateUserActivity(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.ok;
}

// Get user's online status
export async function getUserOnlineStatus(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) return false;
  const userData = await res.json();
  return userData.online || false;
}

export async function addWeightLog(userId: string, weight: number, date: string, bmi: number, bmr: number, tdee: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/weight-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight, date, bmi, bmr, tdee }),
  });
  return res.json();
}

// Check if a username is available (unique)
export async function isUsernameAvailable(username: string, userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/check-username?username=${encodeURIComponent(username)}`);
  console.log('Response status:', res);
  if (!res.ok) throw new Error('Failed to check username');
  const data = await res.json();
  return data.available;
}

export async function getWeightLogs(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/weight-logs`);
  return res.json();
}

export async function createOrUpdateUser(userId: string, userData: any) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  return res.json();
}

export async function getUserByUserId(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) throw new Error('Failed to get user');
  return res.json();
}

export async function getUserByEmail(email: string) {
  const res = await fetch(`${BASE_URL}/users/by-email/${email}`);
  return res.json();
}

export async function getFriendshipStatus(userId: string, otherUserId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friendship-status/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to get friendship status');
  const data = await res.json();
  return data;
}

//Friend Request System
export async function sendFriendRequest(userId: string, receiverId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/send-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: receiverId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to send friend request');
  }
  
  // Trigger friend request received event for the receiver
  dispatchEvent('friendRequestReceived', { userId: receiverId });
  
  return res.json();
}

export async function acceptFriendRequest(userId: string, senderId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/accept-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_id: senderId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to accept friend request');
  }
  
  // Trigger friend added events for both users
  dispatchEvent('friendRequestAccepted', { userId, friendId: senderId });
  dispatchEvent('friendAdded', { userId, friendId: senderId });
  
  return res.json();
}

export async function rejectFriendRequest(userId: string, senderId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/reject-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_id: senderId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to reject friend request');
  }
  return res.json();
}

export async function revokeFriendRequest(userId: string, receiverId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/revoke-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: receiverId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to revoke friend request');
  }
  return res.json();
}

export async function getIncomingFriendRequests(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-requests/incoming`);
  if (!res.ok) throw new Error('Failed to get incoming friend requests');
  const data = await res.json();
  return data.requests;
}

export async function getOutgoingFriendRequests(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-requests/outgoing`);
  if (!res.ok) throw new Error('Failed to get outgoing friend requests');
  const data = await res.json();
  return data.requests;
}

export async function getFriendRequestStatus(userId: string, otherUserId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-request-status/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to get friend request status');
  const data = await res.json();
  return data.status;
}

export async function removeFriend(userId: string, friendId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/remove-friend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friend_id: friendId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to remove friend');
  }
  
  // Trigger friend removed event
  dispatchEvent('friendRemoved', { userId, friendId });
  
  return res.json();
}

export async function getUserFriends(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friends`);
  if (!res.ok) throw new Error('Failed to get friends');
  const data = await res.json();
  return data.friends;
}

// Friend-related API functions
export async function getFriends(userId: string): Promise<any[]> {
  // Implement your API call to get friends here
  try {
    const response = await fetch(`/api/friends/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch friends');
    return await response.json();
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

export async function checkFriendshipStatus(userId: string, otherUserId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friendship-status/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to check friendship status');
  const data = await res.json();
  return data.are_friends;
}

export async function debugFriendshipData(userId: string, otherUserId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/debug-friendship/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to get debug data');
  return res.json();
}

// Water intake API functions
export async function logWaterIntake(userId: string, glasses: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/water/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ glasses }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to log water intake');
  }
  return res.json();
}

export async function setWaterIntake(userId: string, glasses: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/water/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ glasses }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to set water intake');
  }
  return res.json();
}

export async function getTodayWaterIntake(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/water/today`);
  if (!res.ok) throw new Error('Failed to get today\'s water intake');
  const data = await res.json();
  return data.glasses;
}

export async function getWaterHistory(userId: string, days: number = 7) {
  const res = await fetch(`${BASE_URL}/users/${userId}/water/history?days=${days}`);
  if (!res.ok) throw new Error('Failed to get water history');
  const data = await res.json();
  return data.history;
}