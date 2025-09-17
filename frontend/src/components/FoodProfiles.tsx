import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Heart, 
  AlertTriangle, 
  Leaf,
  Wheat,
  Milk,
  Egg,
  Fish,
  Nut,
  Save,
  UserPlus,
  Baby,
  User,
  Crown,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';

interface FoodProfilesProps {
  user: any;
}

export function FoodProfiles({ user }: FoodProfilesProps) {
  const [selectedProfile, setSelectedProfile] = useState('personal');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  // Mock family profiles data
  const [profiles, setProfiles] = useState([
    {
      id: 'personal',
      name: user.name,
      relationship: 'You',
      age: user.age,
      avatar: user.avatar,
      allergies: ['Shellfish', 'Tree Nuts'],
      dietaryRestrictions: ['Lactose Intolerant'],
      preferences: ['Mediterranean', 'Low Sodium', 'High Protein'],
      medicalConditions: ['Prediabetes'],
      goals: ['Weight Loss', 'Better Energy'],
      dislikes: ['Mushrooms', 'Cilantro'],
      favorites: ['Salmon', 'Quinoa', 'Avocado'],
      calorieTarget: user.dailyCalorieTarget,
      isActive: true
    },
    {
      id: 'spouse',
      name: 'Jane Doe',
      relationship: 'Spouse',
      age: 45,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      allergies: ['Gluten'],
      dietaryRestrictions: ['Vegetarian'],
      preferences: ['Plant-Based', 'Organic', 'Low Sugar'],
      medicalConditions: [],
      goals: ['Maintain Weight', 'Heart Health'],
      dislikes: ['Spicy Food', 'Brussels Sprouts'],
      favorites: ['Tofu', 'Spinach', 'Berries'],
      calorieTarget: 1600,
      isActive: true
    },
    {
      id: 'child1',
      name: 'Emma Doe',
      relationship: 'Daughter',
      age: 12,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
      allergies: ['Peanuts'],
      dietaryRestrictions: [],
      preferences: ['Kid-Friendly', 'Mild Flavors'],
      medicalConditions: [],
      goals: ['Healthy Growth', 'More Vegetables'],
      dislikes: ['Vegetables', 'Fish'],
      favorites: ['Chicken', 'Pasta', 'Apples'],
      calorieTarget: 1800,
      isActive: true
    }
  ]);

  const [newProfile, setNewProfile] = useState({
    name: '',
    relationship: '',
    age: '',
    allergies: [],
    dietaryRestrictions: [],
    preferences: [],
    medicalConditions: [],
    goals: [],
    dislikes: [],
    favorites: [],
    calorieTarget: 1800
  });

  const allergenOptions = [
    { id: 'milk', label: 'Milk/Dairy', icon: Milk },
    { id: 'eggs', label: 'Eggs', icon: Egg },
    { id: 'fish', label: 'Fish', icon: Fish },
    { id: 'shellfish', label: 'Shellfish', icon: Fish },
    { id: 'tree-nuts', label: 'Tree Nuts', icon: Nut },
    { id: 'peanuts', label: 'Peanuts', icon: Nut },
    { id: 'wheat', label: 'Wheat/Gluten', icon: Wheat },
    { id: 'soy', label: 'Soy', icon: Leaf }
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 
    'Low Carb', 'Low Fat', 'Gluten-Free', 'Dairy-Free', 'Pescatarian'
  ];

  const goalOptions = [
    'Weight Loss', 'Weight Gain', 'Maintain Weight', 'Build Muscle',
    'Heart Health', 'Diabetes Management', 'Better Energy', 
    'Healthy Growth', 'Sports Performance'
  ];

  const relationshipOptions = [
    'Spouse/Partner', 'Child', 'Parent', 'Sibling', 'Other Family Member'
  ];

  const currentProfile = profiles.find(p => p.id === selectedProfile);

  const handleSaveProfile = () => {
    if (editingProfile) {
      setProfiles(profiles.map(p => 
        p.id === editingProfile.id ? { ...editingProfile, ...newProfile } : p
      ));
      setEditingProfile(null);
    } else {
      const id = `profile_${Date.now()}`;
      setProfiles([...profiles, { 
        ...newProfile, 
        id, 
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'
      }]);
    }
    setNewProfile({
      name: '',
      relationship: '',
      age: '',
      allergies: [],
      dietaryRestrictions: [],
      preferences: [],
      medicalConditions: [],
      goals: [],
      dislikes: [],
      favorites: [],
      calorieTarget: 1800
    });
    setIsCreating(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profileId !== 'personal') {
      setProfiles(profiles.filter(p => p.id !== profileId));
      if (selectedProfile === profileId) {
        setSelectedProfile('personal');
      }
    }
  };

  const MultiSelectInput = ({ 
    options, 
    selected, 
    onChange, 
    placeholder, 
    type = 'text' 
  }: { 
    options: string[], 
    selected: string[], 
    onChange: (items: string[]) => void,
    placeholder: string,
    type?: 'text' | 'allergen'
  }) => {
    const [input, setInput] = useState('');

    const addItem = (item: string) => {
      if (item && !selected.includes(item)) {
        onChange([...selected, item]);
      }
      setInput('');
    };

    const removeItem = (item: string) => {
      onChange(selected.filter(i => i !== item));
    };

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem(input);
              }
            }}
          />
          <Button 
            type="button" 
            onClick={() => addItem(input)}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
        
        {options.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {options.filter(option => 
              option.toLowerCase().includes(input.toLowerCase()) && 
              !selected.includes(option)
            ).slice(0, 5).map(option => (
              <Badge 
                key={option}
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => addItem(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {selected.map(item => (
            <Badge key={item} variant="secondary" className="gap-1">
              {type === 'allergen' && <AlertTriangle className="w-3 h-3" />}
              {item}
              <button 
                onClick={() => removeItem(item)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const ProfileCard = ({ profile }: { profile: any }) => (
    <Card className={`cursor-pointer transition-all ${
      selectedProfile === profile.id 
        ? 'ring-2 ring-primary border-primary bg-primary/5' 
        : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{profile.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.relationship}</p>
            <p className="text-xs text-muted-foreground">Age: {profile.age}</p>
          </div>
          {profile.id === 'personal' && (
            <Badge variant="secondary">
              <Crown className="w-3 h-3 mr-1" />
              You
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {profile.allergies.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>{profile.allergies.length} allergies</span>
            </div>
          )}
          {profile.dietaryRestrictions.length > 0 && (
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" />
              <span>{profile.dietaryRestrictions.length} dietary restrictions</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-green-500" />
            <span>{profile.goals.length} health goals</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedProfile(profile.id)}
          >
            {selectedProfile === profile.id ? 'Selected' : 'View'}
          </Button>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingProfile(profile);
                setNewProfile({ ...profile });
                setIsCreating(true);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            {profile.id !== 'personal' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteProfile(profile.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Family Food Profiles</h2>
          <p className="text-muted-foreground">
            Create personalized nutrition profiles for your family members
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProfile(null);
              setNewProfile({
                name: '',
                relationship: '',
                age: '',
                allergies: [],
                dietaryRestrictions: [],
                preferences: [],
                medicalConditions: [],
                goals: [],
                dislikes: [],
                favorites: [],
                calorieTarget: 1800
              });
            }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Profile' : 'Create New Family Profile'}
              </DialogTitle>
              <DialogDescription>
                {editingProfile 
                  ? 'Update the nutrition and dietary information for this family member.'
                  : 'Add a new family member with their specific nutrition needs, allergies, and preferences.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Relationship</label>
                  <select
                    value={newProfile.relationship}
                    onChange={(e) => setNewProfile({ ...newProfile, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select relationship</option>
                    {relationshipOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Input
                    type="number"
                    value={newProfile.age}
                    onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Daily Calorie Target</label>
                  <Input
                    type="number"
                    value={newProfile.calorieTarget}
                    onChange={(e) => setNewProfile({ ...newProfile, calorieTarget: parseInt(e.target.value) })}
                    placeholder="1800"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="text-sm font-medium mb-2 block">Food Allergies</label>
                <MultiSelectInput
                  options={allergenOptions.map(a => a.label)}
                  selected={newProfile.allergies}
                  onChange={(allergies) => setNewProfile({ ...newProfile, allergies })}
                  placeholder="Add allergy (e.g., Peanuts, Shellfish)"
                  type="allergen"
                />
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dietary Restrictions & Preferences</label>
                <MultiSelectInput
                  options={dietaryOptions}
                  selected={newProfile.dietaryRestrictions}
                  onChange={(dietaryRestrictions) => setNewProfile({ ...newProfile, dietaryRestrictions })}
                  placeholder="Add dietary preference (e.g., Vegetarian, Keto)"
                />
              </div>

              {/* Health Goals */}
              <div>
                <label className="text-sm font-medium mb-2 block">Health Goals</label>
                <MultiSelectInput
                  options={goalOptions}
                  selected={newProfile.goals}
                  onChange={(goals) => setNewProfile({ ...newProfile, goals })}
                  placeholder="Add health goal (e.g., Weight Loss, Heart Health)"
                />
              </div>

              {/* Favorites */}
              <div>
                <label className="text-sm font-medium mb-2 block">Favorite Foods</label>
                <MultiSelectInput
                  options={[]}
                  selected={newProfile.favorites}
                  onChange={(favorites) => setNewProfile({ ...newProfile, favorites })}
                  placeholder="Add favorite food (e.g., Salmon, Quinoa)"
                />
              </div>

              {/* Dislikes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Foods to Avoid</label>
                <MultiSelectInput
                  options={[]}
                  selected={newProfile.dislikes}
                  onChange={(dislikes) => setNewProfile({ ...newProfile, dislikes })}
                  placeholder="Add disliked food (e.g., Mushrooms, Spicy Food)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Family Members ({profiles.length})</h3>
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>

        {/* Selected Profile Details */}
        <div className="lg:col-span-2">
          {currentProfile && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
                    <AvatarFallback>
                      {currentProfile.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentProfile.name}
                      {currentProfile.id === 'personal' && (
                        <Badge variant="secondary">
                          <Crown className="w-3 h-3 mr-1" />
                          You
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {currentProfile.relationship} • Age {currentProfile.age} • {currentProfile.calorieTarget} cal/day target
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-green-600" />
                          Favorite Foods
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {currentProfile.favorites.map((food: string) => (
                            <Badge key={food} variant="secondary" className="text-green-700 bg-green-50">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Foods to Avoid</h4>
                        <div className="flex flex-wrap gap-1">
                          {currentProfile.dislikes.map((food: string) => (
                            <Badge key={food} variant="outline" className="text-red-600">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="restrictions" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Allergies
                        </h4>
                        <div className="space-y-2">
                          {currentProfile.allergies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No known allergies</p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {currentProfile.allergies.map((allergy: string) => (
                                <Badge key={allergy} variant="destructive" className="gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Dietary Restrictions
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {currentProfile.dietaryRestrictions.map((restriction: string) => (
                            <Badge key={restriction} className="bg-blue-100 text-blue-800">
                              {restriction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Food Preferences</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentProfile.preferences.map((preference: string) => (
                          <Badge key={preference} variant="secondary">
                            {preference}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Health Goals</h4>
                      <div className="space-y-2">
                        {currentProfile.goals.map((goal: string) => (
                          <div key={goal} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                            <Heart className="w-4 h-4 text-green-600" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Profile Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Why Create Family Food Profiles?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-1">Safety First</h4>
              <p className="text-sm text-muted-foreground">
                Track allergies and restrictions to keep everyone safe
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Personalized Plans</h4>
              <p className="text-sm text-muted-foreground">
                Get recipe recommendations tailored to each family member
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-1">Family Harmony</h4>
              <p className="text-sm text-muted-foreground">
                Find meals that work for everyone's needs and preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}