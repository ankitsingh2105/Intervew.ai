import React from 'react';
import { ChevronRight, ChevronLeft, FileText, ClipboardList, StickyNote, Settings } from 'lucide-react';

const sidebarOptions = [
  { label: 'Upload Resume', icon: FileText },
  { label: 'Job-Description', icon: ClipboardList },
  { label: 'My Interviews', icon: StickyNote },
  { label: 'Settings', icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, onOptionClick }) => {
  return (
    <aside
      className={`sticky top-0 flex h-[90vh] flex-col justify-between z-10 shadow-xl transition-all duration-300
        ${sidebarOpen ? 'w-60 px-6' : 'w-20 px-4'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 py-10 gap-6
      `}
    >
      <nav className="flex flex-col gap-4">
        {sidebarOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.label}
              className={`mb-5 flex items-center py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all font-medium text-sm shadow border border-gray-200 dark:border-gray-800 w-full ${sidebarOpen ? 'px-2 justify-start gap-3' : 'px-3.5 justify-center'}`}
              onClick={() => onOptionClick(opt.label)}
            >
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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