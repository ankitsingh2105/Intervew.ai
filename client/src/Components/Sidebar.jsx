import React from 'react';
import { ChevronRight, ChevronLeft, FileText, ClipboardList, StickyNote, Settings } from 'lucide-react';

const sidebarOptions = [
  { label: 'Upload Resume', icon: FileText, color: "text-red-500" },
  { label: 'Job-Description', icon: ClipboardList, color: "text-yellow-500" },
  { label: 'My Interviews', icon: StickyNote, color: "text-blue-500" },
  { label: 'Settings', icon: Settings, color: "text-purple-500" },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, onOptionClick }) => {
  return (
    <aside
      className={`sticky top-0 flex h-[90vh] flex-col justify-between z-10 shadow-xl transition-all duration-300 border-r
        ${sidebarOpen ? 'w-60 px-6' : 'w-20 px-4'}
        bg-white dark:bg-black border-gray-200 dark:border-gray-800 py-10 gap-6
      `}
    >
      <nav className="flex flex-col gap-4">
        {sidebarOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.label}
              className={`mb-5 flex items-center py-1 rounded-lg text-gray-700 
                
                dark:text-white transition-all font-medium text-sm font-bold  dark:border-gray-800 w-full ${sidebarOpen ? 'px-2 justify-start gap-3' : 'px-3.5 justify-center'}`}
              onClick={() => onOptionClick(opt.label)}
            >
              <Icon className={`w-5 h-5 ${opt.color}`} strokeWidth={2.5} />
              <span
                className={`overflow-hidden transition-all duration-300 whitespace-nowrap
                  ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}
                `}
                style={{ display: 'inline-block' }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen((open) => !open)}
        className="flex items-center justify-center mx-auto mt-8 mb-2 p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors border border-gray-300 dark:border-gray-700"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ?
          <ChevronLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" /> :
          <ChevronRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        }
      </button>
    </aside>
  );
};

export default Sidebar; 