import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { 
  Watch, 
  Smartphone, 
  Activity,
  Bluetooth,
  Wifi,
  Battery,
  Heart,
  Zap,
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

export function DeviceConnections() {
  const [devices, setDevices] = useState([
    {
      id: 'apple-watch',
      name: 'Apple Watch Series 9',
      type: 'Apple Watch',
      icon: Watch,
      connected: true,
      battery: 85,
      lastSync: '2 minutes ago',
      syncStatus: 'synced',
      features: ['Heart Rate', 'Steps', 'Workout Detection', 'Sleep Tracking'],
      data: {
        heartRate: 72,
        steps: 8547,
        activeCalories: 450,
        workouts: 1
      }
    },
    {
      id: 'iphone',
      name: 'iPhone 15 Pro',
      type: 'iPhone',
      icon: Smartphone,
      connected: true,
      battery: 73,
      lastSync: '1 minute ago',
      syncStatus: 'synced',
      features: ['Health App Sync', 'HealthKit Integration', 'Location Services'],
      data: {
        steps: 8547,
        flightsClimbed: 12,
        distanceWalked: 6.2
      }
    },
    {
      id: 'fitbit',
      name: 'Fitbit Charge 6',
      type: 'Fitbit',
      icon: Activity,
      connected: false,
      battery: 0,
      lastSync: 'Never',
      syncStatus: 'disconnected',
      features: ['Heart Rate', 'Sleep Score', 'Stress Management', 'GPS'],
      data: null
    },
    {
      id: 'garmin',
      name: 'Garmin Forerunner 955',
      type: 'Garmin',
      icon: Watch,
      connected: false,
      battery: 0,
      lastSync: 'Never',
      syncStatus: 'available',
      features: ['Advanced Running Metrics', 'VO2 Max', 'Training Status'],
      data: null
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);

  // Mock real-time data updates for connected devices
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => {
          if (device.connected && device.data) {
            return {
              ...device,
              data: {
                ...device.data,
                steps: device.data.steps + Math.floor(Math.random() * 3),
                heartRate: device.data.heartRate 
                  ? 70 + Math.floor(Math.random() * 10) 
                  : device.data.heartRate,
                activeCalories: device.data.activeCalories 
                  ? device.data.activeCalories + Math.floor(Math.random() * 2)
                  : device.data.activeCalories
              },
              lastSync: 'Just now'
            };
          }
          return device;
        })
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const connectDevice = (deviceId: string) => {
    setIsScanning(true);
    
    // Simulate connection process
    setTimeout(() => {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? {
                ...device,
                connected: true,
                battery: 85,
                lastSync: 'Just now',
                syncStatus: 'synced',
                data: device.id === 'fitbit' ? {
                  heartRate: 75,
                  steps: 7832,
                  sleepScore: 82,
                  stressLevel: 'Low'
                } : device.data
              }
            : device
        )
      );
      setIsScanning(false);
    }, 2000);
  };

  const disconnectDevice = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? {
              ...device,
              connected: false,
              battery: 0,
              lastSync: 'Disconnected',
              syncStatus: 'disconnected',
              data: null
            }
          : device
      )
    );
  };

  const syncDevice = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? { ...device, lastSync: 'Syncing...', syncStatus: 'syncing' }
          : device
      )
    );

    setTimeout(() => {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, lastSync: 'Just now', syncStatus: 'synced' }
            : device
        )
      );
    }, 1500);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'disconnected': return 'text-gray-400';
      case 'available': return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return '✓';
      case 'syncing': return '⟳';
      case 'disconnected': return '✗';
      case 'available': return '○';
      default: return '○';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Device Connections</h2>
          <p className="text-muted-foreground">Connect your health and fitness devices</p>
        </div>
        <Button
          onClick={() => setIsScanning(!isScanning)}
          disabled={isScanning}
          className="relative"
        >
          {isScanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              Scanning...
            </>
          ) : (
            <>
              <Bluetooth className="w-4 h-4 mr-2" />
              Scan for Devices
            </>
          )}
        </Button>
      </div>

      {/* Connected Devices Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bluetooth className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{devices.filter(d => d.connected).length} Connected</p>
                <p className="text-sm text-muted-foreground">Active devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Real-time Sync</p>
                <p className="text-sm text-muted-foreground">Live data updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Health Insights</p>
                <p className="text-sm text-muted-foreground">AI-powered analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <div className="space-y-4">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`transition-all ${device.connected ? 'ring-2 ring-green-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      device.connected ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        device.connected ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{device.name}</h3>
                          <p className="text-sm text-muted-foreground">{device.type}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {device.connected && (
                            <div className="flex items-center gap-2 text-sm">
                              <Battery className="w-4 h-4" />
                              <span>{device.battery}%</span>
                            </div>
                          )}
                          
                          <div className={`flex items-center gap-1 text-sm ${getSyncStatusColor(device.syncStatus)}`}>
                            <span>{getSyncStatusIcon(device.syncStatus)}</span>
                            <span className="capitalize">{device.syncStatus}</span>
                          </div>

                          <Switch
                            checked={device.connected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                connectDevice(device.id);
                              } else {
                                disconnectDevice(device.id);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {device.connected && device.data && (
                        <motion.div
                          className="mt-4 p-4 bg-muted/30 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(device.data).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-lg font-semibold">
                                  {typeof value === 'number' ? value.toLocaleString() : value}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {device.lastSync}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {device.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {device.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{device.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {device.connected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => syncDevice(device.id)}
                              disabled={device.syncStatus === 'syncing'}
                            >
                              <RefreshCw className={`w-4 h-4 mr-1 ${
                                device.syncStatus === 'syncing' ? 'animate-spin' : ''
                              }`} />
                              Sync
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health Integration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Automatic Data Collection</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Steps and distance tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Heart rate monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Sleep pattern analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  Workout detection
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Smart Insights</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Personalized recommendations
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Progress trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Health goal optimization
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Wellness score calculation
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}