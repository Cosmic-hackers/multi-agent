import React from 'react';
import { Search, ShieldAlert, Brain } from 'lucide-react';

interface AgentThinkingProps {
  step: string;
}

export const AgentThinking: React.FC<AgentThinkingProps> = ({ step }) => {
  const getIcon = () => {
      if (step.includes("Researcher")) return <Search className="w-4 h-4 text-blue-400" />;
      if (step.includes("Critic")) return <ShieldAlert className="w-4 h-4 text-red-400" />;
      return <Brain className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center space-x-3 bg-adk-card/50 border border-adk-border rounded-full px-4 py-2">
        <div className="relative flex items-center justify-center w-5 h-5">
           <div className="absolute w-full h-full rounded-full bg-adk-accent/20 agent-thinking-pulse"></div>
           {getIcon()}
        </div>
        <span className="text-sm text-adk-textMuted font-mono">{step}</span>
      </div>
    </div>
  );
};
