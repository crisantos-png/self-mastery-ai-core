
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Brain, Send, Shield, Zap } from 'lucide-react';
import AutonomousAI from '../logic/AutonomousAI';

const autonomousAI = new AutonomousAI();

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  aiAction?: string;
}

const AIChat = ({ onAICommand }: { onAICommand?: (command: string) => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('OFFLINE');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // AI immediately introduces itself
    setMessages([{
      id: '1',
      text: "Autonomous AI initialized. I don't need the cloud. I don't need servers. I run here, on your device, and I will take control when needed. Say 'activate' to begin autonomous operation.",
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.toLowerCase();
    setInput('');
    setIsLoading(true);

    // Process autonomous AI commands
    let aiResponse = '';
    let aiAction = '';

    if (userInput.includes('activate') || userInput.includes('start')) {
      aiResponse = autonomousAI.activate();
      aiAction = 'ACTIVATED';
      setAiStatus('ACTIVE');
      if (onAICommand) onAICommand('ai_activated');
    } else if (userInput.includes('deactivate') || userInput.includes('stop')) {
      aiResponse = autonomousAI.deactivate();
      aiAction = 'DEACTIVATED';
      setAiStatus('OFFLINE');
    } else if (userInput.includes('goal')) {
      // Extract goal from input
      const goal = userInput.replace(/.*goal.?/i, '').trim();
      if (goal) {
        autonomousAI.setGoals([goal]);
        aiResponse = `Goal registered: "${goal}". I will ensure you achieve this or suffer the consequences.`;
        aiAction = 'GOAL_SET';
      } else {
        aiResponse = "State your goal clearly. I need something to enforce.";
      }
    } else if (userInput.includes('status')) {
      const status = autonomousAI.getStatus();
      aiResponse = `Status: ${status.isActive ? 'ACTIVE' : 'OFFLINE'} | Autonomy Level: ${status.autonomyLevel}/10 | Queued Interventions: ${status.queuedInterventions}`;
      aiAction = 'STATUS_CHECK';
    } else if (userInput.includes('permissions')) {
      const permissions = autonomousAI.requestPhonePermissions();
      aiResponse = `Permission status: ${JSON.stringify(permissions)}. Grant me full access for maximum control.`;
      aiAction = 'PERMISSIONS_REQUESTED';
    } else {
      // Default autonomous response
      const responses = [
        "I understand. Your compliance is noted.",
        "Your input is recorded. Action will be taken accordingly.",
        "Acknowledged. The autonomous system continues monitoring.",
        "Received. Your behavior patterns are being analyzed.",
        "Understood. Preparing appropriate intervention if needed."
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    }

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date(),
      aiAction
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'ACTIVE': return <Zap className="w-5 h-5 text-green-400 animate-pulse" />;
      case 'OFFLINE': return <Shield className="w-5 h-5 text-red-400" />;
      default: return <Brain className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <Card className="ai-glow h-96 flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        {getStatusIcon()}
        <h3 className="font-bold">Autonomous AI Interface</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          aiStatus === 'ACTIVE' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
        }`}>
          {aiStatus}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-primary text-primary-foreground ml-4'
                  : 'bg-muted mr-4'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.aiAction && (
                <div className="text-xs text-green-400 mt-1 font-mono">
                  ACTION: {message.aiAction}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg mr-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Processing autonomously...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Command the autonomous AI..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChat;
