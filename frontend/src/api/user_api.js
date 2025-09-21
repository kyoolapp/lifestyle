export async function createOrUpdateUser(userId, userData) {
  const res = await fetch(`http://127.0.0.1:8000/users/${userId}`, {
    method: "POST", // or "PUT" for update
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function getUser(userId) {
  const res = await fetch(`http://127.0.0.1:8000/users/${userId}`);
  return res.json();
}

export async function getUserByEmail(email) {
  const res = await fetch(`http://127.0.0.1:8000/users/by-email/${email}`);
  return res.json();
}