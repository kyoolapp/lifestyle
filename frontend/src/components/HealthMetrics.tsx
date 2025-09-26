import React, { useState } from 'react';
import { addWeightLog, getWeightLogs } from '../api/user_api';
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      setUser({
        ...user,
        height: metrics.height,
        weight: metrics.weight,
        age: metrics.age
      });
      if (!user.id) {
        setLoading(false);
        return;
      }
      const now = new Date().toISOString();
      await addWeightLog(
        user.id,
        metrics.weight,
        now,
        bmi,
        bmr,
        tdee
      );
      // Refetch logs after saving to update graph immediately
      const updatedLogs = await getWeightLogs(user.id);
      setWeightLogs(updatedLogs);
    } catch (err) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Health Metrics</h1>
        <p className="text-muted-foreground mt-1">Track and monitor your vital health indicators</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Update Your Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={metrics.height}
                onChange={(e) => setMetrics({ ...metrics, height: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={metrics.weight}
                onChange={(e) => setMetrics({ ...metrics, weight: parseFloat(e.target.value) || 0 })}
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
          <CardTitle>Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightLogs} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip labelFormatter={date => new Date(date).toLocaleString()} />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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