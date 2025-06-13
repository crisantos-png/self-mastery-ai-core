
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Brain, Shield, Target, Bell } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [autopilotMode, setAutopilotMode] = useState(true);
  const [brutalityLevel, setBrutalityLevel] = useState([7]);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [notifications, setNotifications] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(false);
  const [appBlocker, setAppBlocker] = useState(false);

  const getBrutalityDescription = (level) => {
    if (level >= 9) return "Absolutely Ruthless - No mercy";
    if (level >= 7) return "Brutal - Harsh motivation";
    if (level >= 5) return "Firm - Direct feedback";
    if (level >= 3) return "Gentle - Encouraging tone";
    return "Soft - Minimal pressure";
  };

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
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI Configuration</span>
          </div>
        </div>

        {/* AI Control Settings */}
        <Card className="ai-glow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">AI Control Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Autopilot Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Autopilot Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to take autonomous control and intervene when needed
                  </p>
                </div>
                <Switch 
                  checked={autopilotMode} 
                  onCheckedChange={setAutopilotMode}
                />
              </div>

              {/* Brutality Level */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Brutality Level</Label>
                <div className="px-3">
                  <Slider
                    value={brutalityLevel}
                    onValueChange={setBrutalityLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Gentle</span>
                    <span>Ruthless</span>
                  </div>
                </div>
                <p className="text-sm text-primary">
                  Level {brutalityLevel[0]}: {getBrutalityDescription(brutalityLevel[0])}
                </p>
              </div>

              {/* Daily Goal */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Daily Session Goal</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
                    className="w-20"
                    min={1}
                    max={20}
                  />
                  <span className="text-sm text-muted-foreground">sessions per day</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Controls */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Feature Controls</h2>
            </div>

            <div className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts and reminders from the AI
                  </p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>

              {/* Voice Commands - Placeholder */}
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Voice Commands</Label>
                  <p className="text-sm text-muted-foreground">
                    Control the AI with voice commands (Coming Soon)
                  </p>
                </div>
                <Switch 
                  checked={voiceCommands} 
                  onCheckedChange={setVoiceCommands}
                  disabled
                />
              </div>

              {/* App Blocker - Placeholder */}
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">App Blocker</Label>
                  <p className="text-sm text-muted-foreground">
                    Block distracting apps during focus sessions (Coming Soon)
                  </p>
                </div>
                <Switch 
                  checked={appBlocker} 
                  onCheckedChange={setAppBlocker}
                  disabled
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <div className="p-6">
            <h3 className="text-lg font-bold text-destructive mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  if (confirm("Are you sure? This will reset all AI memories and patterns.")) {
                    // TODO: Implement reset functionality
                    alert("AI memory reset (placeholder - will implement with MemoryLog.reset())");
                  }
                }}
              >
                Reset AI Memory
              </Button>
              <p className="text-sm text-muted-foreground">
                This will clear all session history, patterns, and AI learned behaviors.
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button 
          className="w-full" 
          onClick={() => {
            // TODO: Save settings to local storage or state management
            alert("Settings saved (placeholder - will implement persistence)");
          }}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
