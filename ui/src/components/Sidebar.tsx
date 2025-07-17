import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

interface ResearchSession {
  id: string;
  companyName: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
  summary?: string;
}

interface SidebarProps {
  onSelectResearch: (researchId: string) => void;
  onNewResearch: () => void;
  currentResearchId?: string;
  glassStyle: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSelectResearch,
  onNewResearch,
  currentResearchId,
  glassStyle
}) => {
  const [researchSessions, setResearchSessions] = useState<ResearchSession[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load saved research sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('researchSessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setResearchSessions(sessions);
      } catch (error) {
        console.error('Error loading research sessions:', error);
      }
    }
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get status color
  const getStatusColor = (status: ResearchSession['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: ResearchSession['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '⟳';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  return (
    <>
      {/* Expanded Sidebar */}
      <AnimatePresence>
        {isExpanded && (
                      <motion.div
              initial={{ x: -310 }}
              animate={{ x: 0 }}
              exit={{ x: -310 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50"
              style={{ width: '280px' }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold text-gray-900">IntelCraft</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* New Research Button */}
            <div className="p-3">
              <button
                onClick={onNewResearch}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-3 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Research</span>
              </button>
            </div>

            {/* Research Sessions */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <div className="mb-3">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Recent Research</h3>
              </div>
              
              {researchSessions.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">No research sessions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start your first research to see it here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {researchSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`group relative p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentResearchId === session.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => onSelectResearch(session.id)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${getStatusColor(session.status)}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-medium text-gray-900 truncate">
                              {session.companyName}
                            </h4>
                            <span className={`text-xs ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(session.timestamp)}
                          </p>
                          {session.summary && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {session.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Sidebar */}
      <AnimatePresence>
        {!isExpanded && (
                     <motion.div
             initial={{ x: -80 }}
             animate={{ x: 0 }}
             exit={{ x: -80 }}
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="fixed left-0 top-0 h-full w-18 bg-white border-r border-gray-200 shadow-lg z-50"
           >
            {/* Header */}
            <div className="flex flex-col items-center p-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* New Research Button */}
            <div className="p-3">
              <button
                onClick={onNewResearch}
                className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-lg transition-all duration-200"
                title="New Research"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Empty space when collapsed - no research sessions shown */}
            <div className="flex-1"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 