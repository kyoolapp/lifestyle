import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  Video, 
  Award,
  Users,
  Filter,
  Search,
  Heart,
  CheckCircle,
  DollarSign,
  Globe,
  MessageSquare
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FindDieticianProps {
  user: any;
}

export function FindDietician({ user }: FindDieticianProps) {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  // Mock dietician data
  const dieticians = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Registered Dietitian Nutritionist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 127,
      experience: '8 years',
      specialty: 'Weight Management',
      location: 'Downtown Medical Center',
      distance: '1.2 miles',
      consultationFee: 85,
      languages: ['English', 'Spanish'],
      availability: 'Available today',
      isOnline: true,
      certifications: ['RDN', 'CDE', 'CSSD'],
      bio: 'Specializes in weight management and diabetes care with a focus on sustainable lifestyle changes.',
      nextSlot: 'Today 3:00 PM'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      title: 'Clinical Nutritionist',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 89,
      experience: '12 years',
      specialty: 'Sports Nutrition',
      location: 'Elite Sports Clinic',
      distance: '2.5 miles',
      consultationFee: 95,
      languages: ['English', 'Mandarin'],
      availability: 'Available tomorrow',
      isOnline: true,
      certifications: ['MS', 'CSCS', 'CISSN'],
      bio: 'Expert in sports nutrition and performance optimization for athletes and fitness enthusiasts.',
      nextSlot: 'Tomorrow 10:00 AM'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      title: 'Pediatric Nutritionist',
      image: 'https://images.unsplash.com/photo-1594824804732-ca8dbc4d6845?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 156,
      experience: '6 years',
      specialty: 'Family Nutrition',
      location: 'Children\'s Health Center',
      distance: '3.1 miles',
      consultationFee: 75,
      languages: ['English', 'Spanish', 'Portuguese'],
      availability: 'Available this week',
      isOnline: true,
      certifications: ['RDN', 'CBDM'],
      bio: 'Focuses on family nutrition, childhood obesity prevention, and healthy eating habits for kids.',
      nextSlot: 'Friday 2:00 PM'
    },
    {
      id: 4,
      name: 'Dr. David Kim',
      title: 'Therapeutic Dietitian',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 203,
      experience: '15 years',
      specialty: 'Medical Nutrition',
      location: 'Regional Medical Center',
      distance: '4.2 miles',
      consultationFee: 110,
      languages: ['English', 'Korean'],
      availability: 'Available next week',
      isOnline: false,
      certifications: ['RDN', 'CNSC', 'CDN'],
      bio: 'Specializes in medical nutrition therapy for chronic diseases and post-surgery recovery.',
      nextSlot: 'Next Tuesday 11:00 AM'
    }
  ];

  // Mock online recommendations
  const onlineRecommendations = [
    {
      id: 1,
      name: 'NutriPlan Pro',
      type: 'AI-Powered Platform',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop',
      rating: 4.6,
      users: '50K+',
      price: '$19/month',
      features: ['Personalized meal plans', 'Calorie tracking', '24/7 support'],
      description: 'AI-driven nutrition planning with personalized recommendations.',
      specialty: 'General Nutrition'
    },
    {
      id: 2,
      name: 'MyFitnessPal Premium',
      type: 'Nutrition Tracking App',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=150&h=150&fit=crop',
      rating: 4.4,
      users: '200M+',
      price: '$9.99/month',
      features: ['Macro tracking', 'Recipe importer', 'Goal setting'],
      description: 'Comprehensive nutrition tracking with extensive food database.',
      specialty: 'Weight Management'
    },
    {
      id: 3,
      name: 'Precision Nutrition',
      type: 'Coaching Program',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop',
      rating: 4.8,
      users: '100K+',
      price: '$99/month',
      features: ['1-on-1 coaching', 'Habit tracking', 'Expert guidance'],
      description: 'Science-based nutrition coaching with certified professionals.',
      specialty: 'Behavior Change'
    }
  ];

  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'weight', label: 'Weight Management' },
    { id: 'sports', label: 'Sports Nutrition' },
    { id: 'family', label: 'Family Nutrition' },
    { id: 'medical', label: 'Medical Nutrition' },
    { id: 'diabetes', label: 'Diabetes Care' },
    { id: 'heart', label: 'Heart Health' }
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'budget', label: 'Under $75' },
    { id: 'standard', label: '$75 - $100' },
    { id: 'premium', label: 'Over $100' }
  ];

  const filteredDieticians = dieticians.filter(dietician => {
    const matchesSearch = dietician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dietician.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            dietician.specialty.toLowerCase().includes(selectedSpecialty);
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === 'budget' && dietician.consultationFee < 75) ||
                        (priceRange === 'standard' && dietician.consultationFee >= 75 && dietician.consultationFee <= 100) ||
                        (priceRange === 'premium' && dietician.consultationFee > 100);
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  const DieticianCard = ({ dietician }: { dietician: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={dietician.image} alt={dietician.name} />
            <AvatarFallback>{dietician.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{dietician.name}</h3>
                <p className="text-sm text-muted-foreground">{dietician.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                {dietician.isOnline && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    Online Available
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{dietician.rating}</span>
                <span>({dietician.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{dietician.experience}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{dietician.location}</span>
                <span className="text-green-600">• {dietician.distance}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <Badge variant="outline" className="mr-2">{dietician.specialty}</Badge>
            {dietician.certifications.map((cert, index) => (
              <Badge key={index} variant="secondary" className="mr-1 text-xs">
                {cert}
              </Badge>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">{dietician.bio}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">${dietician.consultationFee}</span>
                <span className="text-muted-foreground">per session</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-green-600">{dietician.nextSlot}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
          {dietician.isOnline && (
            <Button variant="outline">
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
          )}
          <Button variant="outline" size="icon">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const OnlineRecommendationCard = ({ recommendation }: { recommendation: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{recommendation.name}</h3>
                <p className="text-sm text-muted-foreground">{recommendation.type}</p>
              </div>
              <Badge variant="outline">{recommendation.specialty}</Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{recommendation.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recommendation.users} users</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium">Features:</p>
          <div className="flex flex-wrap gap-1">
            {recommendation.features.map((feature: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-lg">{recommendation.price}</span>
          </div>
          <Button>
            Get Started
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Find Nutrition Experts</h2>
        <p className="text-muted-foreground">
          Connect with certified dieticians and nutritionists for personalized guidance
        </p>
      </div>

      <Tabs defaultValue="local" className="space-y-6">
        <TabsList>
          <TabsTrigger value="local">Local Dieticians</TabsTrigger>
          <TabsTrigger value="online">Online Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Enter your location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {filteredDieticians.length} Dieticians Found
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">Sort by: Distance</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredDieticians.map((dietician) => (
                <DieticianCard key={dietician.id} dietician={dietician} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="online" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Recommended Online Platforms</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {onlineRecommendations.map((recommendation) => (
                <OnlineRecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          </div>
          
          {/* Why Choose Online */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Why Choose Online Nutrition Counseling?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Convenient scheduling from home</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Access to specialists worldwide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Often more affordable options</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Digital meal planning tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">24/7 support and tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Flexible communication options</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}