
/**
 * BrutalCoach.js - The AI's personality engine
 * Delivers motivational attacks, praise, and behavioral analysis
 */

class BrutalCoach {
  constructor(brutalityLevel = 7) {
    this.brutalityLevel = brutalityLevel;
    this.motivationalAttacks = [
      "Stop wasting time. Your future self is disappointed in you.",
      "Every second you delay is a victory for mediocrity.",
      "You think procrastination is your friend? It's your executioner.",
      "Discipline is choosing between what you want now and what you want most.",
      "Your comfort zone is a beautiful place, but nothing grows there.",
      "Pain is temporary. Quitting lasts forever.",
      "You don't have to be great to get started, but you have to get started to be great.",
      "The voice in your head that says you can't do it is a liar."
    ];
    
    this.praiseMessages = [
      "Excellent. You're finally acting like the person you claim to be.",
      "This is what discipline looks like. Remember this feeling.",
      "You just proved your doubters wrong. Keep going.",
      "Every completed session is a middle finger to your lazy past self.",
      "This is momentum. Don't let it die."
    ];
    
    this.warningMessages = [
      "Quitting now? That's exactly what I expected from you.",
      "Walk away if you want. Just remember: champions finish what they start.",
      "Your goals don't care about your excuses.",
      "Every time you quit, you train yourself to be a quitter.",
      "This is where discipline separates the strong from the weak."
    ];
  }
  
  coach() {
    const messages = this.motivationalAttacks;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  praise() {
    const messages = this.praiseMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  warn() {
    const messages = this.warningMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  analyzePattern(sessions) {
    const completedSessions = sessions.filter(s => s.completed).length;
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) {
      return "You haven't even started. The AI is watching. Waiting.";
    }
    
    const successRate = (completedSessions / totalSessions) * 100;
    
    if (successRate >= 80) {
      return "Your consistency is impressive. The AI approves.";
    } else if (successRate >= 60) {
      return "Decent effort, but the AI expects more. Push harder.";
    } else if (successRate >= 40) {
      return "Your failure rate is concerning. The AI is disappointed.";
    } else {
      return "Pathetic. You're failing more than you're succeeding. The AI demands better.";
    }
  }
  
  setBrutality(level) {
    this.brutalityLevel = Math.max(1, Math.min(10, level));
  }
}

export default BrutalCoach;
