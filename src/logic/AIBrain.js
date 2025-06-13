
/**
 * AIBrain.js - Natural Language AI Core using Transformers.js
 * Handles NLP, sentiment analysis, and intelligent responses
 */

import { pipeline } from '@huggingface/transformers';

class AIBrain {
  constructor() {
    this.classifier = null;
    this.embedder = null;
    this.isInitialized = false;
    this.userContext = {
      mood: 'neutral',
      motivationLevel: 5,
      lastInteraction: null,
      behaviorPattern: 'unknown'
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('[AI BRAIN] Initializing transformers...');
      
      // Load sentiment analysis model for understanding user mood
      this.classifier = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );

      // Load embeddings model for semantic understanding
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      this.isInitialized = true;
      console.log('[AI BRAIN] Transformers loaded successfully');
    } catch (error) {
      console.error('[AI BRAIN] Failed to initialize:', error);
      // Fallback mode without AI
      this.isInitialized = false;
    }
  }

  async analyzeUserInput(text) {
    if (!this.isInitialized || !text) {
      return { sentiment: 'NEUTRAL', confidence: 0, intent: 'unknown' };
    }

    try {
      // Analyze sentiment
      const sentiment = await this.classifier(text);
      
      // Detect intent from text
      const intent = this.detectIntent(text.toLowerCase());
      
      // Update user context
      this.updateUserContext(sentiment[0], intent);

      return {
        sentiment: sentiment[0].label,
        confidence: sentiment[0].score,
        intent: intent,
        aiResponse: this.generateIntelligentResponse(sentiment[0], intent)
      };
    } catch (error) {
      console.error('[AI BRAIN] Analysis failed:', error);
      return { sentiment: 'NEUTRAL', confidence: 0, intent: 'unknown' };
    }
  }

  detectIntent(text) {
    const intents = {
      quit: ['quit', 'stop', 'exit', 'give up', 'can\'t do this', 'too hard'],
      motivation: ['motivate', 'encourage', 'help', 'struggling', 'difficult'],
      start: ['start', 'begin', 'ready', 'let\'s go', 'do this'],
      tired: ['tired', 'exhausted', 'can\'t focus', 'sleepy', 'drained'],
      angry: ['angry', 'frustrated', 'hate this', 'stupid', 'annoying'],
      proud: ['finished', 'completed', 'did it', 'success', 'accomplished']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return intent;
      }
    }
    return 'neutral';
  }

  updateUserContext(sentiment, intent) {
    this.userContext.lastInteraction = new Date();
    this.userContext.mood = sentiment.label.toLowerCase();
    
    // Adjust motivation level based on sentiment and intent
    if (sentiment.label === 'POSITIVE' || intent === 'start') {
      this.userContext.motivationLevel = Math.min(10, this.userContext.motivationLevel + 1);
    } else if (sentiment.label === 'NEGATIVE' || intent === 'quit') {
      this.userContext.motivationLevel = Math.max(1, this.userContext.motivationLevel - 1);
    }
  }

  generateIntelligentResponse(sentiment, intent) {
    const responses = {
      quit_negative: [
        "Running away? That's exactly what I expected from you.",
        "Your weakness is showing. The AI sees everything.",
        "Quitting is a choice. Being a quitter is a lifestyle. Choose wisely."
      ],
      start_positive: [
        "Finally. Your potential is about to be unlocked.",
        "This is what discipline looks like. The AI approves.",
        "Good. Channel that energy into focused destruction of your limitations."
      ],
      motivation_neutral: [
        "You asked for motivation? Here it is: Stop asking and start doing.",
        "Motivation is temporary. Discipline is permanent. Choose discipline.",
        "The AI doesn't do motivation. It does results. Get to work."
      ],
      tired_negative: [
        "Tired? The only thing tired here is your list of excuses.",
        "Fatigue is mental. Your body can handle more than your mind believes.",
        "Rest when you're dead. Right now, you're just procrastinating."
      ]
    };

    const key = `${intent}_${sentiment.label.toLowerCase()}`;
    const fallbackKey = intent;
    
    const responseArray = responses[key] || responses[fallbackKey] || responses.motivation_neutral;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }

  async analyzeBehaviorPattern(sessionHistory) {
    if (!this.isInitialized || !sessionHistory.length) {
      return "Insufficient data for pattern analysis.";
    }

    const completionRate = sessionHistory.filter(s => s.completed).length / sessionHistory.length;
    const recentSessions = sessionHistory.slice(-5);
    const recentCompletions = recentSessions.filter(s => s.completed).length;

    let pattern = '';
    if (completionRate >= 0.8) {
      pattern = 'consistent_achiever';
    } else if (completionRate >= 0.6) {
      pattern = 'moderate_performer';
    } else if (recentCompletions === 0) {
      pattern = 'complete_failure';
    } else {
      pattern = 'struggling_inconsistent';
    }

    const responses = {
      consistent_achiever: "Your pattern shows excellence. The AI recognizes your discipline.",
      moderate_performer: "Decent but not exceptional. The AI expects more from you.",
      complete_failure: "Your recent performance is pathetic. The AI demands immediate improvement.",
      struggling_inconsistent: "Your inconsistency is your enemy. The AI will help you fix this weakness."
    };

    this.userContext.behaviorPattern = pattern;
    return responses[pattern];
  }

  getUserContext() {
    return { ...this.userContext };
  }

  shouldInterveneBrutal() {
    const { motivationLevel, mood, behaviorPattern } = this.userContext;
    
    // AI becomes more brutal when motivation is low or behavior is poor
    if (motivationLevel <= 3 || mood === 'negative' || behaviorPattern === 'complete_failure') {
      return {
        shouldIntervene: true,
        reason: 'low_performance_detected',
        brutalityLevel: 9,
        message: "Your performance is unacceptable. The AI is taking control."
      };
    }
    
    return { shouldIntervene: false };
  }
}

export default AIBrain;
