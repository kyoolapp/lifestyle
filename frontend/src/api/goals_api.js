// Goals API service for frontend
const BASE_URL = import.meta.env.VITE_API_URL;

// Create a new goal
export async function createGoal(userId, goal) {
  const response = await fetch(`${BASE_URL}/goals/${userId}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...goal,
      deadline: goal.deadline.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create goal');
  }

  const data = await response.json();
  return {
    ...data,
    deadline: new Date(data.deadline),
    createdDate: new Date(data.createdDate),
  };
}

// Get all goals for a user
export async function getUserGoals(userId, status) {
  const url = new URL(`${BASE_URL}/goals/${userId}/goals`);
  if (status) {
    url.searchParams.append('status', status);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }

  const data = await response.json();
  return data.goals.map((goal) => ({
    ...goal,
    deadline: new Date(goal.deadline),
    createdDate: new Date(goal.createdDate),
  }));
}

// Update goal progress
export async function updateGoalProgress(userId, goalId, currentValue, status) {
  const response = await fetch(`${BASE_URL}/goals/${userId}/goals/${goalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentValue,
      status,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update goal');
  }
}

// Delete a goal
export async function deleteGoal(userId, goalId) {
  const response = await fetch(`${BASE_URL}/goals/${userId}/goals/${goalId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete goal');
  }
}

// Get goal statistics
export async function getGoalStats(userId) {
  const response = await fetch(`${BASE_URL}/goals/${userId}/goals/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch goal statistics');
  }

  return response.json();
}

// Sync goals from localStorage to backend (migration helper)
export async function syncGoalsToBackend(userId) {
  const localGoals = localStorage.getItem('lifestyle_goals');
  if (!localGoals) return;

  const goals = JSON.parse(localGoals).map((goal) => ({
    ...goal,
    deadline: new Date(goal.deadline),
    createdDate: new Date(goal.createdDate),
  }));

  for (const goal of goals) {
    try {
      await createGoal(userId, goal);
    } catch (error) {
      console.error('Failed to sync goal:', goal.title, error);
    }
  }

  // Clear localStorage after successful sync
  localStorage.removeItem('lifestyle_goals');
}

// Check if goals are synced (helper for migration)
export async function areGoalsSynced(userId) {
  try {
    const backendGoals = await getUserGoals(userId);
    const localGoals = localStorage.getItem('lifestyle_goals');
    
    if (!localGoals) return backendGoals.length > 0;
    
    const parsedLocalGoals = JSON.parse(localGoals);
    return backendGoals.length >= parsedLocalGoals.length;
  } catch (error) {
    return false;
  }
}