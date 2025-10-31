import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Dumbbell,
  TrendingUp,
  Timer,
  Target,
  Zap,
  Heart,
  BarChart3,
  PlayCircle,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  Clock,
  Trophy,
  Activity,
  Flame,
  Mountain,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface WorkoutMethodology {
  id: string;
  title: string;
  description: string;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT' | 'Endurance';
  icon: React.ComponentType<any>;
  benefits: string[];
  principles: string[];
  exampleWorkouts: string[];
  popularityScore: number;
  rating: number;
  reviews: number;
}

const workoutMethodologies: WorkoutMethodology[] = [
  {
    id: 'progressive-overload',
    title: 'Progressive Overload',
    description: 'Gradually increase weight, frequency, or intensity to continuously challenge your muscles and promote growth.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Intermediate',
    duration: '45-60 min',
    category: 'Strength',
    icon: TrendingUp,
    benefits: [
      'Continuous muscle growth',
      'Strength gains over time',
      'Prevents plateaus',
      'Measurable progress'
    ],
    principles: [
      'Increase weight by 2.5-5% when you can complete all sets',
      'Add extra reps before increasing weight',
      'Track all workouts to monitor progress',
      'Focus on proper form over heavy weight'
    ],
    exampleWorkouts: [
      'Week 1: Bench Press 3x8 @ 135lbs',
      'Week 3: Bench Press 3x8 @ 140lbs',
      'Week 5: Bench Press 3x10 @ 140lbs',
      'Week 7: Bench Press 3x8 @ 145lbs'
    ],
    popularityScore: 95,
    rating: 4.8,
    reviews: 2847
  },
  {
    id: 'hiit',
    title: 'High-Intensity Interval Training (HIIT)',
    description: 'Short bursts of intense exercise followed by brief recovery periods for maximum fat burning and cardiovascular benefits.',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Intermediate',
    duration: '15-30 min',
    category: 'HIIT',
    icon: Zap,
    benefits: [
      'Burns calories efficiently',
      'Improves cardiovascular health',
      'Time-efficient workouts',
      'Boosts metabolism for hours'
    ],
    principles: [
      'Work at 80-95% max heart rate during intervals',
      'Keep rest periods active but light',
      'Maintain proper form even when fatigued',
      'Gradually increase interval duration'
    ],
    exampleWorkouts: [
      '30 seconds burpees + 30 seconds rest (8 rounds)',
      '45 seconds mountain climbers + 15 seconds rest (12 rounds)',
      '20 seconds sprints + 40 seconds walk (10 rounds)',
      'Tabata: 20s on, 10s off (8 rounds per exercise)'
    ],
    popularityScore: 89,
    rating: 4.6,
    reviews: 1923
  },
  {
    id: 'compound-movements',
    title: 'Compound Movement Training',
    description: 'Focus on multi-joint exercises that work multiple muscle groups simultaneously for functional strength.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Beginner',
    duration: '45-75 min',
    category: 'Strength',
    icon: Dumbbell,
    benefits: [
      'Works multiple muscles at once',
      'Functional strength development',
      'Time-efficient training',
      'Improves coordination'
    ],
    principles: [
      'Master bodyweight versions first',
      'Focus on full range of motion',
      'Prioritize compound over isolation exercises',
      'Progressive overload applies here too'
    ],
    exampleWorkouts: [
      'Squats, Deadlifts, Pull-ups, Push-ups',
      'Clean & Press, Rows, Lunges',
      'Thrusters, Burpees, Bear Crawls',
      'Turkish Get-ups, Farmer\'s Walks'
    ],
    popularityScore: 87,
    rating: 4.7,
    reviews: 1456
  },
  {
    id: 'periodization',
    title: 'Periodization Training',
    description: 'Systematic planning of athletic training with progressive cycling of various aspects of a training program.',
    image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Advanced',
    duration: '60-90 min',
    category: 'Strength',
    icon: BarChart3,
    benefits: [
      'Prevents overtraining',
      'Optimizes performance peaks',
      'Reduces injury risk',
      'Long-term progression'
    ],
    principles: [
      'Plan training in phases (macrocycles)',
      'Vary intensity and volume over time',
      'Include deload weeks for recovery',
      'Peak for specific goals or events'
    ],
    exampleWorkouts: [
      'Hypertrophy Phase: High volume, moderate intensity',
      'Strength Phase: Lower volume, higher intensity',
      'Power Phase: Low volume, explosive movements',
      'Deload Week: 50% normal volume'
    ],
    popularityScore: 72,
    rating: 4.9,
    reviews: 892
  },
  {
    id: 'circuit-training',
    title: 'Circuit Training',
    description: 'Move through a series of exercises with minimal rest to improve both strength and cardiovascular fitness.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Beginner',
    duration: '30-45 min',
    category: 'HIIT',
    icon: RefreshCw,
    benefits: [
      'Combines strength and cardio',
      'Time-efficient workouts',
      'Keeps heart rate elevated',
      'Prevents workout boredom'
    ],
    principles: [
      'Choose 6-12 exercises per circuit',
      'Work for 30-60 seconds per station',
      'Minimal rest between exercises',
      'Rest 1-2 minutes between circuits'
    ],
    exampleWorkouts: [
      'Upper Body Circuit: Push-ups, Rows, Dips, Pull-ups',
      'Lower Body Circuit: Squats, Lunges, Step-ups, Calf raises',
      'Full Body Circuit: Burpees, Mountain climbers, Plank, Jumping jacks',
      'Strength Circuit: Deadlifts, Overhead press, Squats, Rows'
    ],
    popularityScore: 78,
    rating: 4.4,
    reviews: 1234
  },
  {
    id: 'endurance-training',
    title: 'Endurance Training',
    description: 'Build cardiovascular capacity and muscular endurance through sustained, moderate-intensity exercise.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop&crop=center',
    difficulty: 'Beginner',
    duration: '45-120 min',
    category: 'Endurance',
    icon: Mountain,
    benefits: [
      'Improves cardiovascular health',
      'Increases stamina and endurance',
      'Burns calories effectively',
      'Reduces stress and anxiety'
    ],
    principles: [
      'Maintain 60-80% max heart rate',
      'Focus on breathing rhythm',
      'Gradually increase duration',
      'Include variety to prevent boredom'
    ],
    exampleWorkouts: [
      'Long steady-state runs (45-90 minutes)',
      'Cycling sessions with varied terrain',
      'Swimming laps with consistent pace',
      'Hiking with elevation changes'
    ],
    popularityScore: 73,
    rating: 4.3,
    reviews: 987
  }
];

