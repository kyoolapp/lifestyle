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
    ...data.goal,
    deadline: new Date(data.goal.deadline),
    createdDate: new Date(data.goal.createdDate),
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