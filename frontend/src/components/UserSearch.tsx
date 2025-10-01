import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { searchUsers, updateUserActivity } from '../api/user_api';
import { auth } from '../firebase';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  interface User {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    online?: boolean;
  }

  const [selectedUser, setSelectedUser] = useState<User | null>(null);



  useEffect(() => {
    if (!query) {
      setResults([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    searchUsers(query)
      .then(users => setResults(users))
      .catch(() => setError('Error searching users'))
      .finally(() => setLoading(false));
  }, [query]);

  if (selectedUser) {
    // Simple profile view (expand as needed)
    return (
      <div className="max-w-lg mx-auto p-4">
        <Button onClick={() => setSelectedUser(null)} className="mb-4">Back to Search</Button>
        <div className="flex flex-col items-center gap-4 border rounded-lg p-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || selectedUser.username)}`} />
            <AvatarFallback>{(selectedUser.name || selectedUser.username || '').slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-xl font-bold">{selectedUser.username}</div>
          <div className="text-slate-500 text-lg">{selectedUser.name}</div>
          <Avatar className="w-24 h-24">
                <AvatarImage 
                    src={selectedUser.avatar}
                    onError={() => {
                    console.warn('Avatar image failed to load:', selectedUser.avatar);
                    }}
                />
                <AvatarFallback className="text-xl">
                    {(selectedUser.name ?? '').split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
          {/* Add more profile info here if available */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Search Users</h2>
      <Input
        type="text"
        placeholder="Search by username or name"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-4"
      />
      {loading && <div className="text-gray-500">Searching...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && results.length === 0 && query && (
        <div className="text-gray-500">No users found.</div>
      )}
      <ul className="space-y-3">
        {results.map(user => (
          <li key={user.id} className="flex items-center gap-4 p-2 border rounded cursor-pointer hover:bg-accent" onClick={() => setSelectedUser(user)}>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}`} />
                <AvatarFallback>{(user.name || user.username || '').slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                user.online ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium">{user.username}</div>
                {user.online && <span className="text-xs text-green-600 font-medium">Online</span>}
              </div>
              <div className="text-slate-500 text-sm">{user.name}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
