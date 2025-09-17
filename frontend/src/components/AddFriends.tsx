import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft,
  Search, 
  UserPlus, 
  Users,
  Share2,
  Copy,
  QrCode,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  CheckCircle,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface AddFriendsProps {
  onBack: () => void;
}

export function AddFriends({ onBack }: AddFriendsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Mock suggested friends data
  const suggestedFriends = [
    {
      id: 1,
      name: 'Jennifer Wu',
      username: '@jen_wu',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face',
      mutualFriends: 3,
      reason: 'Similar fitness goals',
      stats: 'Lost 15 lbs in 3 months',
      isAdded: false
    },
    {
      id: 2,
      name: 'Robert Kumar',
      username: '@rob_k',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
      mutualFriends: 2,
      reason: 'Same age group (45-50)',
      stats: '12-day healthy streak',
      isAdded: false
    },
    {
      id: 3,
      name: 'Maria Santos',
      username: '@maria_s',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      mutualFriends: 5,
      reason: 'Similar BMI goals',
      stats: 'Runs 5K daily',
      isAdded: false
    },
    {
      id: 4,
      name: 'James Wilson',
      username: '@james_w',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      mutualFriends: 1,
      reason: 'Loves healthy recipes',
      stats: 'Shared 45+ recipes',
      isAdded: false
    }
  ];

  const [friendsList, setFriendsList] = useState(suggestedFriends);

  const handleAddFriend = (friendId: number) => {
    setFriendsList(prev =>
      prev.map(friend =>
        friend.id === friendId ? { ...friend, isAdded: true } : friend
      )
    );
  };

  const handleCopyLink = async () => {
    const inviteLink = 'https://kyoolapp.com/invite/john-doe-xyz123';
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      name: 'Text Message',
      icon: MessageSquare,
      color: 'text-green-600',
      description: 'Send invite via SMS'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-blue-600',
      description: 'Send invite via email'
    },
    {
      name: 'WhatsApp',
      icon: Smartphone,
      color: 'text-green-500',
      description: 'Share on WhatsApp'
    },
    {
      name: 'Social Media',
      icon: Share2,
      color: 'text-purple-600',
      description: 'Share on social platforms'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Add Friends</h1>
          <p className="text-muted-foreground">
            Connect with others on their health journey
          </p>
        </div>
      </div>

      <Tabs defaultValue="suggested" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
        </TabsList>

        {/* Suggested Friends */}
        <TabsContent value="suggested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Suggested for You
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                People with similar health goals and interests
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {friendsList.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{friend.name}</h3>
                      <span className="text-sm text-muted-foreground">{friend.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {friend.reason}
                      </Badge>
                      {friend.mutualFriends > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {friend.mutualFriends} mutual friends
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>{friend.stats}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={friend.isAdded ? "outline" : "default"}
                    onClick={() => handleAddFriend(friend.id)}
                    disabled={friend.isAdded}
                    className="gap-2"
                  >
                    {friend.isAdded ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Friends */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchTerm ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Searching for "{searchTerm}"</h3>
                  <p className="text-sm text-muted-foreground">
                    Results will appear here when you search
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Find Friends</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a username, email, or name to search for friends
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Friends */}
        <TabsContent value="invite" className="space-y-4">
          {/* Share Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Your Invite Link
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Share this link with friends to invite them to KyoolApp
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value="https://kyoolapp.com/invite/john-doe-xyz123"
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {shareOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Icon className={`w-6 h-6 ${option.color}`} />
                      <div className="text-center">
                        <div className="font-medium text-sm">{option.name}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Let friends scan this code to add you instantly
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Show this QR code to friends nearby or save it to share later
                </p>
                <Button variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Full Screen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Share your goals</p>
                  <p className="text-xs text-muted-foreground">Friends with similar health goals are more likely to stay motivated together</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Join challenges</p>
                  <p className="text-xs text-muted-foreground">Participate in group challenges to meet like-minded people</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Be encouraging</p>
                  <p className="text-xs text-muted-foreground">Support others' achievements to build a positive community</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}