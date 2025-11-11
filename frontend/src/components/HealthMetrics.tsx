import React, { useState } from 'react';
import { addWeightLog, getWeightLogs } from '../api/user_api';
import { useUnitSystem } from '../context/UnitContext';
import { weightConversions, heightConversions, heightInFeetInchesFromCm } from '../utils/unitConversion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Heart, Scale, Calculator, TrendingUp, Activity } from 'lucide-react';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';

interface HealthMetricsProps {
  user: any;
  setUser: (user: any) => void;
}

export function HealthMetrics({ user, setUser }: HealthMetricsProps) {
  // console.log('HealthMetrics component rendered');
  const { unitSystem } = useUnitSystem();
  const [weightLogs, setWeightLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    height: user.height,
    weight: user.weight,
    age: user.age,
    bodyFat: 15, // percentage
    restingHeartRate: 65,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80
  });
  
  // Display values for inputs (converted to user's preferred unit)
  const [displayWeight, setDisplayWeight] = useState(
    unitSystem === 'metric' ? user.weight : weightConversions.dbToDisplay(user.weight, 'imperial')
  );
  const [displayHeight, setDisplayHeight] = useState(user.height);
  const [displayHeightFeet, setDisplayHeightFeet] = useState(
    unitSystem === 'metric' ? user.height : heightInFeetInchesFromCm(user.height).feet
  );
  const [displayHeightInches, setDisplayHeightInches] = useState(
    unitSystem === 'metric' ? 0 : heightInFeetInchesFromCm(user.height).inches
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'blue', description: 'Consider gaining weight' };
    if (bmi < 25) return { label: 'Normal', color: 'green', description: 'Healthy weight range' };
    if (bmi < 30) return { label: 'Overweight', color: 'yellow', description: 'Consider losing weight' };
    return { label: 'Obese', color: 'red', description: 'Consult healthcare provider' };
  };

  const getBodyFatCategory = (bodyFat: number, gender: string = 'male') => {
    if (gender === 'male') {
      if (bodyFat < 6) return { label: 'Essential', color: 'blue' };
      if (bodyFat < 14) return { label: 'Athletic', color: 'green' };
      if (bodyFat < 18) return { label: 'Fitness', color: 'green' };
      if (bodyFat < 25) return { label: 'Average', color: 'yellow' };
      return { label: 'Obese', color: 'red' };
    } else {
      if (bodyFat < 12) return { label: 'Essential', color: 'blue' };
      if (bodyFat < 21) return { label: 'Athletic', color: 'green' };
      if (bodyFat < 25) return { label: 'Fitness', color: 'green' };
      if (bodyFat < 32) return { label: 'Average', color: 'yellow' };
      return { label: 'Obese', color: 'red' };
    }
  };


   // Fetch weight logs on mount
  React.useEffect(() => {
    async function fetchLogs() {
      if (user.id) {
        try {
          const logs = await getWeightLogs(user.id);
          setWeightLogs(logs);
        } catch (err) {
          setError('Failed to fetch weight logs');
        }
      }
    }
    fetchLogs();
  }, [user.id]);

  // Sync display values when unitSystem changes
  React.useEffect(() => {
    if (unitSystem === 'metric') {
      setDisplayWeight(metrics.weight);
      setDisplayHeight(metrics.height);
      setDisplayHeightFeet(0);
      setDisplayHeightInches(0);
    } else {
      setDisplayWeight(weightConversions.dbToDisplay(metrics.weight, 'imperial'));
      const { feet, inches } = heightInFeetInchesFromCm(metrics.height);
      setDisplayHeightFeet(feet);
      setDisplayHeightInches(inches);
    }
  }, [unitSystem]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Update local user state first
      const updatedUser = {
        ...user,
        height: metrics.height,
        weight: metrics.weight,
        age: metrics.age
      };
      setUser(updatedUser);
      
      if (!user.id) {
        setLoading(false);
        return;
      }
      
      // Add weight log to backend
      const now = new Date().toISOString();
      const logResult = await addWeightLog(
        user.id,
        metrics.weight,
        now,
        bmi,
        bmr,
        tdee
      );
      
      console.log('Weight log saved:', logResult);
      
      // Refresh weight logs from backend to update graph immediately
      const updatedLogs = await getWeightLogs(user.id);
      setWeightLogs(updatedLogs);
      
      console.log('Weight logs refreshed from backend, graph should update now:', updatedLogs);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const bmi = calculateBMI(metrics.weight, metrics.height);
  const bmiCategory = getBMICategory(bmi ?? 0);
  const bodyFatCategory = getBodyFatCategory(metrics.bodyFat);
  const bmr = calculateBMR(metrics.weight, metrics.height, metrics.age, user.gender);
  //console.log("User activity level:",user.activity_level);
  const tdee = calculateTDEE(bmr ?? 0, user.activityLevel);

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Health Metrics</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Track and monitor your vital health indicators</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="w-4 h-4 md:w-5 md:h-5" />
            Update Your Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {unitSystem === 'metric' ? (
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={displayHeight}
                  onChange={(e) => {
                    const cmValue = parseFloat(e.target.value) || 0;
                    setDisplayHeight(cmValue);
                    setMetrics({ ...metrics, height: cmValue });
                  }}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="height-feet">Height - Feet</Label>
                  <Input
                    id="height-feet"
                    type="number"
                    min={3}
                    max={8}
                    placeholder="Feet"
                    value={displayHeightFeet}
                    onChange={(e) => {
                      const feet = parseFloat(e.target.value) || 0;
                      setDisplayHeightFeet(feet);
                      const cmValue = heightConversions.displayToDb(0, 'imperial', feet, displayHeightInches);
                      setMetrics({ ...metrics, height: cmValue });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="height-inches">Height - Inches</Label>
                  <Input
                    id="height-inches"
                    type="number"
                    min={0}
                    max={11}
                    placeholder="Inches"
                    value={displayHeightInches}
                    onChange={(e) => {
                      const inches = parseFloat(e.target.value) || 0;
                      setDisplayHeightInches(inches);
                      const cmValue = heightConversions.displayToDb(0, 'imperial', displayHeightFeet, inches);
                      setMetrics({ ...metrics, height: cmValue });
                    }}
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="weight">Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={displayWeight}
                onChange={(e) => {
                  const displayValue = parseFloat(e.target.value) || 0;
                  setDisplayWeight(displayValue);
                  // Convert to metric for storage in metrics state
                  const metricValue = unitSystem === 'metric' ? displayValue : weightConversions.displayToDb(displayValue, 'imperial');
                  setMetrics({ ...metrics, weight: metricValue });
                }}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={metrics.age}
                onChange={(e) => setMetrics({ ...metrics, age: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                value={metrics.bodyFat}
                onChange={(e) => setMetrics({ ...metrics, bodyFat: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <Button type="button" onClick={handleSave} className="mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>
      </Card>

      {/* Calculated Metrics */}
      {/* Weight Progress Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress ({unitSystem === 'metric' ? 'kg' : 'lbs'})</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart 
              data={weightLogs && Array.isArray(weightLogs) ? weightLogs.map((log: any) => ({
                ...log,
                displayWeight: unitSystem === 'metric' ? log.weight : weightConversions.dbToDisplay(log.weight, 'imperial')
              })) : []} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip 
                labelFormatter={date => new Date(date).toLocaleString()}
                formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
              />
              <Line type="monotone" dataKey="displayWeight" stroke="#8884d8" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bmi ?? ''}</div>
            <Badge variant={bmiCategory.color === 'green' ? 'default' : 'secondary'} className="mt-1">
              {bmiCategory.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">{bmiCategory.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bodyFat}%</div>
            <Badge variant={bodyFatCategory.color === 'green' ? 'default' : 'secondary'} className="mt-1">
              {bodyFatCategory.label}
            </Badge>
            <Progress value={metrics.bodyFat} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bmr}</div>
            <p className="text-xs text-muted-foreground">calories/day at rest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TDEE</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tdee}</div>
            <p className="text-xs text-muted-foreground">total daily calories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resting HR</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.restingHeartRate}</div>
            <p className="text-xs text-muted-foreground">beats per minute</p>
            <Input
              type="number"
              value={metrics.restingHeartRate}
              onChange={(e) => setMetrics({ ...metrics, restingHeartRate: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bloodPressureSystolic}/{metrics.bloodPressureDiastolic}</div>
            <p className="text-xs text-muted-foreground">mmHg</p>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                placeholder="Systolic"
                value={metrics.bloodPressureSystolic}
                onChange={(e) => setMetrics({ ...metrics, bloodPressureSystolic: parseFloat(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Diastolic"
                value={metrics.bloodPressureDiastolic}
                onChange={(e) => setMetrics({ ...metrics, bloodPressureDiastolic: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Daily Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{tdee}</div>
              <p className="text-sm text-muted-foreground">Maintain Weight</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{(tdee ?? 0) - 500}</div>
              <p className="text-sm text-muted-foreground">Lose 0.5kg/week</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{(tdee ?? 0) + 300}</div>
              <p className="text-sm text-muted-foreground">Gain Weight</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">2.5L</div>
              <p className="text-sm text-muted-foreground">Water Intake</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}