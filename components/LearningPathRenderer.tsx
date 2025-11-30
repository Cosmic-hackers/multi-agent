import React from 'react';
import { LearningPath } from '../types';
import { Map, Flag, Clock, BookOpen } from 'lucide-react';

interface LearningPathRendererProps {
  path: LearningPath;
}

export const LearningPathRenderer: React.FC<LearningPathRendererProps> = ({ path }) => {
  if (!path || !path.milestones) return null;

  return (
    <div className="mt-8 border border-adk-border rounded-xl overflow-hidden bg-adk-bg shadow-2xl">
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-6 border-b border-adk-border">
         <div className="flex items-center space-x-2 text-amber-500 mb-2">
            <Map className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Structured Learning Path</span>
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">{path.topic}</h2>
         <p className="text-adk-textMuted text-sm">{path.overview}</p>
      </div>

      <div className="p-6 relative">
         <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-adk-border"></div>
         
         <div className="space-y-8">
            {path.milestones.map((milestone, idx) => (
                <div key={idx} className="relative pl-12">
                   <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-adk-card border-2 border-amber-500 z-10 flex items-center justify-center text-[10px] font-bold text-amber-500">
                      {idx + 1}
                   </div>
                   
                   <div className="bg-adk-card border border-adk-border rounded-lg p-4 hover:border-amber-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-adk-text">{milestone.title}</h3>
                         <div className="flex items-center space-x-1 text-xs text-adk-textMuted bg-black/20 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{milestone.duration}</span>
                         </div>
                      </div>
                      <p className="text-sm text-adk-textMuted mb-4">{milestone.description}</p>
                      
                      {milestone.resources && milestone.resources.length > 0 && (
                          <div className="space-y-2">
                             <div className="text-xs font-semibold text-adk-text uppercase">Recommended Resources</div>
                             <div className="grid gap-2">
                                {milestone.resources.map((res, rIdx) => (
                                    <div key={rIdx} className="flex items-center space-x-2 text-xs text-blue-400">
                                       <BookOpen className="w-3 h-3" />
                                       <span>{res}</span>
                                    </div>
                                ))}
                             </div>
                          </div>
                      )}
                   </div>
                </div>
            ))}
            
            <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-amber-500 z-10 flex items-center justify-center text-black">
                   <Flag className="w-3 h-3 fill-current" />
                </div>
                <div className="text-sm text-adk-textMuted pt-0.5">Goal Achieved</div>
            </div>
         </div>
      </div>
    </div>
  );
};
