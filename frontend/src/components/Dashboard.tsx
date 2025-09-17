import React, { useState } from 'react';
import { ActivityFeed } from './ActivityFeed';
import { ViewAllFriends } from './ViewAllFriends';
import { AddFriends } from './AddFriends';

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'friends' | 'addFriends'>('dashboard');

  const handleViewAllFriends = () => {
    setActiveView('friends');
  };

  const handleAddFriends = () => {
    setActiveView('addFriends');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  if (activeView === 'friends') {
    return (
      <ViewAllFriends 
        onBack={handleBackToDashboard} 
        onAddFriends={handleAddFriends}
      />
    );
  }

  if (activeView === 'addFriends') {
    return (
      <AddFriends 
        onBack={() => setActiveView('friends')}
      />
    );
  }

  return <ActivityFeed user={user} onViewAllFriends={handleViewAllFriends} />;
}