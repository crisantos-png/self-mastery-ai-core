
/**
 * OfflineStorage.js - IndexedDB persistence for user patterns and behavioral data
 */

export default class OfflineStorage {
  constructor() {
    this.dbName = 'DisciplineOS';
    this.dbVersion = 1;
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineStorage] Database opened successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('event', 'event', { unique: false });
          eventsStore.createIndex('date', 'date', { unique: false });
        }

        // Patterns store
        if (!db.objectStoreNames.contains('patterns')) {
          const patternsStore = db.createObjectStore('patterns', { keyPath: 'id' });
          patternsStore.createIndex('date', 'date', { unique: false });
        }

        // Behavior profile store
        if (!db.objectStoreNames.contains('behaviorProfile')) {
          db.createObjectStore('behaviorProfile', { keyPath: 'id' });
        }

        // AI state store
        if (!db.objectStoreNames.contains('aiState')) {
          db.createObjectStore('aiState', { keyPath: 'id' });
        }

        console.log('[OfflineStorage] Database schema created');
      };
    });
  }

  async saveEvent(event) {
    if (!this.db) return false;

    const transaction = this.db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    
    const eventData = {
      ...event,
      date: new Date(event.timestamp).toDateString()
    };

    try {
      await store.add(eventData);
      console.log('[OfflineStorage] Event saved:', event.event);
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Failed to save event:', error);
      return false;
    }
  }

  async getEvents(limit = 100, fromDate = null) {
    if (!this.db) return [];

    const transaction = this.db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const events = [];
      const request = index.openCursor(null, 'prev'); // Most recent first

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && events.length < limit) {
          if (!fromDate || cursor.value.timestamp >= fromDate) {
            events.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async savePatterns(patterns) {
    if (!this.db) return false;

    const transaction = this.db.transaction(['patterns'], 'readwrite');
    const store = transaction.objectStore('patterns');

    const patternData = {
      id: new Date().toDateString(),
      date: new Date().toDateString(),
      timestamp: new Date(),
      patterns
    };

    try {
      await store.put(patternData); // Use put to allow updates
      console.log('[OfflineStorage] Patterns saved');
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Failed to save patterns:', error);
      return false;
    }
  }

  async getLatestPatterns() {
    if (!this.db) return null;

    const transaction = this.db.transaction(['patterns'], 'readonly');
    const store = transaction.objectStore('patterns');
    const index = store.index('date');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          resolve(cursor.value.patterns);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveBehaviorProfile(profile) {
    if (!this.db) return false;

    const transaction = this.db.transaction(['behaviorProfile'], 'readwrite');
    const store = transaction.objectStore('behaviorProfile');

    const profileData = {
      id: 'current',
      timestamp: new Date(),
      profile
    };

    try {
      await store.put(profileData);
      console.log('[OfflineStorage] Behavior profile saved');
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Failed to save behavior profile:', error);
      return false;
    }
  }

  async getBehaviorProfile() {
    if (!this.db) return null;

    const transaction = this.db.transaction(['behaviorProfile'], 'readonly');
    const store = transaction.objectStore('behaviorProfile');

    return new Promise((resolve, reject) => {
      const request = store.get('current');
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.profile : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveAIState(aiState) {
    if (!this.db) return false;

    const transaction = this.db.transaction(['aiState'], 'readwrite');
    const store = transaction.objectStore('aiState');

    const stateData = {
      id: 'current',
      timestamp: new Date(),
      ...aiState
    };

    try {
      await store.put(stateData);
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Failed to save AI state:', error);
      return false;
    }
  }

  async getAIState() {
    if (!this.db) return null;

    const transaction = this.db.transaction(['aiState'], 'readonly');
    const store = transaction.objectStore('aiState');

    return new Promise((resolve, reject) => {
      const request = store.get('current');
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getTodayStats() {
    const today = new Date().toDateString();
    const todayEvents = await this.getEvents(1000);
    
    return todayEvents.filter(event => event.date === today);
  }

  async clearOldData(daysToKeep = 30) {
    if (!this.db) return false;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const transaction = this.db.transaction(['events', 'patterns'], 'readwrite');
    
    try {
      // Clear old events
      const eventsStore = transaction.objectStore('events');
      const eventsIndex = eventsStore.index('timestamp');
      const eventsRequest = eventsIndex.openCursor(IDBKeyRange.upperBound(cutoffDate));

      eventsRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      console.log(`[OfflineStorage] Cleaned data older than ${daysToKeep} days`);
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Failed to clean old data:', error);
      return false;
    }
  }
}
