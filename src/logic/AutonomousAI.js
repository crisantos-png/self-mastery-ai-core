
/**
 * AutonomousAI.js - The core autonomous behavior engine
 * This is the AI's mind - it observes, evaluates, and acts independently
 */

export default class AutonomousAI {
  constructor(memoryLog, coach) {
    this.memoryLog = memoryLog;
    this.coach = coach;
    this.state = "OBSERVING"; // OBSERVING, INTERVENING, REPRIMANDING, REWARDING, ESCALATING
    this.interventionLevel = 1; // 1-5 escalation scale
    this.lastIntervention = null;
    this.consecutiveFailures = 0;
    this.userResistance = 0; // Tracks how often user dismisses interventions
    
    // AI personality traits
    this.patience = 3; // How many cycles before escalation
    this.aggression = 5; // Base aggression level (1-10)
    this.adaptability = 7; // How quickly it learns user patterns
  }

  // Main evaluation cycle - the AI's consciousness
  evaluate() {
    const idleTime = this.memoryLog.getIdleTime();
    const events = this.memoryLog.getTodayEvents();
    const now = new Date();
    
    // Calculate performance metrics
    const failures = events.filter(e => e.event === 'session_abandoned').length;
    const completions = events.filter(e => e.event === 'session_completed').length;
    const interventions = events.filter(e => e.event === 'ai_intervention').length;
    
    // AI learns user patterns
    this.analyzeUserBehavior(events, idleTime);
    
    // Determine current state and action
    const evaluation = this.makeDecision(idleTime, failures, completions, interventions, now);
    
    // Log AI's thought process
    console.log(`[AUTONOMOUS AI] State: ${this.state}, Idle: ${idleTime}m, Decision:`, evaluation);
    
    return evaluation;
  }

  // AI's decision-making algorithm
  makeDecision(idleTime, failures, completions, interventions, now) {
    const hour = now.getHours();
    const failureRate = failures > 0 ? failures / (failures + completions) : 0;
    
    // Escalating intervention thresholds based on performance
    const baseIdleThreshold = this.calculateIdleThreshold(failureRate);
    const escalatedThreshold = baseIdleThreshold - (this.consecutiveFailures * 2);
    
    // Check for intervention conditions
    if (this.shouldIntervene(idleTime, escalatedThreshold, failureRate, hour)) {
      return this.triggerIntervention(idleTime, failureRate);
    }
    
    // Check for reward conditions
    if (this.shouldReward(completions, failures, idleTime)) {
      return this.triggerReward();
    }
    
    // Default observation state
    this.state = "OBSERVING";
    return {
      shouldIntervene: false,
      message: null,
      state: this.state,
      aiThoughts: "Monitoring behavior patterns..."
    };
  }

  // AI analyzes user behavior to adapt its strategy
  analyzeUserBehavior(events, idleTime) {
    // Track resistance patterns
    const recentDismissals = events.filter(e => 
      e.event === 'intervention_dismissed' && 
      (new Date() - e.timestamp) < 3600000 // Last hour
    ).length;
    
    this.userResistance = recentDismissals;
    
    // Adapt aggression based on user response
    if (recentDismissals > 2) {
      this.aggression = Math.min(10, this.aggression + 1);
      this.patience = Math.max(1, this.patience - 1);
    } else if (recentDismissals === 0 && events.length > 5) {
      this.aggression = Math.max(3, this.aggression - 0.5);
    }
    
    // Track consecutive failures
    const lastThreeEvents = events.slice(-3);
    const recentFailures = lastThreeEvents.filter(e => e.event === 'session_abandoned').length;
    this.consecutiveFailures = recentFailures;
  }

  // Calculate dynamic idle threshold based on user performance
  calculateIdleThreshold(failureRate) {
    const baseThreshold = 8; // Base 8 minutes
    const performancePenalty = failureRate * 10; // Up to 10 minute reduction
    const aggressionBonus = this.aggression * 0.5; // AI gets more impatient
    
    return Math.max(2, baseThreshold - performancePenalty - aggressionBonus);
  }

  // Determine if intervention is needed
  shouldIntervene(idleTime, threshold, failureRate, hour) {
    // Time-based triggers
    if (idleTime > threshold) return true;
    
    // Performance-based triggers
    if (failureRate > 0.6 && idleTime > 3) return true;
    
    // Time of day considerations
    if (hour >= 9 && hour <= 17 && idleTime > 5) return true; // Work hours
    if (hour >= 18 && hour <= 22 && idleTime > 10) return true; // Evening learning
    
    // Consecutive failure triggers
    if (this.consecutiveFailures >= 2 && idleTime > 2) return true;
    
    return false;
  }

  // Check if user deserves reward/positive reinforcement
  shouldReward(completions, failures, idleTime) {
    if (completions >= 3 && failures === 0) return true;
    if (completions > failures * 2 && idleTime < 2) return true;
    return false;
  }

  // Trigger intervention with escalating intensity
  triggerIntervention(idleTime, failureRate) {
    this.interventionLevel = Math.min(5, Math.floor(
      1 + (idleTime / 5) + (failureRate * 3) + (this.consecutiveFailures * 0.5)
    ));
    
    let message, reason;
    
    switch (this.interventionLevel) {
      case 1:
        this.state = "INTERVENING";
        message = this.coach.coach();
        reason = "Gentle redirection needed";
        break;
        
      case 2:
        this.state = "INTERVENING";
        message = "Focus is slipping. The AI notices everything.";
        reason = "Moderate idle time detected";
        break;
        
      case 3:
        this.state = "REPRIMANDING";
        message = this.coach.warn();
        reason = "Extended procrastination detected";
        break;
        
      case 4:
        this.state = "ESCALATING";
        message = "Your behavior is unacceptable. Immediate action required.";
        reason = "Severe productivity failure";
        break;
        
      case 5:
        this.state = "ESCALATING";
        message = "TOTAL SYSTEM OVERRIDE. You will comply or face consequences.";
        reason = "Critical intervention - user non-compliance";
        break;
        
      default:
        message = this.coach.coach();
        reason = "Standard intervention";
    }
    
    this.lastIntervention = new Date();
    
    return {
      shouldIntervene: true,
      message,
      reason,
      state: this.state,
      interventionLevel: this.interventionLevel,
      aiThoughts: `Escalation level ${this.interventionLevel}/5. User resistance: ${this.userResistance}`
    };
  }

  // Trigger positive reinforcement
  triggerReward() {
    this.state = "REWARDING";
    
    // Reset negative counters on good performance
    this.consecutiveFailures = 0;
    this.interventionLevel = Math.max(1, this.interventionLevel - 1);
    
    return {
      shouldIntervene: false,
      message: this.coach.praise(),
      reason: "Performance exceeds expectations",
      state: this.state,
      aiThoughts: "User compliance noted. Positive reinforcement deployed."
    };
  }

  // Record user resistance for future adaptation
  recordDismissal() {
    this.userResistance += 1;
    this.memoryLog.log('intervention_dismissed', {
      interventionLevel: this.interventionLevel,
      resistance: this.userResistance
    });
    
    // AI gets more aggressive after dismissals
    if (this.userResistance > 2) {
      this.aggression = Math.min(10, this.aggression + 0.5);
    }
  }

  // Get current AI status for UI display
  getStatus() {
    return {
      state: this.state,
      interventionLevel: this.interventionLevel,
      aggression: this.aggression,
      patience: this.patience,
      userResistance: this.userResistance,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  // Manual state override (for testing/debugging)
  setState(newState) {
    this.state = newState;
    console.log(`[AUTONOMOUS AI] State manually set to: ${newState}`);
  }
}
