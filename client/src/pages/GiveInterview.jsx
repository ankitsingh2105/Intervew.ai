import React, { useState } from 'react';
import {
  FileText,
  ClipboardList,
  Languages,
  StickyNote,
  Settings,
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

const sidebarOptions = [
  { label: 'Resume based', icon: FileText },
  { label: 'Job-Based', icon: ClipboardList },
  { label: 'Preferred Language', icon: Languages },
  { label: 'My Interviews', icon: StickyNote },
  { label: 'Settings', icon: Settings },
];

const roles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'QA Engineer', 'System Design Engineer', 'AI/ML Engineer',
];
const seniority = [
  'Intern', 'Entry-Level', 'SDE 1', 'SDE 2', 'SDE 3 / Senior', 'Staff Engineer / Lead', 'Engineering Manager',
];
const techStack = [
  'React.js', 'Node.js', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Python', 'SQL', 'System Design', 'DSA', 'API Design', 'Microservices', 'Cloud / DevOps',
];
const interviewTypes = [
  'DSA / Algorithm', 'System Design', 'Low-Level Design', 'Behavioral', 'Resume Deep Dive', 'Project Discussion', 'Tech Stack Check', 'Take-Home Assignment',
];
const companies = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Startup', 'MNC',
];
const difficulty = [
  'Beginner', 'Intermediate', 'Advanced', 'Brutal (FAANG bar)',
];
const modes = [
  'Instant AI Interview', 'Scheduled with Expert',
];
const durations = [
  '15 mins', '30 mins', '45 mins', '60 mins',
];
const feedbackTypes = [
  'Score-based', 'Detailed Explanation', 'Audio Summary',
];

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

const Card = ({ title, children }) => {
  const Icon = cardIcons[title];
  return (
    <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-7 flex flex-col gap-3 transition-colors duration-300 hover:shadow-2xl border border-white-100 dark:border-white-800">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const GiveInterview = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSeniority, setSelectedSeniority] = useState(null);
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);

  const toggleTechStack = (tech) => {
    setSelectedTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  return (
    <div className="mt-10 flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Sidebar */}
      <aside className="sticky top-0 w-72 h-screen bg-white/80 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 flex flex-col py-10 px-6 gap-6 z-10 shadow-xl">
        <nav className="flex flex-col gap-4">
          {sidebarOptions.map(opt => (
            <button
              key={opt.label}
              className="mt-5 flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors font-medium text-base shadow-sm"
            >
              <opt.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              {opt.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-0">
        <Card title="Role / Job Track">
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedRole === role
                    ? 'bg-pink-600 text-white border-pink-600 dark:bg-pink-400 dark:text-black dark:border-pink-400 shadow-md'
                    : 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-200 hover:bg-pink-100 dark:hover:bg-pink-800 border-pink-200 dark:border-pink-700'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Seniority Level">
          <div className="flex flex-wrap gap-2">
            {seniority.map(level => (
              <button
                key={level}
                onClick={() => setSelectedSeniority(level)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedSeniority === level
                    ? 'bg-yellow-600 text-white border-yellow-600 dark:bg-yellow-400 dark:text-black dark:border-yellow-400 shadow-md'
                    : 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-800 border-yellow-200 dark:border-yellow-700'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Tech Stack / Focus Area (Multi-select)">
          <div className="flex flex-wrap gap-2">
            {techStack.map(tech => (
              <button
                key={tech}
                onClick={() => toggleTechStack(tech)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedTechStack.includes(tech)
                    ? 'bg-green-600 text-white border-green-600 dark:bg-green-400 dark:text-black dark:border-green-400 shadow-md'
                    : 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800 border-green-200 dark:border-green-700'}`}
              >
                {tech}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Interview Type">
          <div className="flex flex-wrap gap-2">
            {interviewTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedInterviewType(type)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedInterviewType === type
                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-400 dark:text-black dark:border-blue-400 shadow-md'
                    : 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 border-blue-200 dark:border-blue-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Company Target">
          <select
            className="w-full mt-2 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
          >
            <option value="">Select Company</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>

        <Card title="Difficulty Level">
          <div className="flex flex-wrap gap-2">
            {difficulty.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedDifficulty === diff
                    ? 'bg-purple-600 text-white border-purple-600 dark:bg-purple-400 dark:text-black dark:border-purple-400 shadow-md'
                    : 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800 border-purple-200 dark:border-purple-700'}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Mode">
          <div className="flex flex-wrap gap-2">
            {modes.map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedMode === mode
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-400 dark:text-black dark:border-indigo-400 shadow-md'
                    : 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 border-indigo-200 dark:border-indigo-700'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Duration">
          <div className="flex flex-wrap gap-2">
            {durations.map(dur => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedDuration === dur
                    ? 'bg-gray-700 text-white border-gray-700 dark:bg-gray-200 dark:text-black dark:border-gray-200 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'}`}
              >
                {dur}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Feedback Type">
          <div className="flex flex-wrap gap-2">
            {feedbackTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedFeedbackType(type)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors
                  ${selectedFeedbackType === type
                    ? 'bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-400 dark:text-black dark:border-cyan-400 shadow-md'
                    : 'bg-cyan-50 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-800 border-cyan-200 dark:border-cyan-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        {/* Floating Start Interview Button */}
        <button
          className="fixed bottom-12 right-12 z-50 px-2 py-4 rounded-full bg-red-200 text-white text-lg font-bold shadow-2xl hover:bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-500 "
        >
          Start
        </button>
      </main>
    </div>
  );
};

export default GiveInterview;
