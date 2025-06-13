
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import MemoryLog from '../logic/MemoryLog';
import BrutalCoach from '../logic/BrutalCoach';

const memoryLog = new MemoryLog();
const coach = new BrutalCoach();

const Logs = () => {
  const navigate = useNavigate();
  const events = memoryLog.getEvents(20);
  const patterns = memoryLog.getAllPatterns();
  const todayEvents = memoryLog.getTodayEvents();
  
  const sessionsToday = todayEvents.filter(e => e.event === 'session_completed').length;
  const abandonsToday = todayEvents.filter(e => e.event === 'session_abandoned').length;
  
  const aiAnalysis = coach.analyzePattern(
    todayEvents.filter(e => e.event.includes('session'))
  );

  const getEventIcon = (event) => {
    switch (event) {
      case 'session_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'session_abandoned':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'session_started':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'ai_intervention':
        return <Zap className="w-4 h-4 text-orange-400" />;
      default:
        return <Brain className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case 'session_completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'session_abandoned':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'session_started':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'ai_intervention':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const formatEventName = (event) => {
    return event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI Analysis</span>
          </div>
        </div>

        {/* AI Analysis */}
        <Card className="ai-glow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">AI Pattern Analysis</h2>
            </div>
            <p className="brutal-text text-foreground mb-4">
              "{aiAnalysis}"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{sessionsToday}</div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{abandonsToday}</div>
                <div className="text-sm text-muted-foreground">Abandoned Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{patterns.aiInterventions}</div>
                <div className="text-sm text-muted-foreground">AI Interventions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{memoryLog.getIdleTime()}m</div>
                <div className="text-sm text-muted-foreground">Current Idle</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Event Log */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Activity Log</h3>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activity recorded yet.</p>
                  <p className="text-sm">The AI is waiting for you to begin.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event)}
                      <div>
                        <div className="font-semibold">
                          {formatEventName(event.event)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.aiTriggered && (
                        <Badge variant="outline" className="text-xs">
                          AI Triggered
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getEventColor(event.event)}`}
                      >
                        {formatEventName(event.event)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Session Summary */}
        {events.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Session Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {events.filter(e => e.event === 'session_completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Completed</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {events.filter(e => e.event === 'session_abandoned').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Abandoned</div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {events.filter(e => e.event === 'ai_intervention').length}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Interventions</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Logs;
