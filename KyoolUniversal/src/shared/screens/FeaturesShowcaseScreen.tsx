import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '../../ui';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  status: 'available' | 'coming_soon' | 'beta';
  gradient: string[];
}

interface FeatureShowcaseScreenProps {
  user?: any;
  onFeatureSelect?: (tab: string) => void;
}

export function FeaturesShowcaseScreen({ user, onFeatureSelect }: FeatureShowcaseScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const features: Feature[] = [
    {
      id: 'dashboard',
      title: 'Smart Dashboard',
      description: 'Get personalized insights and track your progress with our intelligent health dashboard.',
      icon: '📊',
      category: 'health',
      status: 'available',
      gradient: ['#3b82f6', '#1d4ed8'],
    },
    {
      id: 'water',
      title: 'Water Tracking',
      description: 'Stay hydrated with smart reminders and track your daily water intake effortlessly.',
      icon: '💧',
      category: 'health',
      status: 'available',
      gradient: ['#06b6d4', '#0891b2'],
    },
    {
      id: 'fitness',
      title: 'Fitness Tracker',
      description: 'Monitor workouts, track progress, and achieve your fitness goals with personalized plans.',
      icon: '💪',
      category: 'fitness',
      status: 'available',
      gradient: ['#10b981', '#059669'],
    },
    {
      id: 'recipes',
      title: 'Recipe Search',
      description: 'Discover healthy recipes tailored to your dietary preferences and nutritional goals.',
      icon: '🍎',
      category: 'nutrition',
      status: 'available',
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      id: 'health',
      title: 'Health Metrics',
      description: 'Comprehensive health tracking including BMI, BMR, TDEE, and vital statistics.',
      icon: '❤️',
      category: 'health',
      status: 'available',
      gradient: ['#ef4444', '#dc2626'],
    },
    {
      id: 'devices',
      title: 'Device Integration',
      description: 'Connect with popular health devices and apps to sync your data automatically.',
      icon: '⌚',
      category: 'health',
      status: 'available',
      gradient: ['#8b5cf6', '#7c3aed'],
    },
    {
      id: 'friends',
      title: 'Social Features',
      description: 'Connect with friends, share achievements, and motivate each other on your health journey.',
      icon: '👥',
      category: 'social',
      status: 'available',
      gradient: ['#ec4899', '#db2777'],
    },
    {
      id: 'ai_coach',
      title: 'AI Health Coach',
      description: 'Get personalized recommendations and coaching powered by artificial intelligence.',
      icon: '🤖',
      category: 'ai',
      status: 'coming_soon',
      gradient: ['#6366f1', '#4f46e5'],
    },
    {
      id: 'meal_planner',
      title: 'Meal Planner',
      description: 'Plan your meals for the week with AI-generated suggestions based on your goals.',
      icon: '🍽️',
      category: 'nutrition',
      status: 'coming_soon',
      gradient: ['#f97316', '#ea580c'],
    },
    {
      id: 'sleep_tracking',
      title: 'Sleep Analysis',
      description: 'Advanced sleep tracking with insights to improve your sleep quality and patterns.',
      icon: '😴',
      category: 'health',
      status: 'beta',
      gradient: ['#0ea5e9', '#0284c7'],
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness & Meditation',
      description: 'Guided meditation sessions and mindfulness exercises for mental wellbeing.',
      icon: '🧘',
      category: 'wellness',
      status: 'coming_soon',
      gradient: ['#14b8a6', '#0d9488'],
    },
    {
      id: 'grocery_list',
      title: 'Smart Grocery Lists',
      description: 'Generate grocery lists automatically based on your meal plans and dietary needs.',
      icon: '🛒',
      category: 'nutrition',
      status: 'coming_soon',
      gradient: ['#84cc16', '#65a30d'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Features', icon: '🌟' },
    { id: 'health', name: 'Health', icon: '❤️' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'nutrition', name: 'Nutrition', icon: '🍎' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'wellness', name: 'Wellness', icon: '🧘' },
    { id: 'ai', name: 'AI Features', icon: '🤖' },
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available', color: '#10b981', bg: '#dcfce7' };
      case 'beta':
        return { text: 'Beta', color: '#f59e0b', bg: '#fef3c7' };
      case 'coming_soon':
        return { text: 'Coming Soon', color: '#6b7280', bg: '#f3f4f6' };
      default:
        return { text: 'Unknown', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const handleFeaturePress = (feature: Feature) => {
    if (feature.status === 'available' && onFeatureSelect) {
      const tabMap: { [key: string]: string } = {
        'dashboard': 'activity',
        'water': 'water',
        'fitness': 'fitness',
        'recipes': 'recipes',
        'health': 'health',
        'devices': 'devices',
        'friends': 'friends',
      };
      
      const tab = tabMap[feature.id];
      if (tab) {
        onFeatureSelect(tab);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Features</Text>
        <Text style={styles.subtitle}>Discover all the powerful tools to transform your health journey</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {filteredFeatures.map((feature) => {
            const badge = getStatusBadge(feature.status);
            return (
              <Card key={feature.id} style={styles.featureCard}>
                <TouchableOpacity
                  style={styles.featureContent}
                  onPress={() => handleFeaturePress(feature)}
                  disabled={feature.status !== 'available'}
                >
                  <View style={styles.featureHeader}>
                    <View style={[styles.featureIcon, { 
                      backgroundColor: feature.gradient[0] + '20',
                    }]}>
                      <Text style={styles.featureIconText}>{feature.icon}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.color }]}>
                        {badge.text}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>

                  {feature.status === 'available' ? (
                    <Button
                      title="Explore"
                      variant="outline"
                      style={styles.exploreButton}
                      onPress={() => handleFeaturePress(feature)}
                    />
                  ) : feature.status === 'beta' ? (
                    <Button
                      title="Try Beta"
                      variant="outline"
                      style={StyleSheet.flatten([styles.exploreButton, styles.betaButton])}
                    />
                  ) : (
                    <View style={styles.comingSoonButton}>
                      <Text style={styles.comingSoonText}>Coming Soon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>

        {/* Stats Section */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Feature Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {features.filter(f => f.status === 'available').length}
              </Text>
              <Text style={styles.statLabel}>Available Features</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {features.filter(f => f.status === 'beta').length}
              </Text>
              <Text style={styles.statLabel}>Beta Features</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {features.filter(f => f.status === 'coming_soon').length}
              </Text>
              <Text style={styles.statLabel}>Coming Soon</Text>
            </View>
          </View>
        </Card>

        {/* Feedback Section */}
        <Card style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>💡 Have a Feature Idea?</Text>
          <Text style={styles.feedbackDescription}>
            We're always looking to improve your experience. Share your ideas for new features!
          </Text>
          <Button
            title="Send Feedback"
            style={styles.feedbackButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featureContent: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  exploreButton: {
    alignSelf: 'flex-start',
  },
  betaButton: {
    borderColor: '#f59e0b',
  },
  comingSoonButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsCard: {
    marginTop: 32,
    marginBottom: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  feedbackCard: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  feedbackButton: {
    alignSelf: 'center',
  },
});