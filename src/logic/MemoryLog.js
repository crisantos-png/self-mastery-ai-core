
/**
 * MemoryLog.js - In-memory event logging and pattern analysis
 * Tracks user behavior, session history, and AI interventions
 */

class MemoryLog {
  constructor() {
    this.events = [];
    this.patterns = {
      idleStreak: 0,
      lastActivity: new Date(),
      dailyGoalsMet: 0,
      aiInterventions: 0
    };
  }
  
  log(event, data = {}) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      event,
      data,
      aiTriggered: data.aiTriggered || false
    };
    
    this.events.push(logEntry);
    this.updatePatterns(event, data);
    
    console.log(`[AI LOG] ${event}:`, data);
    return logEntry;
  }
  
  updatePatterns(event, data) {
    switch (event) {
      case 'session_started':
        this.patterns.lastActivity = new Date();
        this.patterns.idleStreak = 0;
        break;
      case 'session_completed':
        this.patterns.lastActivity = new Date();
        this.patterns.dailyGoalsMet += 1;
        break;
      case 'session_abandoned':
        this.patterns.idleStreak += 1;
        break;
      case 'ai_intervention':
        this.patterns.aiInterventions += 1;
        break;
    }
  }
  
  getEvents(limit = 50) {
    return this.events
      .slice(-limit)
      .reverse(); // Most recent first
  }
  
  getTodayEvents() {
    const today = new Date().toDateString();
    return this.events.filter(event => 
      event.timestamp.toDateString() === today
    );
  }
  
  getIdleTime() {
    return Math.floor((new Date() - this.patterns.lastActivity) / 1000 / 60); // Minutes
  }
  
  shouldAIIntervene() {
    const idleMinutes = this.getIdleTime();
    const todaySessions = this.getTodayEvents().filter(e => e.event === 'session_completed').length;
    
    return {
      shouldIntervene: idleMinutes > 30 || (todaySessions === 0 && idleMinutes > 15),
      reason: idleMinutes > 30 ? 'extended_idle' : 'no_daily_progress',
      idleMinutes,
      todaySessions
    };
  }
  
  getPattern(pattern) {
    return this.patterns[pattern];
  }
  
  getAllPatterns() {
    return { ...this.patterns };
  }
  
  reset() {
    this.events = [];
    this.patterns = {
      idleStreak: 0,
      lastActivity: new Date(),
      dailyGoalsMet: 0,
      aiInterventions: 0
    };
  }
}

export default MemoryLog;
