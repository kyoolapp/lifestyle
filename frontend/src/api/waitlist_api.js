// Waitlist API functions
const BASE_URL = import.meta.env.VITE_API_URL;

export async function joinWaitlist(formData) {
  const res = await fetch(`${BASE_URL}/waitlist/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person_type: formData.personType,
      activity_level: formData.activityLevel,
      current_situation: formData.currentSituation,
      desired_results: formData.desiredResults,
      biggest_challenge: formData.biggestChallenge,
      previous_attempts: formData.previousAttempts,
      budget: formData.budget,
      email: formData.email,
      phone: formData.phone
    }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to join waitlist');
  }
  
  return res.json();
}

export async function getWaitlistStats() {
  const res = await fetch(`${BASE_URL}/waitlist/stats`);
  if (!res.ok) throw new Error('Failed to get waitlist statistics');
  return res.json();
}

export async function getWaitlistEntries(limit = 50, status = null) {
  let url = `${BASE_URL}/waitlist/entries?limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to get waitlist entries');
  return res.json();
}

export async function updateWaitlistStatus(waitlistId, status) {
  const res = await fetch(`${BASE_URL}/waitlist/entries/${waitlistId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to update waitlist status');
  }
  
  return res.json();
}