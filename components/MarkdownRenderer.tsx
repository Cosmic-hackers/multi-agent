import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AGENTS } from '../constants';
import { Search, ShieldAlert, FileText, Map, Brain } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const AgentHeader: React.FC<{ title: string }> = ({ title }) => {
  // Parse title to find agent. e.g. "### 🕵️ Researcher"
  let agentConfig = AGENTS.ORCHESTRATOR;
  let cleanTitle = title.replace(/###|🤖|🕵️|⚖️|📝|🎓/g, '').trim();

  if (title.includes("Researcher")) agentConfig = AGENTS.RESEARCHER;
  if (title.includes("Critic")) agentConfig = AGENTS.CRITIC;
  if (title.includes("Summarizer")) agentConfig = AGENTS.SUMMARIZER;
  if (title.includes("Learning Path")) agentConfig = AGENTS.LEARNING_PATH;

  const Icon = () => {
      switch(agentConfig.id) {
          case 'researcher': return <Search className="w-4 h-4" />;
          case 'critic': return <ShieldAlert className="w-4 h-4" />;
          case 'summarizer': return <FileText className="w-4 h-4" />;
          case 'learning_path': return <Map className="w-4 h-4" />;
          default: return <Brain className="w-4 h-4" />;
      }
  }

  return (
    <div className="flex items-center space-x-2 my-4 py-2 border-b border-adk-border text-sm font-semibold uppercase tracking-wider" style={{ color: agentConfig.color }}>
      <Icon />
      <span>{cleanTitle}</span>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({ node, ...props }) => {
            // Check if this H3 matches our agent pattern
            const text = props.children?.toString() || '';
            if (text.includes("Researcher") || text.includes("Critic") || text.includes("Summarizer") || text.includes("Learning Path")) {
                return <AgentHeader title={text} />;
            }
            return <h3 className="text-lg font-bold mt-4 mb-2 text-adk-text" {...props} />;
        },
        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-adk-text" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return isInline ? (
            <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono text-adk-accent" {...props}>
              {children}
            </code>
          ) : (
            <div className="relative group">
                <div className="absolute top-2 right-2 text-xs text-gray-500">{match?.[1]}</div>
                <code className={`block bg-black/50 p-4 rounded-md overflow-x-auto text-sm font-mono my-4 ${className}`} {...props}>
                {children}
                </code>
            </div>
          );
        },
        a: ({ node, ...props }) => <a className="text-adk-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-adk-border pl-4 italic text-adk-textMuted my-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
