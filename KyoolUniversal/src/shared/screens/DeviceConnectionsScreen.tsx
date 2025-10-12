import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from '../../ui';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface Device {
  id: string;
  name: string;
  type: string;
  icon: string;
  connected: boolean;
  batteryLevel?: number;
  lastSync?: string;
  description: string;
}

interface DeviceConnectionsScreenProps {
  user?: any;
}

export function DeviceConnectionsScreen({ user }: DeviceConnectionsScreenProps) {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      icon: '⌚',
      connected: true,
      batteryLevel: 78,
      lastSync: '2 minutes ago',
      description: 'Heart rate, activity, sleep tracking'
    },
    {
      id: '2',
      name: 'iPhone Health',
      type: 'phone',
      icon: '📱',
      connected: true,
      lastSync: 'Just now',
      description: 'Steps, health data, workout tracking'
    },
    {
      id: '3',
      name: 'Fitbit Versa 4',
      type: 'fitness_tracker',
      icon: '💪',
      connected: false,
      description: 'Activity tracking, sleep monitoring'
    },
    {
      id: '4',
      name: 'MyFitnessPal',
      type: 'app',
      icon: '🍎',
      connected: true,
      lastSync: '1 hour ago',
      description: 'Nutrition tracking, calorie counting'
    },
    {
      id: '5',
      name: 'Oura Ring',
      type: 'ring',
      icon: '💍',
      connected: false,
      description: 'Sleep quality, recovery, readiness'
    },
    {
      id: '6',
      name: 'Withings Scale',
      type: 'scale',
      icon: '⚖️',
      connected: false,
      description: 'Weight, BMI, body composition'
    }
  ]);

  const [syncingDevices, setSyncingDevices] = useState<string[]>([]);

  const toggleConnection = (deviceId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, connected: !device.connected }
        : device
    ));
  };

  const syncDevice = (deviceId: string) => {
    setSyncingDevices([...syncingDevices, deviceId]);
    
    // Simulate sync process
    setTimeout(() => {
      setDevices(devices.map(device => 
        device.id === deviceId 
          ? { ...device, lastSync: 'Just now' }
          : device
      ));
      setSyncingDevices(syncingDevices.filter(id => id !== deviceId));
    }, 2000);
  };

  const connectedDevices = devices.filter(device => device.connected);
  const availableDevices = devices.filter(device => !device.connected);

  const getStatusColor = (connected: boolean) => {
    return connected ? '#10b981' : '#6b7280';
  };

  const getStatusText = (connected: boolean) => {
    return connected ? 'Connected' : 'Not Connected';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Device Connections</Text>
        <Text style={styles.subtitle}>Connect your devices to track health metrics automatically</Text>

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Connected Devices ({connectedDevices.length})</Text>
            {connectedDevices.map((device) => (
              <Card key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceIcon}>{device.icon}</Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceDescription}>{device.description}</Text>
                      {device.lastSync && (
                        <Text style={styles.lastSync}>Last sync: {device.lastSync}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.deviceActions}>
                    {device.batteryLevel && (
                      <View style={styles.batteryContainer}>
                        <Text style={styles.batteryText}>{device.batteryLevel}%</Text>
                        <View style={styles.batteryIcon}>
                          <View 
                            style={[
                              styles.batteryFill, 
                              { 
                                width: `${device.batteryLevel}%`,
                                backgroundColor: device.batteryLevel > 20 ? '#10b981' : '#ef4444'
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    )}
                    <Switch
                      value={device.connected}
                      onValueChange={() => toggleConnection(device.id)}
                      trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                      thumbColor={device.connected ? '#ffffff' : '#f4f3f4'}
                    />
                  </View>
                </View>
                
                <View style={styles.deviceFooter}>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.connected) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(device.connected) }]}>
                      {getStatusText(device.connected)}
                    </Text>
                  </View>
                  
                  {device.connected && (
                    <Button
                      title={syncingDevices.includes(device.id) ? 'Syncing...' : 'Sync Now'}
                      variant="outline"
                      onPress={() => syncDevice(device.id)}
                      disabled={syncingDevices.includes(device.id)}
                      style={styles.syncButton}
                    />
                  )}
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Available Devices */}
        {availableDevices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <Text style={styles.sectionSubtitle}>Connect these devices to enhance your health tracking</Text>
            
            {availableDevices.map((device) => (
              <Card key={device.id} style={StyleSheet.flatten([styles.deviceCard, styles.availableDeviceCard])}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceIcon}>{device.icon}</Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceDescription}>{device.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={device.connected}
                    onValueChange={() => toggleConnection(device.id)}
                    trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                    thumbColor={device.connected ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.deviceFooter}>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.connected) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(device.connected) }]}>
                      {getStatusText(device.connected)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Health Data Permissions */}
        <Card style={styles.permissionsCard}>
          <Text style={styles.permissionsTitle}>Health Data Permissions</Text>
          <Text style={styles.permissionsSubtitle}>
            Manage what health data can be accessed by connected devices and apps
          </Text>
          
          <View style={styles.permissionsList}>
            {[
              { name: 'Heart Rate', enabled: true },
              { name: 'Steps & Activity', enabled: true },
              { name: 'Sleep Data', enabled: true },
              { name: 'Weight & BMI', enabled: false },
              { name: 'Nutrition Data', enabled: true },
              { name: 'Workout Sessions', enabled: true },
            ].map((permission, index) => (
              <View key={index} style={styles.permissionItem}>
                <Text style={styles.permissionName}>{permission.name}</Text>
                <Switch
                  value={permission.enabled}
                  onValueChange={() => {}}
                  trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                  thumbColor={permission.enabled ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Sync Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Sync Settings</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Auto Sync</Text>
                <Text style={styles.settingDescription}>Automatically sync data from connected devices</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                thumbColor={'#ffffff'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Background Sync</Text>
                <Text style={styles.settingDescription}>Sync data even when app is in background</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                thumbColor={'#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Sync Frequency</Text>
              <Text style={styles.settingButtonValue}>Every 15 minutes</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title="Sync All Devices"
          onPress={() => {
            connectedDevices.forEach(device => syncDevice(device.id));
          }}
          style={styles.syncAllButton}
        />
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  deviceCard: {
    marginBottom: 16,
    padding: 16,
  },
  availableDeviceCard: {
    borderColor: '#e2e8f0',
    borderWidth: 1,
    backgroundColor: '#f8fafc',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  lastSync: {
    fontSize: 12,
    color: '#10b981',
  },
  deviceActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    color: '#64748b',
  },
  batteryIcon: {
    width: 20,
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 1,
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  permissionsCard: {
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
  },
  permissionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  permissionsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  permissionsList: {
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  settingsCard: {
    marginBottom: 24,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  settingButtonValue: {
    fontSize: 14,
    color: '#64748b',
  },
  syncAllButton: {
    marginTop: 8,
  },
});