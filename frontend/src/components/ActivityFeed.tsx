import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Heart, 
  Droplets, 
  ChefHat, 
  Activity, 
  Users, 
  Target,
  Trophy,
  TrendingUp,
  Clock,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityFeedProps {
  user: any;
  onViewAllFriends: () => void;
}

export function ActivityFeed({ user, onViewAllFriends }: ActivityFeedProps) {
  const activities = [
    {
      id: 1,
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Daily Water Goal Complete!',
      description: 'You reached your 8 glasses water goal',
      time: '2 minutes ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 2,
      type: 'social',
      icon: Users,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: 'Sarah J. shared a healthy recipe',
      description: 'Mediterranean Quinoa Bowl - only 340 calories!',
      time: '15 minutes ago',
      user: { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      likes: 12,
      comments: 3
    },
    {
      id: 3,
      type: 'fitness',
      icon: Activity,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      title: 'You completed a 45-min walk',
      description: '6,847 steps • 287 calories burned',
      time: '1 hour ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 4,
      type: 'safe-zone',
      icon: Target,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Safe Zone Alert Helped You!',
      description: 'Avoided 650 calories by choosing grilled chicken over fried',
      time: '2 hours ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 5,
      type: 'nutrition',
      icon: ChefHat,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: 'Mike C. is on a 7-day healthy streak!',
      description: 'Stayed within calorie goals for a full week',
      time: '3 hours ago',
      user: { name: 'Mike C.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
      likes: 24,
      comments: 8
    },
    {
      id: 6,
      type: 'health',
      icon: Heart,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Weekly Health Check Complete',
      description: 'BMI: 27.2 • Weight: -1.2 lbs this week',
      time: '1 day ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 7,
      type: 'social',
      icon: Users,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      title: 'Emma R. started following you',
      description: 'You both have similar health goals!',
      time: '1 day ago',
      user: { name: 'Emma R.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
      likes: 0,
      comments: 0
    },
    {
      id: 8,
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: '10,000 Steps Milestone!',
      description: 'You hit your daily step goal 5 days in a row',
      time: '2 days ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    }
  ];

  const quickStats = [
    { label: 'Today\'s Steps', value: '8,547', change: '+12%', icon: Activity, color: 'text-blue-500' },
    { label: 'Water Intake', value: '7/8', change: '87%', icon: Droplets, color: 'text-cyan-500' },
    { label: 'Calories Left', value: '480', change: 'Good', icon: Target, color: 'text-green-500' },
    { label: 'Active Friends', value: '23', change: '+3', icon: Users, color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Your Activity</h1>
          <p className="text-muted-foreground">See what's happening in your health journey</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Social Health Community Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Social Health Community</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Connect with like-minded individuals, share your journey, and get inspired by others who understand your health goals.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Community challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Progress sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Motivational support</span>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={onViewAllFriends}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  View all friends →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <div className="space-y-4 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold">Join the Community</h3>
                  <p className="text-sm text-white/80">Connect with health enthusiasts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 p-4 rounded-lg border ${activity.borderColor} ${activity.bgColor} hover:shadow-sm transition-shadow`}
                >
                  {/* Activity Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        
                        {/* User and Time */}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">{activity.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Activity Type Badge */}
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>

                    {/* Social Actions (for social activities) */}
                    {(activity.likes > 0 || activity.comments > 0) && (
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/50">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{activity.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          <span>{activity.comments}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Load more activities...
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}