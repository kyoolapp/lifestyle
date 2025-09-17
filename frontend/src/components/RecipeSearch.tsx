import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Clock, 
  Users, 
  Star,
  Heart,
  Share2,
  Crown,
  ChefHat,
  AlertTriangle,
  Shield,
  Zap,
  ShieldAlert,
  Target,
  Brain,
  TrendingUp,
  Filter,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FindDietician } from './FindDietician';
import { FoodProfiles } from './FoodProfiles';

interface RecipeSearchProps {
  user: any;
  safeZone: boolean;
}

export function RecipeSearch({ user, safeZone }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ingredients, setIngredients] = useState('');
  const [localSafeZone, setLocalSafeZone] = useState(safeZone);

  // Mock recipe data
  const recipes = [
    {
      id: 1,
      title: 'Mediterranean Quinoa Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      cookTime: 25,
      servings: 2,
      calories: 420,
      rating: 4.8,
      difficulty: 'Easy',
      category: 'healthy',
      ingredients: ['quinoa', 'chickpeas', 'tomatoes', 'cucumber', 'olive oil'],
      author: 'Chef Maria',
      isPremium: false
    },
    {
      id: 2,
      title: 'Grilled Salmon with Vegetables',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
      cookTime: 30,
      servings: 4,
      calories: 350,
      rating: 4.9,
      difficulty: 'Medium',
      category: 'protein',
      ingredients: ['salmon', 'broccoli', 'asparagus', 'lemon', 'garlic'],
      author: 'Chef John',
      isPremium: false
    },
    {
      id: 3,
      title: 'Loaded Bacon Cheeseburger',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
      cookTime: 20,
      servings: 1,
      calories: 850,
      rating: 4.3,
      difficulty: 'Easy',
      category: 'comfort',
      ingredients: ['beef patty', 'bacon', 'cheese', 'bun', 'fries'],
      author: 'Chef Mike',
      isPremium: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Recipes' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'protein', label: 'High Protein' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'comfort', label: 'Comfort Food' }
  ];

  const isHighCalorie = (calories: number) => {
    return calories > (user.dailyCalorieTarget * 0.4);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ingredientBasedRecipes = recipes.filter(recipe => {
    if (!ingredients.trim()) return false;
    const userIngredients = ingredients.toLowerCase().split(',').map(ing => ing.trim());
    return userIngredients.some(userIng => 
      recipe.ingredients.some(recipeIng => recipeIng.toLowerCase().includes(userIng))
    );
  });

  const RecipeCard = ({ recipe }: { recipe: any }) => {
    const isExcessive = isHighCalorie(recipe.calories);
    
    return (
      <Card className={`group hover:shadow-lg transition-shadow ${
        localSafeZone && isExcessive ? 'border-red-300 bg-red-50/30' : ''
      }`}>
        <div className="relative">
          <ImageWithFallback 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          
          {localSafeZone && isExcessive && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High Cal
            </Badge>
          )}
          
          {recipe.isPremium && (
            <Badge className={`absolute top-2 ${localSafeZone && isExcessive ? 'left-20' : 'right-2'} bg-yellow-500 text-yellow-900`}>
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight">{recipe.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {recipe.rating}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">by {recipe.author}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.cookTime}m
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings}
            </div>
            <div className={`flex items-center gap-1 ${
              isExcessive ? 'text-red-600 font-medium' : ''
            }`}>
              <Zap className={`w-4 h-4 ${
                isExcessive ? 'text-red-500' : 'text-green-500'
              }`} />
              {recipe.calories} cal
            </div>
          </div>
          
          {localSafeZone && isExcessive && (
            <Alert className="mb-3 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-xs text-orange-800">
                This recipe is high in calories for your current goals.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
            {recipe.ingredients.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.ingredients.length - 3} more
              </Badge>
            )}
          </div>
          
          <Button 
            className="w-full" 
            disabled={recipe.isPremium && !user.isPremium}
            variant={localSafeZone && isExcessive ? "outline" : "default"}
          >
            {recipe.isPremium && !user.isPremium ? 'Premium Recipe' : 
             localSafeZone && isExcessive ? 'View with Caution' : 'View Recipe'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">Recipe Discovery</h1>
            <Badge variant="secondary" className="text-sm">
              {filteredRecipes.length} recipes
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Find recipes, dieticians, and manage family food profiles
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            {localSafeZone ? <Shield className="w-4 h-4 text-green-600" /> : <ShieldAlert className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium">Safe Zone</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSafeZone}
              onChange={(e) => setLocalSafeZone(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Recipes</TabsTrigger>
          <TabsTrigger value="ingredients" disabled={!user.isPremium}>
            <Crown className="w-4 h-4 mr-2" />
            By Ingredients {!user.isPremium && '(Premium)'}
          </TabsTrigger>
          <TabsTrigger value="dietician">
            <Stethoscope className="w-4 h-4 mr-2" />
            Find Dietician
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <UserCheck className="w-4 h-4 mr-2" />
            Food Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search recipes or ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-6">
          {user.isPremium ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Find Recipes by Your Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        What ingredients do you have? (comma separated)
                      </label>
                      <Input
                        placeholder="e.g. chicken, tomatoes, garlic, onions"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the ingredients you have available, and we'll find recipes that use them!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {ingredients.trim() && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Recipes using your ingredients ({ingredientBasedRecipes.length} found)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ingredientBasedRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Premium to search for recipes based on ingredients you have at home.
                </p>
                <Button>Upgrade to Premium</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dietician" className="space-y-6">
          <FindDietician user={user} />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <FoodProfiles user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}