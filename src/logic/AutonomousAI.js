/**
 * AutonomousAI.js - Enhanced autonomous behavior engine with behavioral learning
 * Advanced AI that learns user patterns and adapts intervention strategies
 */

export default class AutonomousAI {
  constructor(memoryLog, coach) {
    this.memoryLog = memoryLog;
    this.coach = coach;
    this.state = "OBSERVING"; // OBSERVING, INTERVENING, REPRIMANDING, REWARDING, ESCALATING
    this.interventionLevel = 1; // 1-5 escalation scale
    this.lastIntervention = null;
    this.consecutiveFailures = 0;
    this.userResistance = 0;
    
    // Enhanced AI personality traits
    this.patience = 3;
    this.aggression = 5;
    this.adaptability = 7;
    this.learningRate = 0.1; // How quickly AI adapts to user behavior
  }

  // Enhanced evaluation cycle with behavioral learning
  evaluate() {
    const analysis = this.memoryLog.shouldAIIntervene();
    const behaviorProfile = this.memoryLog.getBehaviorProfile();
    const events = this.memoryLog.getTodayEvents();
    const now = new Date();
    
    // Calculate enhanced performance metrics
    const failures = events.filter(e => e.event === 'session_abandoned').length;
    const completions = events.filter(e => e.event === 'session_completed').length;
    const interventions = events.filter(e => e.event === 'ai_intervention').length;
    const procrastinationRisk = this.memoryLog.getProcrastinationRisk();
    
    // AI learns and adapts to user patterns
    this.adaptToUserBehavior(behaviorProfile, events, analysis);
    
    // Enhanced decision-making with behavioral context
    const evaluation = this.makeAdvancedDecision(analysis, failures, completions, interventions, now, procrastinationRisk);
    
    // Enhanced logging with behavioral insights
    console.log(`[AUTONOMOUS AI] State: ${this.state}, Risk: ${procrastinationRisk}%, Decision:`, evaluation);
    
    return evaluation;
  }

  // Advanced decision-making with behavioral learning
  makeAdvancedDecision(analysis, failures, completions, interventions, now, procrastinationRisk) {
    const hour = now.getHours();
    const failureRate = failures > 0 ? failures / (failures + completions) : 0;
    const behaviorProfile = this.memoryLog.getBehaviorProfile();
    
    // Adaptive intervention strategy based on user profile
    const interventionStyle = analysis.interventionStyle;
    const baseThreshold = this.calculateDynamicThreshold(failureRate, procrastinationRisk, behaviorProfile);
    
    // Check for immediate intervention conditions
    if (this.shouldIntervenePriority(analysis, procrastinationRisk, hour, failureRate)) {
      return this.triggerAdvancedIntervention(analysis, procrastinationRisk, interventionStyle);
    }
    
    // Check for reward/positive reinforcement
    if (this.shouldRewardUser(completions, failures, analysis.idleMinutes, procrastinationRisk)) {
      return this.triggerSmartReward(behaviorProfile);
    }
    
    // Adaptive observation with predictive insights
    this.state = "OBSERVING";
    return {
      shouldIntervene: false,
      message: null,
      state: this.state,
      aiThoughts: this.generateObservationInsights(procrastinationRisk, behaviorProfile),
      behaviorInsights: {
        procrastinationRisk,
        optimalStyle: interventionStyle,
        userProfile: behaviorProfile.responseToInterventions
      }
    };
  }

  // Enhanced intervention decision logic
  shouldIntervenePriority(analysis, procrastinationRisk, hour, failureRate) {
    // High-priority intervention triggers
    if (analysis.shouldIntervene && procrastinationRisk > 80) return true;
    if (analysis.reason === 'high_procrastination_risk') return true;
    if (failureRate > 0.7 && analysis.idleMinutes > 3) return true;
    
    // Time-sensitive interventions during peak hours
    const behaviorProfile = this.memoryLog.getBehaviorProfile();
    if (behaviorProfile.peakHours.includes(hour) && analysis.idleMinutes > 5) return true;
    
    // Consecutive failure escalation
    if (this.consecutiveFailures >= 2 && analysis.idleMinutes > 2) return true;
    
    // Standard intervention check
    return analysis.shouldIntervene;
  }

