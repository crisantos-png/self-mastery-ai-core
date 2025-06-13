
/**
 * NotificationManager.js - Push notifications for autonomous AI interventions
 */

export default class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('[Notifications] Not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Notifications] Service Worker registered');

      // Request permission
      this.permission = await Notification.requestPermission();
      console.log('[Notifications] Permission:', this.permission);

      return this.permission === 'granted';
    } catch (error) {
      console.error('[Notifications] Initialization failed:', error);
      return false;
    }
  }

  async sendInterventionNotification(message, interventionLevel, aiState) {
    if (this.permission !== 'granted' || !this.registration) {
      console.warn('[Notifications] Cannot send - permission denied or no registration');
      return false;
    }

    const title = this.getNotificationTitle(interventionLevel, aiState);
    const options = {
      body: message,
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      vibrate: this.getVibrationPattern(interventionLevel),
      tag: 'disciplineos-intervention',
      requireInteraction: interventionLevel >= 3,
      silent: false,
      timestamp: Date.now(),
      actions: [
        {
          action: 'start-session',
          title: '✅ Start Session',
          icon: '/placeholder.svg'
        },
        {
          action: 'snooze',
          title: '⏰ Snooze 5min',
          icon: '/placeholder.svg'
        },
        {
          action: 'dismiss',
          title: '❌ Dismiss',
          icon: '/placeholder.svg'
        }
      ],
      data: {
        interventionLevel,
        aiState,
        timestamp: Date.now()
      }
    };

    try {
      await this.registration.showNotification(title, options);
      console.log('[Notifications] Intervention sent:', { title, interventionLevel, aiState });
      return true;
    } catch (error) {
      console.error('[Notifications] Failed to send intervention:', error);
      return false;
    }
  }

  getNotificationTitle(interventionLevel, aiState) {
    switch (aiState) {
      case 'INTERVENING':
        return interventionLevel >= 3 ? '🚨 DisciplineOS Alert' : '💭 Focus Reminder';
      case 'REPRIMANDING':
        return '⚠️ DisciplineOS Warning';
      case 'ESCALATING':
        return '🚫 SYSTEM OVERRIDE REQUIRED';
      case 'REWARDING':
        return '🎉 Great Work!';
      default:
        return '🤖 DisciplineOS';
    }
  }

  getVibrationPattern(interventionLevel) {
    switch (interventionLevel) {
      case 1:
      case 2:
        return [200, 100, 200]; // Gentle
      case 3:
        return [300, 150, 300, 150, 300]; // Firm
      case 4:
      case 5:
        return [500, 200, 500, 200, 500, 200, 500]; // Aggressive
      default:
        return [200, 100, 200];
    }
  }

  async sendRewardNotification(message) {
    if (this.permission !== 'granted') return false;

    const options = {
      body: message,
      icon: '/placeholder.svg',
      tag: 'disciplineos-reward',
      silent: true,
      timestamp: Date.now()
    };

    try {
      await this.registration.showNotification('🎉 Achievement Unlocked', options);
      return true;
    } catch (error) {
      console.error('[Notifications] Failed to send reward:', error);
      return false;
    }
  }

  async scheduleBackgroundIntervention(delayMinutes, message, interventionLevel) {
    if (!this.registration || this.permission !== 'granted') return false;

    // Schedule a background notification
    setTimeout(async () => {
      await this.sendInterventionNotification(message, interventionLevel, 'INTERVENING');
    }, delayMinutes * 60 * 1000);

    console.log(`[Notifications] Background intervention scheduled for ${delayMinutes} minutes`);
    return true;
  }

  getPermissionStatus() {
    return {
      permission: this.permission,
      isSupported: this.isSupported,
      isRegistered: !!this.registration
    };
  }
}
