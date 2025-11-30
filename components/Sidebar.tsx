import React from 'react';
import { Bot, Plus, MessageSquare, Sun, Moon, ChevronLeft, Hexagon, Settings } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  darkMode,
  toggleDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-64 h-full bg-adk-sidebar border-r border-adk-border flex flex-col transition-all duration-300 z-20">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-adk-border">
        <div className="flex items-center space-x-2 text-adk-text">
          <Hexagon className="w-6 h-6 text-adk-accent fill-adk-accent/20" />
          <span className="font-bold text-lg tracking-tight">ADK Studio</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 hover:bg-adk-border rounded text-adk-textMuted">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full bg-adk-accent hover:bg-adk-accentHover text-white py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Task</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-2 py-1 text-xs font-semibold text-adk-textMuted uppercase tracking-wider">
          History
        </div>
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-sm transition-colors ${
              session.id === currentSessionId 
                ? 'bg-adk-card text-adk-text border border-adk-border' 
                : 'text-adk-textMuted hover:bg-adk-card/50 hover:text-adk-text'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">{session.title}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-adk-border space-y-2">
         <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-adk-textMuted hover:text-adk-text hover:bg-adk-card rounded-md transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
        </button>
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-adk-textMuted hover:text-adk-text hover:bg-adk-card rounded-md transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <div className="pt-2 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                JS
            </div>
            <div className="text-xs">
                <div className="font-medium text-adk-text">Jane Smith</div>
                <div className="text-adk-textMuted">Pro Plan</div>
            </div>
        </div>
      </div>
    </aside>
  );
};