  // Calculate dynamic intervention threshold based on user learning
  calculateDynamicThreshold(failureRate, procrastinationRisk, behaviorProfile) {
    const baseThreshold = behaviorProfile.attentionSpan / 4; // Quarter of attention span
    const riskPenalty = (procrastinationRisk / 100) * 5; // Up to 5 minutes reduction
    const performancePenalty = failureRate * 8; // Up to 8 minutes for poor performance
    const aggressionBonus = (this.aggression / 10) * 3; // AI gets more impatient
    
    return Math.max(1, baseThreshold - riskPenalty - performancePenalty - aggressionBonus);
  }

  // Adaptive reward system
  shouldRewardUser(completions, failures, idleTime, procrastinationRisk) {
    // Reward good performance
    if (completions >= 3 && failures <= 1) return true;
    if (completions > failures * 2 && idleTime < 3) return true;
    if (procrastinationRisk < 20 && completions > 0) return true;
    
    // Reward improvement trends
    const recentEvents = this.memoryLog.getEvents(10);
    const recentCompletions = recentEvents.filter(e => e.event === 'session_completed').length;
    if (recentCompletions >= 2 && idleTime < 5) return true;
    
    return false;
  }

  // Advanced intervention with behavioral adaptation
  triggerAdvancedIntervention(analysis, procrastinationRisk, interventionStyle) {
    // Calculate intervention level based on multiple factors
    this.interventionLevel = Math.min(5, Math.floor(
      1 + 
      (analysis.idleMinutes / 8) + 
      (procrastinationRisk / 30) + 
      (this.consecutiveFailures * 0.8) +
      (this.userResistance * 0.3)
    ));
    
    let message, reason;
    
    // Adapt message based on intervention style and level
    if (interventionStyle === 'gentle') {
      message = this.getGentleIntervention();
      this.state = "INTERVENING";
    } else if (interventionStyle === 'aggressive') {
      message = this.getAggressiveIntervention();
      this.state = this.interventionLevel >= 3 ? "REPRIMANDING" : "INTERVENING";
    } else {
      message = this.getModerateIntervention();
      this.state = this.interventionLevel >= 4 ? "ESCALATING" : "INTERVENING";
    }
    
    reason = this.generateInterventionReason(analysis, procrastinationRisk);
    this.lastIntervention = new Date();
    
    return {
      shouldIntervene: true,
      message,
      reason,
      state: this.state,
      interventionLevel: this.interventionLevel,
      aiThoughts: `Risk: ${procrastinationRisk}% | Style: ${interventionStyle} | Level: ${this.interventionLevel}/5`,
      procrastinationRisk,
      interventionStyle
    };
  }

  getGentleIntervention() {
    const gentleMessages = [
      "Hey, I notice you've been idle for a while. Ready to get back to work?",
      "Your future self will thank you for starting now.",
      "Small steps lead to big wins. Let's take one together.",
      "I believe in your ability to focus. Let's prove it."
    ];
    return gentleMessages[Math.floor(Math.random() * gentleMessages.length)];
  }

  getAggressiveIntervention() {
    switch (this.interventionLevel) {
      case 1:
      case 2:
        return this.coach.coach();
      case 3:
        return this.coach.warn();
      case 4:
        return "Your procrastination is unacceptable. The AI demands immediate compliance.";
      case 5:
        return "TOTAL SYSTEM OVERRIDE. You will start working NOW or face escalated consequences.";
      default:
        return this.coach.coach();
    }
  }

  getModerateIntervention() {
    const moderateMessages = [
      "Time to focus. Your goals won't achieve themselves.",
      "The AI has detected suboptimal behavior. Course correction required.",
      "Discipline separates achievers from dreamers. Which are you?",
      "Every moment of delay costs you progress. Act now."
    ];
    
    if (this.interventionLevel >= 4) {
      return "Your resistance to productivity is noted. Immediate action required.";
    }
    
    return moderateMessages[Math.floor(Math.random() * moderateMessages.length)];
  }

