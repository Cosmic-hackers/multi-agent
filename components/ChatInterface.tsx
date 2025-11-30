import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Map, RotateCcw, Download } from 'lucide-react';
import { ChatSession, Message, Attachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { createChatSession, sendMessageStream, parseLearningPathJSON } from '../services/gemini';
import { Chat, GenerateContentResponse } from '@google/genai';
import { LearningPathRenderer } from './LearningPathRenderer';
import { AgentThinking } from './AgentThinking';

interface ChatInterfaceProps {
  session: ChatSession;
  onUpdateMessages: (messages: Message[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onUpdateMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null); // For thinking animation
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session on mount or session change
  useEffect(() => {
    chatRef.current = createChatSession();
    // In a real app we would reload history into the chat context here
  }, [session.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, activeStep]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: [...attachments]
    };

    const newMessages = [...session.messages, userMsg];
    onUpdateMessages(newMessages);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Simulate Agent Handoffs before response starts
    const steps = ['Orchestrator analyzing...', 'Researcher searching...', 'Critic validating...'];
    for (const step of steps) {
        setActiveStep(step);
        await new Promise(r => setTimeout(r, 800)); // Fake delay for UX
    }
    setActiveStep(null);

    try {
      if (!chatRef.current) chatRef.current = createChatSession();
      
      const stream = await sendMessageStream(
          chatRef.current, 
          userMsg.content, 
          userMsg.attachments
      );

      let fullResponseText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Initial bot message placeholder
      onUpdateMessages([...newMessages, {
          id: botMsgId,
          role: 'model',
          content: '',
          timestamp: new Date(),
          sender: 'Orchestrator'
      }]);

      for await (const chunk of stream) {
        const text = (chunk as GenerateContentResponse).text || '';
        fullResponseText += text;
        
        onUpdateMessages([...newMessages, {
            id: botMsgId,
            role: 'model',
            content: fullResponseText,
            timestamp: new Date(),
            sender: 'Orchestrator',
            groundingMetadata: (chunk as any).groundingMetadata // Capture grounding if available
        }]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      onUpdateMessages([...newMessages, {
          id: Date.now().toString(),
          role: 'model',
          content: "⚠️ **System Error**: The Orchestrator failed to connect to the agent swarm. Please try again.",
          timestamp: new Date(),
          sender: 'System'
      }]);
    } finally {
      setIsLoading(false);
      setActiveStep(null);
    }
  };

  const handleGenerateLearningPath = () => {
    setInput(`Generate a comprehensive Learning Path for: "${input || "the current topic"}"`);
    handleSend();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setAttachments([...attachments, {
            type: 'file',
            mimeType: file.type,
            data: base64,
            name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-adk-bg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {session.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-adk-textMuted opacity-60">
             <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-adk-card to-adk-border flex items-center justify-center mb-6">
                <RotateCcw className="w-10 h-10 text-adk-accent animate-spin-slow" />
             </div>
             <h2 className="text-2xl font-bold text-adk-text mb-2">ADK Agent Swarm Ready</h2>
             <p className="max-w-md">Enter a topic. The Orchestrator will deploy Researcher, Critic, and Summarizer agents to build a comprehensive report.</p>
          </div>
        )}

        {session.messages.map((msg, idx) => {
           // Check if this message contains a Learning Path JSON
           const learningPathData = msg.role === 'model' ? parseLearningPathJSON(msg.content) : null;
           
           return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl w-full ${msg.role === 'user' ? 'bg-adk-accent/10 border border-adk-accent/20' : 'bg-transparent'} rounded-lg p-4 md:p-6`}>
                
                {msg.role === 'model' && (
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-xs text-white">OR</div>
                        <span className="text-sm font-bold text-adk-text">Orchestrator</span>
                        <span className="text-xs text-adk-textMuted">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                     <div className="flex space-x-2 mb-2">
                        {msg.attachments.map((att, i) => (
                            <div key={i} className="flex items-center space-x-2 bg-adk-card border border-adk-border rounded p-2 text-xs">
                                <Paperclip className="w-3 h-3" />
                                <span>{att.name}</span>
                            </div>
                        ))}
                     </div>
                )}

                <div className="markdown-body text-adk-text">
                    <MarkdownRenderer content={msg.content.replace(/```json\n[\s\S]*?\n```/, '')} />
                </div>

                {learningPathData && (
                    <LearningPathRenderer path={learningPathData} />
                )}

                {msg.groundingMetadata?.groundingChunks?.length ? (
                    <div className="mt-4 pt-4 border-t border-adk-border">
                        <div className="text-xs font-semibold text-adk-textMuted uppercase mb-2">Sources Verified by Critic</div>
                        <div className="flex flex-wrap gap-2">
                            {msg.groundingMetadata.groundingChunks.map((chunk, i) => (
                                chunk.web?.uri && (
                                    <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center space-x-1 px-2 py-1 bg-adk-card rounded border border-adk-border text-xs text-blue-400 hover:text-blue-300">
                                        <Map className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">{chunk.web.title || 'Source'}</span>
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                ) : null}

                </div>
            </div>
          );
        })}
        
        {activeStep && <AgentThinking step={activeStep} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-adk-border bg-adk-bg/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex flex-col space-y-3">
            {attachments.length > 0 && (
                <div className="flex space-x-2">
                    {attachments.map((att, i) => (
                        <div key={i} className="px-3 py-1 bg-adk-card rounded-full text-xs flex items-center space-x-2 border border-adk-border">
                             <span>{att.name}</span>
                             <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                        </div>
                    ))}
                </div>
            )}
            <div className="relative flex items-end bg-adk-sidebar border border-adk-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-adk-accent/50 focus-within:border-adk-accent transition-all">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the Research Agents..."
                    className="w-full bg-transparent border-0 focus:ring-0 resize-none min-h-[50px] max-h-[200px] py-3 pl-4 pr-12 text-adk-text placeholder-adk-textMuted"
                    rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-adk-textMuted hover:text-adk-text hover:bg-adk-card rounded-lg transition-colors"
                        title="Attach File"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={(!input && attachments.length === 0) || isLoading}
                        className="p-2 bg-adk-accent hover:bg-adk-accentHover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.txt,.py,.js,.md" 
                />
            </div>
            <div className="flex justify-between items-center text-xs text-adk-textMuted">
                <div className="flex space-x-4">
                     <button 
                        onClick={handleGenerateLearningPath}
                        className="flex items-center space-x-1 hover:text-adk-accent transition-colors"
                     >
                        <Map className="w-3 h-3" />
                        <span>Generate Learning Path</span>
                     </button>
                     <button className="flex items-center space-x-1 hover:text-adk-accent transition-colors">
                        <Download className="w-3 h-3" />
                        <span>Export Report</span>
                     </button>
                </div>
                <div>Powered by Gemini 2.5 Flash</div>
            </div>
        </div>
      </div>
    </div>
  );
};
