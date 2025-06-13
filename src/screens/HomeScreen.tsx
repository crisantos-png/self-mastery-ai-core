
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Clock, Settings, Shield, Zap, AlertTriangle } from 'lucide-react';
import BrutalCoach from '../logic/BrutalCoach';
import MemoryLog from '../logic/MemoryLog';
import AutonomousAI from '../logic/AutonomousAI';
import AIChat from '../components/AIChat';

// Initialize the autonomous system
const coach = new BrutalCoach();
const memoryLog = new MemoryLog();
const autonomousAI = new AutonomousAI(memoryLog, coach);

const HomeScreen = () => {
  const navigate = useNavigate();
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [aiStatus, setAiStatus] = useState('OBSERVING');
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [aiState, setAiState] = useState(autonomousAI.getStatus());

  useEffect(() => {
    // AI immediately delivers opening statement
    const quote = coach.coach();
    setMotivationalQuote(quote);
    memoryLog.log('app_launched', { quote });

    // Autonomous AI evaluation cycle - the AI's consciousness runs every 10 seconds
    const intervalId = setInterval(() => {
      const evaluation = autonomousAI.evaluate();
      const currentIdleTime = memoryLog.getIdleTime();
      
      setIdleTime(currentIdleTime);
      setCurrentEvaluation(evaluation);
      setAiState(autonomousAI.getStatus());
      
      // AI decides to intervene autonomously
      if (evaluation.shouldIntervene && !shouldShowIntervention) {
        setMotivationalQuote(evaluation.message);
        setShouldShowIntervention(true);
        setAiStatus(evaluation.state);
        memoryLog.log('ai_intervention', { 
          reason: evaluation.reason,
          interventionLevel: evaluation.interventionLevel,
          aiState: evaluation.state,
          aiThoughts: evaluation.aiThoughts
        });
      } else if (evaluation.state === 'REWARDING') {
        setMotivationalQuote(evaluation.message);
        setAiStatus(evaluation.state);
      } else {
        setAiStatus(evaluation.state);
      }
    }, 10000); // AI evaluates every 10 seconds

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
        setAiStatus('ESCALATING');
        break;
    }
  };

  const handleStartSession = () => {
    memoryLog.log('session_requested');
    setShouldShowIntervention(false);
    navigate('/study');
  };

  const handleDismissIntervention = () => {
    // Record user resistance in AI system
    autonomousAI.recordDismissal();
    
    setShouldShowIntervention(false);
    setCurrentEvaluation(null);
    setAiStatus('OBSERVING');
    setMotivationalQuote(coach.coach());
    
    // Log resistance for AI learning
    memoryLog.log('intervention_dismissed', {
      userResistance: aiState.userResistance + 1,
      interventionLevel: aiState.interventionLevel
    });
  };

  const getStatusColor = () => {
    switch (aiStatus) {
      case 'OBSERVING': return 'text-blue-400';
      case 'INTERVENING': return 'text-yellow-400 animate-pulse';
      case 'REPRIMANDING': return 'text-orange-400 animate-pulse';
      case 'ESCALATING': return 'text-red-400 animate-pulse';
      case 'REWARDING': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'OBSERVING': return <Brain className="w-6 h-6 text-blue-400 ai-pulse" />;
      case 'INTERVENING': return <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'REPRIMANDING': return <AlertTriangle className="w-6 h-6 text-orange-400 animate-pulse" />;
      case 'ESCALATING': return <Shield className="w-6 h-6 text-red-400 animate-pulse" />;
      case 'REWARDING': return <Target className="w-6 h-6 text-green-400" />;
      default: return <Brain className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getInterventionSeverity = () => {
    if (!currentEvaluation) return 'low';
    
    switch (currentEvaluation.interventionLevel) {
      case 1:
      case 2: return 'low';
      case 3: return 'medium';
      case 4:
      case 5: return 'high';
      default: return 'low';
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
              {currentEvaluation?.aiThoughts && (
                <p className="text-xs text-muted-foreground italic">
                  {currentEvaluation.aiThoughts}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Aggression: {aiState.aggression}/10
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Traditional Interface */}
          <div className="space-y-6">
            {/* Autonomous AI Intervention Alert */}
            {shouldShowIntervention && currentEvaluation && (
              <Card className={`border-destructive ai-glow ${
                getInterventionSeverity() === 'high' ? 'bg-red-500/20' : 
                getInterventionSeverity() === 'medium' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
              }`}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
                    <h3 className="text-lg font-bold text-destructive">
                      AUTONOMOUS INTERVENTION - LEVEL {currentEvaluation.interventionLevel}/5
                    </h3>
                  </div>
                  <p className="brutal-text text-destructive mb-2">
                    {currentEvaluation.message}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reason: {currentEvaluation.reason} | Resistance Level: {aiState.userResistance}
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
                      Resist (AI Will Remember)
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Status Display */}
            <Card className="ai-glow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Brain className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">AUTONOMOUS AI STATUS:</h3>
                    <p className="brutal-text text-foreground leading-relaxed mb-3">
                      "{motivationalQuote}"
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>State: <span className={getStatusColor()}>{aiStatus}</span></div>
                      <div>Failures: <span className="text-red-400">{aiState.consecutiveFailures}</span></div>
                      <div>Patience: <span className="text-yellow-400">{aiState.patience}/3</span></div>
                      <div>Resistance: <span className="text-orange-400">{aiState.userResistance}</span></div>
                    </div>
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
            
            {/* AI Performance Metrics */}
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
                
                {/* AI Evaluation Summary */}
                {currentEvaluation && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">AI Analysis:</h4>
                    <p className="text-xs text-muted-foreground">
                      {currentEvaluation.aiThoughts || "Continuous monitoring active..."}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