const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT', 'Endurance'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedMethodology, setSelectedMethodology] = useState<WorkoutMethodology | null>(null);

  const filteredMethodologies = workoutMethodologies.filter(method => {
    const categoryMatch = selectedCategory === 'All' || method.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || method.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Strength': return Dumbbell;
      case 'Cardio': return Heart;
      case 'HIIT': return Zap;
      case 'Endurance': return Mountain;
      case 'Flexibility': return Activity;
      default: return Target;
    }
  };

  if (selectedMethodology) {
    const Icon = selectedMethodology.icon;
    const CategoryIcon = getCategoryIcon(selectedMethodology.category);
    
    return (
      <div className="space-y-6 px-2 md:px-0">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setSelectedMethodology(null)}
          className="mb-4"
        >
          ← Back to Explore
        </Button>

        {/* Methodology Detail Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img 
              src={selectedMethodology.image} 
              alt={selectedMethodology.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-4 right-4">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={`${getDifficultyColor(selectedMethodology.difficulty)} text-white`}>
                  {selectedMethodology.difficulty}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CategoryIcon className="w-3 h-3" />
                  {selectedMethodology.category}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedMethodology.duration}
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedMethodology.title}</h1>
              <p className="text-muted-foreground text-base md:text-lg mb-4">{selectedMethodology.description}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(selectedMethodology.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{selectedMethodology.rating}</span>
                  <span className="text-sm text-muted-foreground">({selectedMethodology.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">{selectedMethodology.popularityScore}% popularity</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Key Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedMethodology.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Core Principles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Core Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedMethodology.principles.map((principle, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm">{principle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Example Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-purple-500" />
              Example Workout Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMethodology.exampleWorkouts.map((workout, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <span className="font-medium text-sm">Progression Step {index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{workout}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" size="lg">
            <PlayCircle className="w-5 h-5 mr-2" />
            Start This Methodology
          </Button>
          <Button variant="outline" size="lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Learn More
          </Button>
          <Button variant="outline" size="lg">
            <Users className="w-5 h-5 mr-2" />
            Find Training Partner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Explore Workout Methodologies</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover proven training methods to reach your fitness goals. From progressive overload to HIIT, find the perfect approach for your journey.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Category:</span>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Difficulty:</span>
          {difficulties.map(difficulty => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
              className="text-xs"
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMethodologies.length} methodology{filteredMethodologies.length !== 1 ? 'ies' : ''}
        </p>
      </div>

      {/* Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMethodologies.map((methodology, index) => {
          const Icon = methodology.icon;
          const CategoryIcon = getCategoryIcon(methodology.category);
          
          return (
            <motion.div
              key={methodology.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden"
                onClick={() => setSelectedMethodology(methodology)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={methodology.image} 
                    alt={methodology.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors ml-auto" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={`${getDifficultyColor(methodology.difficulty)} text-white text-xs`}>
                      {methodology.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <CategoryIcon className="w-3 h-3" />
                      {methodology.category}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {methodology.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {methodology.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>{methodology.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{methodology.reviews}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(methodology.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium">{methodology.rating}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-medium">{methodology.popularityScore}%</span>
                    </div>
                  </div>
                  
                  {/* Popularity Bar */}
                  <div className="mt-3">
                    <Progress value={methodology.popularityScore} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredMethodologies.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No methodologies found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
}