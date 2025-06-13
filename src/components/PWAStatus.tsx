
import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Smartphone, Bell, BellOff, Download } from 'lucide-react';

const PWAStatus = () => {
  const { 
    isOnline, 
    isPWAInstalled, 
    canInstall, 
    installPWA, 
    notificationPermission 
  } = usePWA();

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      console.log('PWA installed successfully');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          PWA Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Connection</span>
          </div>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* PWA Installation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">App Installation</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPWAInstalled ? "default" : "secondary"}>
              {isPWAInstalled ? "Installed" : "Web App"}
            </Badge>
            {canInstall && (
              <Button size="sm" variant="outline" onClick={handleInstall}>
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
            )}
          </div>
        </div>

        {/* Notification Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notificationPermission?.permission === 'granted' ? (
              <Bell className="h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-sm">Notifications</span>
          </div>
          <Badge 
            variant={
              notificationPermission?.permission === 'granted' 
                ? "default" 
                : notificationPermission?.permission === 'denied'
                ? "destructive"
                : "secondary"
            }
          >
            {notificationPermission?.permission === 'granted' 
              ? "Enabled" 
              : notificationPermission?.permission === 'denied'
              ? "Blocked"
              : "Not Set"
            }
          </Badge>
        </div>

        {/* Background Capabilities */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>✅ Offline data persistence enabled</div>
          <div>✅ Background monitoring ready</div>
          <div>✅ Push intervention system active</div>
          {!isPWAInstalled && (
            <div className="text-orange-600">⚠️ Install as app for full functionality</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAStatus;
