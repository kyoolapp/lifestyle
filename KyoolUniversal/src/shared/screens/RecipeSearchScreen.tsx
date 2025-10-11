import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface RecipeSearchScreenProps {
  user?: any;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  cookTime: number;
  servings: number;
  calories: number;
  rating: number;
  difficulty: string;
  category: string;
  ingredients: string[];
  author: string;
  isPremium: boolean;
}

export function RecipeSearchScreen({ user }: RecipeSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'search' | 'ingredients' | 'favorites'>('search');
  const [ingredients, setIngredients] = useState('');
  const [favorites, setFavorites] = useState<number[]>([1, 2]);

  // Mock recipe data
  const recipes: Recipe[] = [
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
    },
    {
      id: 4,
      title: 'Avocado Toast with Eggs',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop',
      cookTime: 10,
      servings: 1,
      calories: 320,
      rating: 4.6,
      difficulty: 'Easy',
      category: 'breakfast',
      ingredients: ['avocado', 'eggs', 'bread', 'tomato', 'salt'],
      author: 'Chef Sarah',
      isPremium: false
    },
    {
      id: 5,
      title: 'Chicken Caesar Salad',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
      cookTime: 15,
      servings: 2,
      calories: 380,
      rating: 4.7,
      difficulty: 'Easy',
      category: 'healthy',
      ingredients: ['chicken breast', 'romaine lettuce', 'caesar dressing', 'parmesan', 'croutons'],
      author: 'Chef Alex',
      isPremium: true
    },
    {
      id: 6,
      title: 'Chocolate Chip Pancakes',
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&h=200&fit=crop',
      cookTime: 20,
      servings: 4,
      calories: 520,
      rating: 4.9,
      difficulty: 'Medium',
      category: 'breakfast',
      ingredients: ['flour', 'eggs', 'milk', 'chocolate chips', 'butter'],
      author: 'Chef Emily',
      isPremium: true
    },
  ];

  const categories = [
    { id: 'all', label: 'All Recipes' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'protein', label: 'High Protein' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'comfort', label: 'Comfort Food' },
  ];

  const isHighCalorie = (calories: number) => {
    const dailyTarget = user?.dailyCalorieTarget || 2000;
    return calories > (dailyTarget * 0.4);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ingredientBasedRecipes = recipes.filter(recipe => {
    if (!ingredients.trim()) return [];
    const userIngredients = ingredients.toLowerCase().split(',').map(ing => ing.trim());
    return userIngredients.some(userIng => 
      recipe.ingredients.some(recipeIng => recipeIng.toLowerCase().includes(userIng))
    );
  });

  const favoriteRecipes = recipes.filter(recipe => favorites.includes(recipe.id));

  const toggleFavorite = (recipeId: number) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const renderRecipeCard = (recipe: Recipe) => {
    const isExcessive = isHighCalorie(recipe.calories);
    const isFavorite = favorites.includes(recipe.id);

    return (
      <Card key={recipe.id} style={{ ...styles.recipeCard, ...(isExcessive ? styles.highCalorieCard : {}) }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          {isExcessive && (
            <Badge variant="default" style={styles.highCalorieBadge}>
              ⚠️ High Cal
            </Badge>
          )}
          {recipe.isPremium && (
            <Badge variant="secondary" style={styles.premiumBadge}>
              👑 Premium
            </Badge>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(recipe.id)}
          >
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {recipe.rating}</Text>
            </View>
          </View>

          <Text style={styles.recipeAuthor}>by {recipe.author}</Text>

          <View style={styles.recipeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statText}>{recipe.cookTime}m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statText}>{recipe.servings}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statIcon, isExcessive && styles.highCalorieIcon]}>⚡</Text>
              <Text style={[styles.statText, isExcessive && styles.highCalorieText]}>
                {recipe.calories} cal
              </Text>
            </View>
          </View>

          {isExcessive && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ This recipe is high in calories for your current goals
              </Text>
            </View>
          )}

          <View style={styles.ingredientsContainer}>
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <Badge key={index} variant="secondary" style={styles.ingredientBadge}>
                {ingredient}
              </Badge>
            ))}
            {recipe.ingredients.length > 3 && (
              <Badge variant="secondary" style={styles.ingredientBadge} textStyle={styles.ingredientBadgeText}>
                +{recipe.ingredients.length - 3} more
              </Badge>
            )}
          </View>

          <Button
            variant={isExcessive ? "outline" : "default"}
            size="sm"
            disabled={recipe.isPremium && !user?.isPremium}
            style={styles.viewButton}
          >
            {recipe.isPremium && !user?.isPremium ? 'Premium Only' : 'View Recipe'}
          </Button>
        </View>
      </Card>
    );
  };

  const renderTabButton = (tab: string, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Search</Text>
        <Text style={styles.subtitle}>Discover healthy and delicious recipes</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('search', 'Search')}
        {renderTabButton('ingredients', 'By Ingredients')}
        {renderTabButton('favorites', 'Favorites', favorites.length)}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'search' && (
          <>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.activeCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.activeCategoryButtonText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Recipe Results */}
            <Text style={styles.resultsText}>
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
            </Text>

            {filteredRecipes.map(renderRecipeCard)}
          </>
        )}

        {activeTab === 'ingredients' && (
          <>
            <View style={styles.ingredientsSearchContainer}>
              <Text style={styles.ingredientsTitle}>Find Recipes by Ingredients</Text>
              <Text style={styles.ingredientsSubtitle}>
                Enter ingredients you have (separated by commas)
              </Text>
              <TextInput
                style={styles.ingredientsInput}
                placeholder="e.g. chicken, tomatoes, cheese"
                value={ingredients}
                onChangeText={setIngredients}
                multiline
              />
              {ingredientBasedRecipes.length > 0 && (
                <Text style={styles.resultsText}>
                  {ingredientBasedRecipes.length} recipe{ingredientBasedRecipes.length !== 1 ? 's' : ''} found
                </Text>
              )}
            </View>

            {ingredientBasedRecipes.length === 0 && ingredients.trim() && (
              <Card style={styles.noResultsCard}>
                <Text style={styles.noResultsText}>
                  No recipes found with those ingredients. Try different combinations!
                </Text>
              </Card>
            )}

            {ingredientBasedRecipes.map(renderRecipeCard)}
          </>
        )}

        {activeTab === 'favorites' && (
          <>
            {favoriteRecipes.length === 0 ? (
              <Card style={styles.noResultsCard}>
                <Text style={styles.noResultsTitle}>No Favorites Yet</Text>
                <Text style={styles.noResultsText}>
                  Tap the heart icon on recipes to add them to your favorites!
                </Text>
              </Card>
            ) : (
              <>
                <Text style={styles.resultsText}>
                  {favoriteRecipes.length} favorite recipe{favoriteRecipes.length !== 1 ? 's' : ''}
                </Text>
                {favoriteRecipes.map(renderRecipeCard)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  activeCategoryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  recipeCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  highCalorieCard: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  imageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  highCalorieBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f59e0b',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  favoriteIconActive: {
    fontSize: 20,
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  recipeAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  recipeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  highCalorieIcon: {
    color: '#ef4444',
  },
  highCalorieText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#fef3cd',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  ingredientBadge: {},
  ingredientBadgeText: {
    fontSize: 12,
  },
  viewButton: {
    width: '100%',
  },
  ingredientsSearchContainer: {
    marginBottom: 24,
  },
  ingredientsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  ingredientsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  ingredientsInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  noResultsCard: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});