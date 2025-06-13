/**
 * MemoryLog.js - Enhanced behavioral tracking and pattern analysis
 * Tracks user behavior, session history, AI interventions, and learning patterns
 */

class MemoryLog {
  constructor() {
    this.events = [];
    this.patterns = {
      idleStreak: 0,
      lastActivity: new Date(),
      dailyGoalsMet: 0,
      aiInterventions: 0,
      focusWindows: [], // Track when user is most productive
      failureTriggers: [], // What causes user to abandon sessions
      resistancePatterns: [], // How user responds to AI interventions
      productivityScore: 50 // Running score 0-100
    };
    this.behaviorProfile = {
      attentionSpan: 25, // Minutes before typical distraction
      peakHours: [], // Hours when user is most focused
      procrastinationTriggers: [],
      motivationStyle: 'neutral', // brutal, gentle, competitive
      responseToInterventions: 'compliant' // compliant, resistant, mixed
    };
  }
  
  log(event, data = {}) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      event,
      data,
      aiTriggered: data.aiTriggered || false,
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };
    
    this.events.push(logEntry);
    this.updatePatterns(event, data, logEntry);
    this.analyzeBehaviorProfile(event, data, logEntry);
    
    console.log(`[AI LOG] ${event}:`, data);
    return logEntry;
  }
  
  updatePatterns(event, data, logEntry) {
    const now = new Date();
    
    switch (event) {
      case 'session_started':
        this.patterns.lastActivity = now;
        this.patterns.idleStreak = 0;
        this.trackFocusWindow(logEntry);
        break;
        
      case 'session_completed':
        this.patterns.lastActivity = now;
        this.patterns.dailyGoalsMet += 1;
        this.patterns.productivityScore = Math.min(100, this.patterns.productivityScore + 5);
        this.trackSuccessfulSession(logEntry);
        break;
        
      case 'session_abandoned':
        this.patterns.idleStreak += 1;
        this.patterns.productivityScore = Math.max(0, this.patterns.productivityScore - 10);
        this.trackFailureTrigger(logEntry);
        break;
        
      case 'ai_intervention':
        this.patterns.aiInterventions += 1;
        break;
        
      case 'intervention_dismissed':
        this.trackResistance(logEntry);
        break;
        
      case 'page_focus_lost':
        this.trackDistraction(logEntry);
        break;
        
      case 'extended_idle':
        this.trackProcrastination(logEntry);
        break;
    }
  }

  trackFocusWindow(logEntry) {
    const hour = logEntry.hour;
    const existingWindow = this.patterns.focusWindows.find(w => w.hour === hour);
    
    if (existingWindow) {
      existingWindow.sessions += 1;
      existingWindow.score += 1;
    } else {
      this.patterns.focusWindows.push({
        hour,
        sessions: 1,
        score: 1,
        effectiveness: 0
      });
    }
  }

  trackSuccessfulSession(logEntry) {
    const hour = logEntry.hour;
    const window = this.patterns.focusWindows.find(w => w.hour === hour);
    if (window) {
      window.effectiveness += 2;
    }
  }

  trackFailureTrigger(logEntry) {
    const trigger = {
      timestamp: logEntry.timestamp,
      hour: logEntry.hour,
      dayOfWeek: logEntry.dayOfWeek,
      idleTimeBefore: this.getIdleTime(),
      sessionDuration: logEntry.data.sessionDuration || 0
    };
    
    this.patterns.failureTriggers.push(trigger);
    
    // Keep only last 20 failure triggers
    if (this.patterns.failureTriggers.length > 20) {
      this.patterns.failureTriggers.shift();
    }
  }

  trackResistance(logEntry) {
    const resistance = {
      timestamp: logEntry.timestamp,
      interventionLevel: logEntry.data.interventionLevel || 1,
      aiState: logEntry.data.aiState || 'INTERVENING',
      hour: logEntry.hour
    };
    
    this.patterns.resistancePatterns.push(resistance);
    
    // Keep only last 15 resistance events
    if (this.patterns.resistancePatterns.length > 15) {
      this.patterns.resistancePatterns.shift();
    }
  }

  trackDistraction(logEntry) {
    // Log when user switches away from app
    this.log('distraction_detected', {
      duration: logEntry.data.duration || 0,
      context: logEntry.data.context || 'unknown'
    });
  }

  trackProcrastination(logEntry) {
    const procrastination = {
      timestamp: logEntry.timestamp,
      duration: logEntry.data.duration || 0,
      hour: logEntry.hour,
      dayOfWeek: logEntry.dayOfWeek
    };
    
    this.behaviorProfile.procrastinationTriggers.push(procrastination);
  }

  analyzeBehaviorProfile(event, data, logEntry) {
    // Update attention span based on session performance
    if (event === 'session_completed' && data.actualDuration) {
      this.behaviorProfile.attentionSpan = Math.floor(
        (this.behaviorProfile.attentionSpan + data.actualDuration) / 2
      );
    }
    
    // Identify peak hours
    if (event === 'session_completed') {
      const hour = logEntry.hour;
      if (!this.behaviorProfile.peakHours.includes(hour)) {
        const hourSuccess = this.getTodayEvents()
          .filter(e => e.event === 'session_completed' && e.hour === hour)
          .length;
        
        if (hourSuccess >= 2) {
          this.behaviorProfile.peakHours.push(hour);
        }
      }
    }
    
    // Analyze response to interventions
    const recentResistance = this.patterns.resistancePatterns.slice(-5);
    if (recentResistance.length >= 3) {
      const resistanceRate = recentResistance.length / 5;
      this.behaviorProfile.responseToInterventions = 
        resistanceRate > 0.6 ? 'resistant' : 
        resistanceRate > 0.3 ? 'mixed' : 'compliant';
    }
  }
  
  getEvents(limit = 50) {
    return this.events
      .slice(-limit)
      .reverse();
  }
  
  getTodayEvents() {
    const today = new Date().toDateString();
    return this.events.filter(event => 
      event.timestamp.toDateString() === today
    );
  }
  
  getIdleTime() {
    return Math.floor((new Date() - this.patterns.lastActivity) / 1000 / 60);
  }

  getProcrastinationRisk() {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    const historicalFailures = this.patterns.failureTriggers.filter(t => 
      t.hour === hour || t.dayOfWeek === dayOfWeek
    ).length;
    
    const recentIdleTime = this.getIdleTime();
    const baseRisk = Math.min(100, (recentIdleTime / 10) * 100);
    const historicalRisk = Math.min(50, historicalFailures * 10);
    
    return Math.min(100, baseRisk + historicalRisk);
  }

  getOptimalInterventionStyle() {
    const resistance = this.patterns.resistancePatterns.slice(-5);
    const avgInterventionLevel = resistance.reduce((sum, r) => sum + r.interventionLevel, 0) / resistance.length || 1;
    
    if (this.behaviorProfile.responseToInterventions === 'resistant') {
      return 'gentle';
    } else if (avgInterventionLevel < 2 && this.patterns.productivityScore < 30) {
      return 'aggressive';
    } else {
      return 'moderate';
    }
  }

  shouldAIIntervene() {
    const idleMinutes = this.getIdleTime();
    const procrastinationRisk = this.getProcrastinationRisk();
    const todaySessions = this.getTodayEvents().filter(e => e.event === 'session_completed').length;
    const hour = new Date().getHours();
    
    // Dynamic thresholds based on user profile
    const baseThreshold = this.behaviorProfile.attentionSpan / 3; // More aggressive than attention span
    const riskAdjustedThreshold = Math.max(2, baseThreshold - (procrastinationRisk / 20));
    
    let shouldIntervene = false;
    let reason = '';
    
    if (idleMinutes > riskAdjustedThreshold) {
      shouldIntervene = true;
      reason = 'risk_adjusted_idle';
    } else if (todaySessions === 0 && idleMinutes > 5) {
      shouldIntervene = true;
      reason = 'no_daily_progress';
    } else if (procrastinationRisk > 70 && idleMinutes > 3) {
      shouldIntervene = true;
      reason = 'high_procrastination_risk';
    } else if (!this.behaviorProfile.peakHours.includes(hour) && idleMinutes > 15) {
      shouldIntervene = true;
      reason = 'non_peak_extended_idle';
    }
    
    return {
      shouldIntervene,
      reason,
      idleMinutes,
      procrastinationRisk,
      todaySessions,
      interventionStyle: this.getOptimalInterventionStyle(),
      threshold: riskAdjustedThreshold
    };
  }
  
  getPattern(pattern) {
    return this.patterns[pattern];
  }
  
  getAllPatterns() {
    return { ...this.patterns };
  }

  getBehaviorProfile() {
    return { ...this.behaviorProfile };
  }
  
  reset() {
    this.events = [];
    this.patterns = {
      idleStreak: 0,
      lastActivity: new Date(),
      dailyGoalsMet: 0,
      aiInterventions: 0,
      focusWindows: [],
      failureTriggers: [],
      resistancePatterns: [],
      productivityScore: 50
    };
    this.behaviorProfile = {
      attentionSpan: 25,
      peakHours: [],
      procrastinationTriggers: [],
      motivationStyle: 'neutral',
      responseToInterventions: 'compliant'
    };
  }
}

export default MemoryLog;
