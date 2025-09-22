const BASE_URL = import.meta.env.VITE_API_URL;

export async function addWeightLog(userId, weight, date) {
  const res = await fetch(`${BASE_URL}/users/${userId}/weight-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight, date }),
  });
  return res.json();
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