import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '../../ui';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';
import { createOrUpdateUser } from '../services/api';

interface HealthMetricsScreenProps {
  user?: any;
  userProfile?: any;
  setUser?: (user: any) => void;
}

export function HealthMetricsScreen({ user, userProfile, setUser }: HealthMetricsScreenProps) {
  const [metrics, setMetrics] = useState({
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    systolic: '',
    diastolic: '',
    restingHeartRate: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate health metrics
  const bmi = calculateBMI(parseFloat(metrics.weight), parseFloat(metrics.height));
  const bmr = calculateBMR(parseFloat(metrics.weight), parseFloat(metrics.height), parseInt(metrics.age), metrics.gender);
  const tdee = bmr ? calculateTDEE(bmr, metrics.activityLevel) : null;

  // BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { category: 'Normal', color: '#10b981' };
    if (bmi < 30) return { category: 'Overweight', color: '#f59e0b' };
    return { category: 'Obese', color: '#ef4444' };
  };

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleSave = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const updatedUserData = {
        ...user,
        height: parseFloat(metrics.height) || user.height,
        weight: parseFloat(metrics.weight) || user.weight,
        age: parseInt(metrics.age) || user.age,
        gender: metrics.gender,
        activityLevel: metrics.activityLevel,
      };

      await createOrUpdateUser(user.uid, updatedUserData);
      if (setUser) {
        setUser(updatedUserData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMetrics({
      height: user?.height?.toString() || '',
      weight: user?.weight?.toString() || '',
      age: user?.age?.toString() || '',
      gender: user?.gender || 'male',
      activityLevel: user?.activityLevel || 'moderate',
      systolic: '',
      diastolic: '',
      restingHeartRate: '',
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Health Metrics</Text>
        <Text style={styles.subtitle}>Track and monitor your health indicators</Text>

        {/* Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{bmi ? bmi.toFixed(1) : 'N/A'}</Text>
            <Text style={styles.metricLabel}>BMI</Text>
            {bmiCategory && (
              <View style={[styles.categoryBadge, { backgroundColor: bmiCategory.color + '20' }]}>
                <Text style={[styles.categoryText, { color: bmiCategory.color }]}>
                  {bmiCategory.category}
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{bmr || 'N/A'}</Text>
            <Text style={styles.metricLabel}>BMR</Text>
            <Text style={styles.metricUnit}>cal/day</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{tdee || 'N/A'}</Text>
            <Text style={styles.metricLabel}>TDEE</Text>
            <Text style={styles.metricUnit}>cal/day</Text>
          </Card>
        </View>

        {/* Body Measurements */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <Button
              title={isEditing ? 'Cancel' : 'Edit'}
              variant="outline"
              onPress={isEditing ? handleCancel : () => setIsEditing(true)}
              style={styles.editButton}
            />
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputRow}>
                <Input
                  label="Height (cm)"
                  value={metrics.height}
                  onChangeText={(text) => setMetrics({ ...metrics, height: text })}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="Weight (kg)"
                  value={metrics.weight}
                  onChangeText={(text) => setMetrics({ ...metrics, weight: text })}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
              </View>

              <View style={styles.inputRow}>
                <Input
                  label="Age"
                  value={metrics.age}
                  onChangeText={(text) => setMetrics({ ...metrics, age: text })}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderButtons}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        metrics.gender === 'male' && styles.genderButtonActive,
                      ]}
                      onPress={() => setMetrics({ ...metrics, gender: 'male' })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          metrics.gender === 'male' && styles.genderButtonTextActive,
                        ]}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        metrics.gender === 'female' && styles.genderButtonActive,
                      ]}
                      onPress={() => setMetrics({ ...metrics, gender: 'female' })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          metrics.gender === 'female' && styles.genderButtonTextActive,
                        ]}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={loading}
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View style={styles.readOnlyForm}>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Height:</Text>
                <Text style={styles.measurementValue}>
                  {metrics.height ? `${metrics.height} cm` : 'Not set'}
                </Text>
              </View>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Weight:</Text>
                <Text style={styles.measurementValue}>
                  {metrics.weight ? `${metrics.weight} kg` : 'Not set'}
                </Text>
              </View>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Age:</Text>
                <Text style={styles.measurementValue}>
                  {metrics.age || 'Not set'}
                </Text>
              </View>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>Gender:</Text>
                <Text style={styles.measurementValue}>
                  {metrics.gender ? metrics.gender.charAt(0).toUpperCase() + metrics.gender.slice(1) : 'Not set'}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Health Goals */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <View style={styles.goalsList}>
            <View style={styles.goalItem}>
              <Text style={styles.goalTitle}>Maintain Healthy Weight</Text>
              <Text style={styles.goalStatus}>In Progress</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalTitle}>Improve Cardiovascular Health</Text>
              <Text style={styles.goalStatus}>Not Started</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalTitle}>Increase Daily Activity</Text>
              <Text style={styles.goalStatus}>Active</Text>
            </View>
          </View>
        </Card>

        {/* Health Tips */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.tipsList}>
            {bmi && bmi > 25 && (
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>⚠️</Text>
                <Text style={styles.tipText}>
                  Your BMI suggests you may benefit from weight management. Consider consulting a healthcare professional.
                </Text>
              </View>
            )}
            {bmr && (
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🔥</Text>
                <Text style={styles.tipText}>
                  Your body burns approximately {bmr} calories at rest. This is your baseline energy requirement.
                </Text>
              </View>
            )}
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💪</Text>
              <Text style={styles.tipText}>
                Regular exercise and balanced nutrition are key to maintaining optimal health metrics.
              </Text>
            </View>
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 10,
    color: '#94a3b8',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editForm: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  genderButtonTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
  },
  readOnlyForm: {
    gap: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  measurementValue: {
    fontSize: 14,
    color: '#64748b',
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  goalStatus: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});