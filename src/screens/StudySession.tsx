
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Play, Pause, Square, ArrowLeft } from 'lucide-react';
import StudyScheduler from '../logic/StudyScheduler';
import BrutalCoach from '../logic/BrutalCoach';
import MemoryLog from '../logic/MemoryLog';

const scheduler = new StudyScheduler();
const coach = new BrutalCoach();
const memoryLog = new MemoryLog();

const StudySession = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Start session immediately when component mounts
    try {
      const newSession = scheduler.startSession(25, 'focus');
      setSession(newSession);
      setIsRunning(true);
      memoryLog.log('session_started', { duration: 25, type: 'focus' });
    } catch (error) {
      console.error('Failed to start session:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!isRunning || !session) return;

    const intervalId = setInterval(() => {
      const updatedSession = scheduler.updateSession();
      if (updatedSession && !updatedSession.active) {
        // Session completed naturally
        setSession(updatedSession);
        setIsRunning(false);
        memoryLog.log('session_completed', { 
          duration: session.duration,
          completed: true 
        });
        
        // AI celebrates completion
        setTimeout(() => {
          alert(coach.praise());
          navigate('/');
        }, 1000);
      } else if (updatedSession) {
        setSession(updatedSession);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, session, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
    memoryLog.log(isRunning ? 'session_paused' : 'session_resumed');
  };

  const handleQuitAttempt = () => {
    const warning = coach.warn();
    setWarningMessage(warning);
    setShowQuitWarning(true);
  };

  const handleForceQuit = () => {
    scheduler.endSession(false);
    memoryLog.log('session_abandoned', { 
      timeRemaining: session?.remaining,
      forcedQuit: true 
    });
    setShowQuitWarning(false);
    navigate('/');
  };

  const handleContinue = () => {
    setShowQuitWarning(false);
    memoryLog.log('quit_attempt_rejected', { aiTriggered: true });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Initializing session...</p>
        </div>
      </div>
    );
  }

  const progress = ((session.duration - session.remaining) / session.duration) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI Monitoring</span>
          </div>
        </div>

        {/* Timer Display */}
        <Card className="ai-glow">
          <div className="p-8 text-center">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-muted-foreground mb-2">
                FOCUS SESSION
              </h2>
              <div className="text-6xl font-mono font-bold mb-4">
                {formatTime(session.remaining)}
              </div>
              <Progress value={progress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handlePause}
                variant="outline"
                size="lg"
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleQuitAttempt}
                variant="destructive"
                size="lg"
                className="w-32"
              >
                <Square className="w-4 h-4 mr-2" />
                Quit
              </Button>
            </div>
          </div>
        </Card>

        {/* Session Info */}
        <Card>
          <div className="p-6">
            <h3 className="font-bold mb-4">Session Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-semibold">Focus Session</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-semibold">25 minutes</span>
              </div>
              <div>
                <span className="text-muted-foreground">Started:</span>
                <span className="ml-2 font-semibold">
                  {session.startTime.toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-semibold ${isRunning ? 'text-green-400' : 'text-orange-400'}`}>
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quit Warning Dialog */}
        <Dialog open={showQuitWarning} onOpenChange={setShowQuitWarning}>
          <DialogContent className="border-destructive">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI WARNING
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="brutal-text text-destructive mb-6">
                "{warningMessage}"
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleContinue}
                  className="flex-1"
                >
                  Continue Session
                </Button>
                <Button 
                  onClick={handleForceQuit}
                  variant="destructive"
                  className="flex-1"
                >
                  Quit Anyway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudySession;
