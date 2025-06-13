
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Clock, Settings } from 'lucide-react';
import BrutalCoach from '../logic/BrutalCoach';
import MemoryLog from '../logic/MemoryLog';
import AIBrain from '../logic/AIBrain';
import AIChat from '../components/AIChat';

const coach = new BrutalCoach();
const memoryLog = new MemoryLog();
const aiBrain = new AIBrain();

const HomeScreen = () => {
  const navigate = useNavigate();
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [aiStatus, setAiStatus] = useState('INITIALIZING');
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState('');

  useEffect(() => {
    const initializeAI = async () => {
      // Initialize AI Brain
      await aiBrain.initialize();
      setAiStatus('MONITORING');
      
      // AI immediately delivers opening statement
      const quote = coach.coach();
      setMotivationalQuote(quote);
      memoryLog.log('app_launched', { quote });

      // Get AI behavior analysis
      const sessions = memoryLog.getAllSessions();
      const analysis = await aiBrain.analyzeBehaviorPattern(sessions);
      setAiAnalysis(analysis);
    };

    initializeAI();

    // AI monitors for idle behavior
    const intervalId = setInterval(async () => {
      const intervention = memoryLog.shouldAIIntervene();
      const aiIntervention = aiBrain.shouldInterveneBrutal();
      
      setIdleTime(memoryLog.getIdleTime());
      
      if ((intervention.shouldIntervene || aiIntervention.shouldIntervene) && !shouldShowIntervention) {
        setShouldShowIntervention(true);
        setAiStatus('INTERVENTION REQUIRED');
        memoryLog.log('ai_intervention', { 
          reason: intervention.reason || aiIntervention.reason,
          aiTriggered: true,
          brutalityLevel: aiIntervention.brutalityLevel || 7
        });
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [shouldShowIntervention]);

  const handleAICommand = (command: string) => {
    switch (command) {
      case 'start_session':
        handleStartSession();
        break;
      case 'brutal_intervention':
        setShouldShowIntervention(true);
        setAiStatus('BRUTAL MODE ACTIVATED');
        break;
    }
  };

  const handleStartSession = () => {
    memoryLog.log('session_requested');
    navigate('/study');
  };

  const handleDismissIntervention = () => {
    setShouldShowIntervention(false);
    setAiStatus('MONITORING');
    setMotivationalQuote(coach.coach());
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* AI Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary ai-pulse" />
            <div>
              <h1 className="text-2xl font-bold">DisciplineOS</h1>
              <p className="text-sm text-muted-foreground">AI Status: {aiStatus}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Traditional Interface */}
          <div className="space-y-6">
            {/* AI Intervention Alert */}
            {shouldShowIntervention && (
              <Card className="border-destructive bg-destructive/10 ai-glow">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-6 h-6 text-destructive animate-pulse" />
                    <h3 className="text-lg font-bold text-destructive">AI INTERVENTION</h3>
                  </div>
                  <p className="brutal-text text-destructive mb-4">
                    You've been idle for {idleTime} minutes. Your procrastination ends now.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleStartSession}
                      className="bg-destructive hover:bg-destructive/80"
                    >
                      Start Session NOW
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDismissIntervention}
                      className="border-destructive text-destructive"
                    >
                      Dismiss (Coward)
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Motivational Quote */}
            <Card className="ai-glow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Brain className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">AI SAYS:</h3>
                    <p className="brutal-text text-foreground leading-relaxed">
                      "{motivationalQuote}"
                    </p>
                    {aiAnalysis && (
                      <p className="text-sm text-muted-foreground mt-3 italic">
                        Pattern Analysis: {aiAnalysis}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={handleStartSession}>
                <div className="p-6 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Start Focus Session</h3>
                  <p className="text-sm text-muted-foreground">Begin 25min Pomodoro</p>
                </div>
              </Card>

              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={() => navigate('/logs')}>
                <div className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Session History</h3>
                  <p className="text-sm text-muted-foreground">View your progress</p>
                </div>
              </Card>

              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="p-6 text-center">
                  <Settings className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">AI Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure brutality</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - AI Chat Interface */}
          <div className="space-y-6">
            <AIChat onAICommand={handleAICommand} />
            
            {/* Today's Stats */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4">Today's Performance</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {memoryLog.getTodayEvents().filter(e => e.event === 'session_completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {memoryLog.getTodayEvents().filter(e => e.event === 'session_abandoned').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Abandoned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{idleTime}m</div>
                    <div className="text-sm text-muted-foreground">Idle Time</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
