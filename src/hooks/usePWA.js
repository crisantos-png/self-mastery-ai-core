
/**
 * usePWA.js - React hook for PWA functionality
 */

import { useState, useEffect } from 'react';
import NotificationManager from '../logic/NotificationManager';
import OfflineStorage from '../logic/OfflineStorage';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [notificationManager, setNotificationManager] = useState(null);
  const [offlineStorage, setOfflineStorage] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Initialize PWA components
    const initializePWA = async () => {
      // Initialize notification manager
      const notifManager = new NotificationManager();
      const notifSupported = await notifManager.initialize();
      setNotificationManager(notifManager);

      // Initialize offline storage
      const storage = new OfflineStorage();
      try {
        await storage.initialize();
        setOfflineStorage(storage);
        console.log('[PWA] Offline storage initialized');
      } catch (error) {
        console.error('[PWA] Failed to initialize offline storage:', error);
      }

      console.log('[PWA] Initialized - Notifications:', notifSupported);
    };

    initializePWA();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if PWA is installed
    const checkIfPWAInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsPWAInstalled(isStandalone || isFullscreen);
    };

    checkIfPWAInstalled();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install prompt result:', outcome);
      setDeferredPrompt(null);
      return outcome === 'accepted';
    }
    return false;
  };

  const sendNotification = async (message, interventionLevel, aiState) => {
    if (notificationManager) {
      return await notificationManager.sendInterventionNotification(message, interventionLevel, aiState);
    }
    return false;
  };

  const saveToStorage = async (type, data) => {
    if (!offlineStorage) return false;

    switch (type) {
      case 'event':
        return await offlineStorage.saveEvent(data);
      case 'patterns':
        return await offlineStorage.savePatterns(data);
      case 'behaviorProfile':
        return await offlineStorage.saveBehaviorProfile(data);
      case 'aiState':
        return await offlineStorage.saveAIState(data);
      default:
        return false;
    }
  };

  const loadFromStorage = async (type, options = {}) => {
    if (!offlineStorage) return null;

    switch (type) {
      case 'events':
        return await offlineStorage.getEvents(options.limit, options.fromDate);
      case 'patterns':
        return await offlineStorage.getLatestPatterns();
      case 'behaviorProfile':
        return await offlineStorage.getBehaviorProfile();
      case 'aiState':
        return await offlineStorage.getAIState();
      case 'todayStats':
        return await offlineStorage.getTodayStats();
      default:
        return null;
    }
  };

  return {
    isOnline,
    isPWAInstalled,
    canInstall: !!deferredPrompt,
    installPWA,
    sendNotification,
    saveToStorage,
    loadFromStorage,
    notificationPermission: notificationManager?.getPermissionStatus(),
    storage: offlineStorage
  };
};
