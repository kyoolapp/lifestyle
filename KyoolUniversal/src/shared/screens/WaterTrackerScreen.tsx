import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { getTodayWaterIntake, logWaterIntake, setWaterIntake, getWaterHistory } from '../services/api';

interface WaterTrackerScreenProps {
  user?: any;
}

interface WeeklyData {
  day: string;
  intake: number;
  goal: number;
  date: string;
}

export function WaterTrackerScreen({ user }: WaterTrackerScreenProps) {
  const [dailyGoal] = useState(8); // glasses
  const [todayIntake, setTodayIntake] = useState(0);
  const [glassSize] = useState(250); // ml
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  // Load water data on mount
  useEffect(() => {
    loadWaterData();
  }, [user?.id]);

  const loadWaterData = async () => {
    if (!user?.id) return;
    
    try {
      // Load today's intake
      const todayGlasses = await getTodayWaterIntake(user.id);
      setTodayIntake(todayGlasses);
      
      // Load weekly history (last 7 days)
      const history = await getWaterHistory(user.id, 7);
      
      // Create weekly data for the last 7 days
      const today = new Date();
      const weeklyData: WeeklyData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Find matching history entry for this date
        const historyEntry = history.find((h: any) => h.date === dateString);
        
        weeklyData.push({
          day: dayName,
          intake: historyEntry ? historyEntry.glasses : 0,
          goal: 8,
          date: dateString
        });
      }
      
      setWeeklyData(weeklyData);
    } catch (error) {
      console.error('Failed to load water data:', error);
    }
  };

  const handleAddWater = async (glasses: number = 1) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await logWaterIntake(user.id, glasses);
      const newIntake = todayIntake + glasses;
      setTodayIntake(newIntake);
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newIntake } : day
      ));
      
      // Show achievement if goal reached
      if (todayIntake < dailyGoal && newIntake >= dailyGoal) {
        Alert.alert('🎉 Goal Achieved!', 'Great job! You\'ve reached your daily water intake goal!');
      }
    } catch (error) {
      console.error('Failed to log water:', error);
      Alert.alert('Error', 'Failed to log water intake');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWater = async () => {
    if (!user?.id || todayIntake <= 0) return;
    
    setLoading(true);
    try {
      const newIntake = Math.max(0, todayIntake - 1);
      await setWaterIntake(user.id, newIntake);
      setTodayIntake(newIntake);
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newIntake } : day
      ));
    } catch (error) {
      console.error('Failed to update water:', error);
      Alert.alert('Error', 'Failed to update water intake');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min((todayIntake / dailyGoal) * 100, 100);
  const totalMl = todayIntake * glassSize;
  const isGoalReached = todayIntake >= dailyGoal;

  // Calculate streaks and stats
  const streak = calculateStreak();
  const weeklyAverage = weeklyData.length > 0 
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.intake, 0) / weeklyData.length * 10) / 10
    : 0;

  function calculateStreak(): number {
    let streak = 0;
    const sortedData = [...weeklyData].reverse(); // Start from today
    
    for (const day of sortedData) {
      if (day.intake >= day.goal) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const quickAddOptions = [
    { glasses: 1, label: '1 Glass', subtitle: '250ml' },
    { glasses: 2, label: '2 Glasses', subtitle: '500ml' },
    { glasses: 3, label: '3 Glasses', subtitle: '750ml' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Tracker</Text>
          <Text style={styles.subtitle}>Stay hydrated throughout your day</Text>
        </View>

        {/* Today's Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.waterIcon}>
              <Text style={styles.waterEmoji}>💧</Text>
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Intake</Text>
              <Text style={styles.progressAmount}>
                {todayIntake} / {dailyGoal} glasses
              </Text>
              <Text style={styles.progressMl}>{totalMl} ml</Text>
            </View>
            {isGoalReached && (
              <Badge variant="default" style={styles.goalBadge}>
                🎉 Goal Reached!
              </Badge>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: isGoalReached ? '#10b981' : '#3b82f6'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
        </Card>

        {/* Quick Add */}
        <Card style={styles.quickAddCard}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {quickAddOptions.map((option) => (
              <TouchableOpacity
                key={option.glasses}
                style={styles.quickAddButton}
                onPress={() => handleAddWater(option.glasses)}
                disabled={loading}
              >
                <Text style={styles.quickAddLabel}>{option.label}</Text>
                <Text style={styles.quickAddSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.manualControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.removeButton]}
              onPress={handleRemoveWater}
              disabled={loading || todayIntake <= 0}
            >
              <Text style={styles.controlButtonText}>−</Text>
            </TouchableOpacity>
            
            <View style={styles.currentCount}>
              <Text style={styles.currentCountText}>{todayIntake}</Text>
              <Text style={styles.currentCountLabel}>glasses</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.addButton]}
              onPress={() => handleAddWater(1)}
              disabled={loading}
            >
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Weekly Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyAverage}</Text>
              <Text style={styles.statLabel}>Weekly Avg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyGoal}</Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyChart}>
            {weeklyData.map((day, index) => {
              const percentage = Math.min((day.intake / day.goal) * 100, 100);
              const isToday = index === weeklyData.length - 1;
              
              return (
                <View key={day.date} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <View 
                        style={[
                          styles.barFill, 
                          { 
                            height: `${percentage}%`,
                            backgroundColor: day.intake >= day.goal ? '#10b981' : '#3b82f6'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <Text style={[
                    styles.chartDayLabel,
                    isToday && styles.todayLabel
                  ]}>
                    {day.day}
                  </Text>
                  <Text style={styles.chartIntakeValue}>{day.intake}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Hydration Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Hydration Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>💡 Start your day with a glass of water</Text>
            <Text style={styles.tip}>⏰ Set reminders every 2 hours</Text>
            <Text style={styles.tip}>🍋 Add lemon or cucumber for flavor</Text>
            <Text style={styles.tip}>🏃 Drink extra water during workouts</Text>
          </View>
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
    flexGrow: 1,
    paddingBottom: 30,
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
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  waterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  waterEmoji: {
    fontSize: 24,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  progressAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  progressMl: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalBadge: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 35,
    textAlign: 'right',
  },
  quickAddCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAddButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  quickAddLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  quickAddSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  manualControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  addButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  currentCount: {
    alignItems: 'center',
    minWidth: 80,
  },
  currentCountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  currentCountLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barContainer: {
    height: 80,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barBackground: {
    width: 24,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignSelf: 'center',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 2,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  todayLabel: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartIntakeValue: {
    fontSize: 10,
    color: '#9ca3af',
  },
  tipsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});