
/**
 * StudyScheduler.js - Session management and timing logic
 * Handles study sessions, breaks, and duration tracking
 */

class StudyScheduler {
  constructor() {
    this.currentSession = null;
    this.sessions = [];
  }
  
  startSession(duration = 25, type = 'focus') {
    if (this.currentSession) {
      throw new Error('Session already in progress');
    }
    
    this.currentSession = {
      id: Date.now(),
      type,
      duration: duration * 60, // Convert to seconds
      startTime: new Date(),
      remaining: duration * 60,
      completed: false,
      active: true
    };
    
    console.log(`[AI] Session initiated: ${duration}min ${type} session`);
    return this.currentSession;
  }
  
  endSession(completed = false) {
    if (!this.currentSession) {
      return null;
    }
    
    const session = {
      ...this.currentSession,
      endTime: new Date(),
      completed,
      active: false
    };
    
    this.sessions.push(session);
    this.currentSession = null;
    
    console.log(`[AI] Session ended: ${completed ? 'COMPLETED' : 'ABANDONED'}`);
    return session;
  }
  
  updateSession() {
    if (!this.currentSession || !this.currentSession.active) {
      return null;
    }
    
    const elapsed = Math.floor((new Date() - this.currentSession.startTime) / 1000);
    this.currentSession.remaining = Math.max(0, this.currentSession.duration - elapsed);
    
    if (this.currentSession.remaining === 0) {
      return this.endSession(true);
    }
    
    return this.currentSession;
  }
  
  getCurrentSession() {
    return this.currentSession;
  }
  
  getAllSessions() {
    return this.sessions;
  }
  
  getTodaySessions() {
    const today = new Date().toDateString();
    return this.sessions.filter(session => 
      session.startTime.toDateString() === today
    );
  }
  
  getSessionStats() {
    const total = this.sessions.length;
    const completed = this.sessions.filter(s => s.completed).length;
    const abandoned = total - completed;
    
    return {
      total,
      completed,
      abandoned,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

export default StudyScheduler;
