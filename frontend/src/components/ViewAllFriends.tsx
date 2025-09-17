import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter,
  Circle,
  Calendar,
  TrendingUp,
  Trophy,
  Target,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface ViewAllFriendsProps {
  onBack: () => void;
  onAddFriends: () => void;
}

export function ViewAllFriends({ onBack, onAddFriends }: ViewAllFriendsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'online' | 'recent'>('all');

  // Mock friends data with useful health information
  const allFriends = [
    {
      id: 1,
      name: 'Sarah Johnson',
      username: '@sarah_j',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
      lastActive: 'Online now',
      joinedDate: 'March 2024',
      stats: {
        currentStreak: 12,
        totalWorkouts: 45,
        calorieGoal: 1600,
        avgSteps: 8500
      },
      achievements: ['7-Day Streak', 'Water Goal Master', 'Step Counter'],
      recentActivity: 'Completed morning yoga session'
    },
    {
      id: 2,
      name: 'Mike Chen',
      username: '@mike_c',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
      lastActive: '2 min ago',
      joinedDate: 'January 2024',
      stats: {
        currentStreak: 8,
        totalWorkouts: 89,
        calorieGoal: 2100,
        avgSteps: 12000
      },
      achievements: ['Fitness Pro', 'Early Bird', 'Consistency King'],
      recentActivity: 'Shared a healthy breakfast recipe'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      username: '@emma_r',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
      lastActive: '5 min ago',
      joinedDate: 'February 2024',
      stats: {
        currentStreak: 25,
        totalWorkouts: 67,
        calorieGoal: 1500,
        avgSteps: 9200
      },
      achievements: ['Marathon Walker', 'Nutrition Expert', 'Goal Crusher'],
      recentActivity: 'Hit 25-day healthy eating streak!'
    },
    {
      id: 4,
      name: 'Alex Kim',
      username: '@alex_k',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      isOnline: false,
      lastActive: '1 hour ago',
      joinedDate: 'April 2024',
      stats: {
        currentStreak: 3,
        totalWorkouts: 23,
        calorieGoal: 1900,
        avgSteps: 7800
      },
      achievements: ['New Member', 'First Week'],
      recentActivity: 'Logged first workout session'
    },
    {
      id: 5,
      name: 'Lisa Martin',
      username: '@lisa_m',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
      lastActive: 'Online now',
      joinedDate: 'December 2023',
      stats: {
        currentStreak: 42,
        totalWorkouts: 156,
        calorieGoal: 1400,
        avgSteps: 11500
      },
      achievements: ['Veteran Member', 'Inspiration', 'Mentor'],
      recentActivity: 'Reached 150+ workouts milestone'
    },
    {
      id: 6,
      name: 'David Lopez',
      username: '@david_l',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      isOnline: false,
      lastActive: '3 hours ago',
      joinedDate: 'May 2024',
      stats: {
        currentStreak: 15,
        totalWorkouts: 34,
        calorieGoal: 2000,
        avgSteps: 6500
      },
      achievements: ['Rising Star', 'Weekend Warrior'],
      recentActivity: 'Completed 5K morning run'
    }
  ];

  const filteredFriends = allFriends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterTab) {
      case 'online':
        return friend.isOnline;
      case 'recent':
        return friend.lastActive.includes('min ago') || friend.lastActive.includes('Online now');
      default:
        return true;
    }
  });

  const onlineCount = allFriends.filter(f => f.isOnline).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">All Friends</h1>
          <p className="text-muted-foreground">
            {allFriends.length} friends • {onlineCount} online now
          </p>
        </div>
        <Button onClick={onAddFriends} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Friends
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search friends by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTab('all')}
              >
                All ({allFriends.length})
              </Button>
              <Button
                variant={filterTab === 'online' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTab('online')}
              >
                Online ({onlineCount})
              </Button>
              <Button
                variant={filterTab === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTab('recent')}
              >
                Recent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friends Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFriends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                {/* Friend Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {friend.isOnline && (
                      <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-green-500 bg-white rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{friend.name}</h3>
                    <p className="text-sm text-muted-foreground">{friend.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">{friend.lastActive}</span>
                    </div>
                  </div>
                </div>

                {/* Friend Stats */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Streak</span>
                      </div>
                      <span className="font-semibold">{friend.stats.currentStreak} days</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Goal</span>
                      </div>
                      <span className="font-semibold">{friend.stats.calorieGoal} cal</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-2 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">Recent Activity</span>
                    </div>
                    <p className="text-xs leading-relaxed">{friend.recentActivity}</p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-1">
                    {friend.achievements.slice(0, 2).map((achievement, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                    {friend.achievements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{friend.achievements.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                  <Calendar className="w-3 h-3" />
                  <span>Member since {friend.joinedDate}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFriends.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No friends found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search or filters' : 'No friends match the current filter'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}