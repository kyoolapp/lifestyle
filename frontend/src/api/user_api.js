// Search users by query (username, name, email)
export async function searchUsers(query) {
  if (!query) return [];
  const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Add friend/follow (placeholder, to be implemented in backend)
export async function addFriend(currentUserId, targetUserId) {
  // POST /users/{currentUserId}/add-friend { targetUserId }
  const res = await fetch(`${BASE_URL}/users/${currentUserId}/add-friend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId }),
  });
  return res.ok;
}

// Update user activity (heartbeat)
export async function updateUserActivity(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.ok;
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