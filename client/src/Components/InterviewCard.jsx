import React from 'react';
import { 
  Target, 
  BarChart3, 
  Zap, 
  Mic, 
  Building2, 
  TrendingUp, 
  Gamepad2, 
  Clock, 
  MessageSquare 
} from 'lucide-react';

const InterviewCard = ({ title, children, index }) => {
  const gradients = [
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
  ];

  const titleGradients = [
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
    'bg-gradient-to-r from-gray-700 to-gray-600',
  ];

  const iconColors = [
    'text-red-500',    // Role / Job Track - Red
    'text-blue-500',   // Seniority Level - Blue
    'text-yellow-500', // Tech Stack - Yellow
    'text-red-500',    // Interview Type - Red
    'text-blue-500',   // Company Target - Blue
    'text-yellow-500', // Difficulty Level - Yellow
    'text-red-500',    // Mode - Red
    'text-blue-500',   // Duration - Blue
    'text-yellow-500'  // Feedback Type - Yellow
  ];

  const icons = [
    <Target className={`w-6 h-6 ${iconColors[0]}`} strokeWidth={2.5} />,
    <BarChart3 className={`w-6 h-6 ${iconColors[1]}`} strokeWidth={2.5} />,
    <Zap className={`w-6 h-6 ${iconColors[2]}`} strokeWidth={2.5} />,
    <Mic className={`w-6 h-6 ${iconColors[3]}`} strokeWidth={2.5} />,
    <Building2 className={`w-6 h-6 ${iconColors[4]}`} strokeWidth={2.5} />,
    <TrendingUp className={`w-6 h-6 ${iconColors[5]}`} strokeWidth={2.5} />,
    <Gamepad2 className={`w-6 h-6 ${iconColors[6]}`} strokeWidth={2.5} />,
    <Clock className={`w-6 h-6 ${iconColors[7]}`} strokeWidth={2.5} />,
    <MessageSquare className={`w-6 h-6 ${iconColors[8]}`} strokeWidth={2.5} />
  ];

  return (
    <div className={`${gradients[index]} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl">
          {icons[index]}
        </div>
        <h3 className={`text-lg font-bold bg-clip-text text-transparent ${titleGradients[index]} bg-clip-text text-transparent`}>
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default InterviewCard; 