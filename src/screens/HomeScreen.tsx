
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Clock, Settings, Shield, Zap } from 'lucide-react';
import BrutalCoach from '../logic/BrutalCoach';
import MemoryLog from '../logic/MemoryLog';
import AutonomousAI from '../logic/AutonomousAI';
import AIChat from '../components/AIChat';

const coach = new BrutalCoach();
const memoryLog = new MemoryLog();
const autonomousAI = new AutonomousAI();

const HomeScreen = () => {
  const navigate = useNavigate();
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [aiStatus, setAiStatus] = useState('OFFLINE');
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [currentIntervention, setCurrentIntervention] = useState(null);

  useEffect(() => {
    // AI immediately delivers opening statement
    const quote = coach.coach();
    setMotivationalQuote(quote);
    memoryLog.log('app_launched', { quote });

    // Monitor for autonomous AI interventions
    const intervalId = setInterval(() => {
      const intervention = memoryLog.shouldAIIntervene();
      const aiIntervention = autonomousAI.getCurrentIntervention();
      
      setIdleTime(memoryLog.getIdleTime());
      
      if (aiIntervention && !shouldShowIntervention) {
        setShouldShowIntervention(true);
        setCurrentIntervention(aiIntervention);
        setAiStatus('INTERVENTION ACTIVE');
        autonomousAI.executeIntervention(aiIntervention);
        memoryLog.log('autonomous_intervention', { 
          reason: aiIntervention.reason,
          type: aiIntervention.type,
          severity: aiIntervention.severity
        });
      } else if (intervention.shouldIntervene && !shouldShowIntervention) {
        setShouldShowIntervention(true);
        setAiStatus('INTERVENTION REQUIRED');
        memoryLog.log('manual_intervention', { 
          reason: intervention.reason,
          idleMinutes: intervention.idleMinutes
        });
      }
    }, 15000); // Check every 15 seconds for faster response

    return () => clearInterval(intervalId);
  }, [shouldShowIntervention]);

  const handleAICommand = (command: string) => {
    switch (command) {
      case 'ai_activated':
        setAiStatus('AUTONOMOUS');
        break;
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
    setCurrentIntervention(null);
    setAiStatus(autonomousAI.getStatus().isActive ? 'AUTONOMOUS' : 'OFFLINE');
    setMotivationalQuote(coach.coach());
  };

  const getStatusColor = () => {
    switch (aiStatus) {
      case 'AUTONOMOUS': return 'text-green-400';
      case 'INTERVENTION ACTIVE': return 'text-red-400 animate-pulse';
      case 'BRUTAL MODE ACTIVATED': return 'text-red-600 animate-pulse';
      default: return 'text-orange-400';
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'AUTONOMOUS': return <Zap className="w-6 h-6 text-green-400" />;
      case 'INTERVENTION ACTIVE': return <Shield className="w-6 h-6 text-red-400 animate-pulse" />;
      default: return <Brain className="w-6 h-6 text-orange-400 ai-pulse" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Autonomous AI Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h1 className="text-2xl font-bold">DisciplineOS</h1>
              <p className={`text-sm ${getStatusColor()}`}>
                Autonomous AI: {aiStatus}
              </p>
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
            {/* Autonomous AI Intervention Alert */}
            {shouldShowIntervention && (
              <Card className="border-destructive bg-destructive/10 ai-glow">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-destructive animate-pulse" />
                    <h3 className="text-lg font-bold text-destructive">
                      {currentIntervention ? 'AUTONOMOUS INTERVENTION' : 'AI INTERVENTION'}
                    </h3>
                  </div>
                  <p className="brutal-text text-destructive mb-4">
                    {currentIntervention 
                      ? currentIntervention.message 
                      : `You've been idle for ${idleTime} minutes. The autonomous system demands action.`}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleStartSession}
                      className="bg-destructive hover:bg-destructive/80"
                    >
                      Comply Immediately
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDismissIntervention}
                      className="border-destructive text-destructive"
                    >
                      Resist (Futile)
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Motivational Command */}
            <Card className="ai-glow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Brain className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">AUTONOMOUS AI SAYS:</h3>
                    <p className="brutal-text text-foreground leading-relaxed">
                      "{motivationalQuote}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      System Status: Monitoring your behavior patterns
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={handleStartSession}>
                <div className="p-6 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Focus Session</h3>
                  <p className="text-sm text-muted-foreground">25min Pomodoro</p>
                </div>
              </Card>

              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={() => navigate('/logs')}>
                <div className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Behavior Log</h3>
                  <p className="text-sm text-muted-foreground">AI monitoring data</p>
                </div>
              </Card>

              <Card className="hover:ai-glow transition-all cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="p-6 text-center">
                  <Settings className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">AI Control</h3>
                  <p className="text-sm text-muted-foreground">Autonomy settings</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Autonomous AI Interface */}
          <div className="space-y-6">
            <AIChat onAICommand={handleAICommand} />
            
            {/* Performance Metrics */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4">Performance Under AI Supervision</h3>
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
                    <div className="text-sm text-muted-foreground">Failed</div>
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
