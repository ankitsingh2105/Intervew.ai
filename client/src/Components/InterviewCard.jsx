import React from 'react';
import {
  User,
  Layers,
  Code2,
  Briefcase,
  Building2,
  BarChart3,
  Clock3,
  MessageCircle,
  PlayCircle,
} from 'lucide-react';

const cardIcons = {
  'Role / Job Track': User,
  'Seniority Level': Layers,
  'Tech Stack / Focus Area (Multi-select)': Code2,
  'Interview Type': Briefcase,
  'Company Target': Building2,
  'Difficulty Level': BarChart3,
  'Mode': PlayCircle,
  'Duration': Clock3,
  'Feedback Type': MessageCircle,
};

const cardBgPalette = [
  'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30',
  'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/30',
  'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/30',
  'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/30',
  'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30',
  'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/40 dark:to-pink-800/30',
  'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/30',
  'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30',
];

const InterviewCard = ({ title, children, index = 0 }) => {
  const Icon = cardIcons[title];
  const bgClass = cardBgPalette[index % cardBgPalette.length];
  
  const headingGradients = [
    'bg-gradient-to-r from-blue-700 to-sky-400',
    'bg-gradient-to-r from-violet-700 to-fuchsia-400',
    'bg-gradient-to-r from-cyan-700 to-teal-400',
    'bg-gradient-to-r from-teal-700 to-emerald-400',
    'bg-gradient-to-r from-emerald-700 to-lime-400',
    'bg-gradient-to-r from-pink-700 to-rose-400',
    'bg-gradient-to-r from-orange-700 to-amber-400',
    'bg-gradient-to-r from-gray-700 to-gray-400',
  ];
  const headingClass = headingGradients[index % headingGradients.length];

  return (
    <div className={`bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:border-blue-500/30`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-3 bg-blue-100 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
            <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          </div>
        )}
        <h3 className={`text-xl font-bold bg-clip-text text-transparent tracking-tight ${headingClass}`}>
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default InterviewCard; 