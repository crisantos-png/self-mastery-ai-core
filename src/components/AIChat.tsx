
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Brain, Send, Mic } from 'lucide-react';
import AIBrain from '../logic/AIBrain';

const aiBrain = new AIBrain();

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sentiment?: string;
  intent?: string;
}

const AIChat = ({ onAICommand }: { onAICommand?: (command: string) => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeAI = async () => {
      await aiBrain.initialize();
      setIsInitialized(true);
      
      // AI greets user
      setMessages([{
        id: '1',
        text: "AI online. Speak to me about your goals, struggles, or just say hello. I will understand and respond accordingly.",
        isUser: false,
        timestamp: new Date()
      }]);
    };

    initializeAI();
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
    setInput('');
    setIsLoading(true);

    try {
      // AI analyzes the user input
      const analysis = await aiBrain.analyzeUserInput(input);
      
      // AI responds based on understanding
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: analysis.aiResponse || "I understand. The AI is processing your input.",
        isUser: false,
        timestamp: new Date(),
        sentiment: analysis.sentiment,
        intent: analysis.intent
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger commands based on intent
      if (analysis.intent === 'start' && onAICommand) {
        onAICommand('start_session');
      } else if (analysis.intent === 'quit' && onAICommand) {
        onAICommand('brutal_intervention');
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "AI processing error. But I'm still watching you.",
        isUser: false,
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="ai-glow h-96 flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary ai-pulse" />
        <h3 className="font-bold">AI Natural Language Interface</h3>
        {!isInitialized && (
          <span className="text-xs text-orange-400 animate-pulse">Loading...</span>
        )}
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
              {message.sentiment && (
                <div className="text-xs text-muted-foreground mt-1">
                  Detected: {message.sentiment} • {message.intent}
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
                <span className="text-sm">AI is thinking...</span>
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
            placeholder="Tell the AI how you're feeling..."
            disabled={isLoading || !isInitialized}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !isInitialized || !input.trim()}
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
