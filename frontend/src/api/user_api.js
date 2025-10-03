// Search users by query (username, name, email)
export async function searchUsers(query) {
  if (!query) return [];
  const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Add friend/follow (placeholder, to be implemented in backend)
/*export async function addFriend(currentUserId, targetUserId) {
  // POST /users/{currentUserId}/add-friend { targetUserId }
  const res = await fetch(`${BASE_URL}/users/${currentUserId}/add-friend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId }),
  });
  return res.ok;
}*/

// Update user activity (heartbeat)
export async function updateUserActivity(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.ok;
}

// Get user's online status
export async function getUserOnlineStatus(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) return false;
  const userData = await res.json();
  return userData.online || false;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export async function addWeightLog(userId, weight, date, bmi, bmr, tdee) {
  const res = await fetch(`${BASE_URL}/users/${userId}/weight-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight, date, bmi, bmr, tdee}),
  });
  return res.json();
}



// Check if a username is available (unique)
export async function isUsernameAvailable(username, userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/check-username?username=${encodeURIComponent(username)}`);
  console.log('Response status:', res);
  if (!res.ok) throw new Error('Failed to check username');
  const data = await res.json();
  return data.available;
}


export async function getWeightLogs(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/weight-logs`);
  return res.json();
}
export async function createOrUpdateUser(userId, userData) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "POST", // or "PUT" for update
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function getUser(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  return res.json();
}

export async function getUserByEmail(email) {
  const res = await fetch(`${BASE_URL}/users/by-email/${email}`);
  return res.json();
}

//Friend Request System
export async function sendFriendRequest(userId, receiverId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/send-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: receiverId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to send friend request');
  }
  return res.json();
}

export async function acceptFriendRequest(userId, senderId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/accept-friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_id: senderId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to accept friend request');
  }
  return res.json();
}

export async function rejectFriendRequest(userId, senderId) {
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

export async function getIncomingFriendRequests(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-requests/incoming`);
  if (!res.ok) throw new Error('Failed to get incoming friend requests');
  const data = await res.json();
  return data.requests;
}

export async function getOutgoingFriendRequests(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-requests/outgoing`);
  if (!res.ok) throw new Error('Failed to get outgoing friend requests');
  const data = await res.json();
  return data.requests;
}

export async function getFriendRequestStatus(userId, otherUserId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friend-request-status/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to get friend request status');
  const data = await res.json();
  return data.status;
}

export async function removeFriend(userId, friendId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/remove-friend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friend_id: friendId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to remove friend');
  }
  return res.json();
}

export async function getUserFriends(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friends`);
  if (!res.ok) throw new Error('Failed to get friends');
  const data = await res.json();
  return data.friends;
}

export async function checkFriendshipStatus(userId, otherUserId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/friendship-status/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to check friendship status');
  const data = await res.json();
  return data.are_friends;
}

export async function debugFriendshipData(userId, otherUserId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/debug-friendship/${otherUserId}`);
  if (!res.ok) throw new Error('Failed to get debug data');
  return res.json();
}