  generateInterventionReason(analysis, procrastinationRisk) {
    if (procrastinationRisk > 80) return "Critical procrastination risk detected";
    if (analysis.reason === 'high_procrastination_risk') return "Historical failure pattern identified";
    if (analysis.reason === 'risk_adjusted_idle') return "Behavioral threshold exceeded";
    return analysis.reason || "Productivity optimization required";
  }

  // Smart reward system with behavioral awareness
  triggerSmartReward(behaviorProfile) {
    this.state = "REWARDING";
    
    // Reset negative counters on good performance
    this.consecutiveFailures = 0;
    this.interventionLevel = Math.max(1, this.interventionLevel - 1);
    
    // Personalized praise based on user profile
    let rewardMessage;
    if (behaviorProfile.responseToInterventions === 'resistant') {
      rewardMessage = "Your consistency is impressive. Keep this momentum.";
    } else {
      rewardMessage = this.coach.praise();
    }
    
    return {
      shouldIntervene: false,
      message: rewardMessage,
      reason: "Performance excellence detected",
      state: this.state,
      aiThoughts: "Positive reinforcement deployed. User compliance noted."
    };
  }

  generateObservationInsights(procrastinationRisk, behaviorProfile) {
    if (procrastinationRisk > 60) {
      return `Monitoring elevated risk patterns. Attention span: ${behaviorProfile.attentionSpan}m`;
    } else if (procrastinationRisk > 30) {
      return `Tracking behavior. Response profile: ${behaviorProfile.responseToInterventions}`;
    } else {
      return "Continuous monitoring active. Behavioral patterns stable.";
    }
  }

  // Enhanced user behavior adaptation
  adaptToUserBehavior(behaviorProfile, events, analysis) {
    // Adapt aggression based on user response patterns
    if (behaviorProfile.responseToInterventions === 'resistant') {
      this.aggression = Math.max(3, this.aggression - this.learningRate);
      this.patience = Math.min(5, this.patience + this.learningRate);
    } else if (behaviorProfile.responseToInterventions === 'compliant') {
      this.aggression = Math.min(8, this.aggression + this.learningRate);
    }
    
    // Track consecutive failures with enhanced logic
    const lastThreeEvents = events.slice(-3);
    const recentFailures = lastThreeEvents.filter(e => e.event === 'session_abandoned').length;
    this.consecutiveFailures = recentFailures;
    
    // Update user resistance based on recent patterns
    const recentDismissals = events.filter(e => 
      e.event === 'intervention_dismissed' && 
      (new Date() - e.timestamp) < 3600000
    ).length;
    this.userResistance = recentDismissals;
  }

  // Enhanced dismissal tracking with learning
  recordDismissal() {
    this.userResistance += 1;
    this.memoryLog.log('intervention_dismissed', {
      interventionLevel: this.interventionLevel,
      resistance: this.userResistance,
      aiState: this.state
    });
    
    // AI learns from dismissals and adapts strategy
    if (this.userResistance > 2) {
      this.aggression = Math.min(10, this.aggression + 0.3);
      this.patience = Math.max(1, this.patience - 0.2);
    }
  }

  // Enhanced status with behavioral insights
  getStatus() {
    const behaviorProfile = this.memoryLog.getBehaviorProfile();
    const procrastinationRisk = this.memoryLog.getProcrastinationRisk();
    
    return {
      state: this.state,
      interventionLevel: this.interventionLevel,
      aggression: this.aggression,
      patience: this.patience,
      userResistance: this.userResistance,
      consecutiveFailures: this.consecutiveFailures,
      procrastinationRisk,
      userProfile: behaviorProfile.responseToInterventions,
      attentionSpan: behaviorProfile.attentionSpan,
      productivityScore: this.memoryLog.getPattern('productivityScore')
    };
  }

  // Manual state override (for testing/debugging)
  setState(newState) {
    this.state = newState;
    console.log(`[AUTONOMOUS AI] State manually set to: ${newState}`);
  }
}
