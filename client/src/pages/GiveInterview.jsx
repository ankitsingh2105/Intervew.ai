import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Briefcase, 
  Settings, 
  Play,
  Upload,
  Save,
  User,
  Target,
  Clock,
  MessageSquare,
  Zap,
  Star
} from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import InterviewCard from '../Components/InterviewCard';
import ResumeModal from '../Components/ResumeModal';
import { parseResume } from '../utils/resumeParser';
import {
  roles,
  seniority,
  techStack,
  interviewTypes,
  companies,
  difficulty,
  modes,
  durations,
  feedbackTypes,
} from '../data/interviewOptions';

const GiveInterview = () => {
  const navigate = useNavigate();

  // Sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for selections
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSeniority, setSelectedSeniority] = useState(null);
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOption, setModalOption] = useState(null);

  // Resume and Job Description state - store files temporarily
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [parsedResume, setParsedResume] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // Saved data state
  const [savedResumeText, setSavedResumeText] = useState('');
  const [savedJobDescriptionText, setSavedJobDescriptionText] = useState('');

  // Toggle for multi-select tech stack
  const toggleTechStack = (tech) => {
    setSelectedTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  // Handle file upload - just store the file, don't parse immediately
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only.', { autoClose: 1000 });
        return;
      }
      setResumeFile(file);
      toast.success(` Resume uploaded successfully!`, {
        position: "top-right",
        autoClose: 1000
      });
      setModalOpen(false);
      setModalOption(null);
    }
  };

  // Save job description function
  const handleSaveJobDescription = () => {
    if (jobDescription.trim()) {
      setSavedJobDescriptionText(jobDescription);
      toast.success('Job description added', {
        position: "top-right",
        autoClose: 1000,
      });
      setModalOpen(false);
      setModalOption(null);
      // Reset modal state
      setJobDescription('');
    } else {
      toast.error('Please enter a job description', { autoClose: 1000 });
    }
  };

  // Handle start interview - send raw resume file to backend for parsing
  const handleStartInterview = async () => {
    // Console log the current state values
   

    // Only show a warning if literally nothing is selected
    if (
      !selectedRole &&
      !selectedSeniority &&
      !selectedInterviewType &&
      (!selectedTechStack || selectedTechStack.length === 0) &&
      !selectedCompany &&
      !selectedDifficulty &&
      !selectedMode &&
      !selectedDuration &&
      !selectedFeedbackType &&
      !savedJobDescriptionText
    ) {
      toast.error('❌ Please select at least one field before starting.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    console.log('✅ At least one field is selected!');

    try {
      toast.info('🚀 Preparing your interview...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Create FormData to send file and JSON data together
      const formData = new FormData();

      // Add the resume file if uploaded
      if (resumeFile) {
        formData.append('resume', resumeFile);
        console.log('📎 Resume file attached:', resumeFile.name);
      }

      // Add all the interview selections as JSON
      const interviewData = {
        role: selectedRole,
        seniority: selectedSeniority,
        techStack: selectedTechStack,
        interviewType: selectedInterviewType,
        company: selectedCompany,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        duration: selectedDuration,
        feedbackType: selectedFeedbackType,
        jobDescriptionText: savedJobDescriptionText,
      };

      formData.append('interviewData', JSON.stringify(interviewData));

      console.log('Sending to backend:', {
        resumeFile: resumeFile ? resumeFile.name : 'No file',
        interviewData: interviewData
      });

      const response = await axios.post('http://localhost:5010/api/interview/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Interview started successfully:', response.data);
      toast.success('🎉 Interview started successfully! Good luck! 🍀', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Navigate to interview page with the interview data
      navigate('/interview', {
        state: {
          interviewData: interviewData,
          resumeFile: resumeFile,
          sessionId: response.data.sessionId || Date.now().toString()
        }
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('❌ Error starting interview. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // Handle sidebar option click
  const handleSidebarOptionClick = (option) => {
    setModalOpen(true);
    setModalOption(option);
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-16">
      {/* Sidebar */}
      {/* Modal */}
      <ResumeModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalOption={modalOption}
        resumeFile={resumeFile}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        parsedResume={parsedResume}
        isParsing={isParsing}
        handleFileUpload={handleFileUpload}
        handleSaveJobDescription={handleSaveJobDescription}
      />

      <section className="flex h-[calc(100vh-4rem)] bg-white dark:bg-black">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOptionClick={handleSidebarOptionClick}
        />

        {/* Main Content */}
        <div className={`bg-white dark:bg-black text-black dark:text-white transition-all duration-300 flex-1 overflow-y-auto ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>

          {/* Header (Sticky) */}
          <div className="border-t bg-white dark:bg-black sticky top-0 z-10 p-6 shadow-lg border-gray-200 dark:border-gray-800">

            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-black dark:text-white animate-[spin_3s_linear_infinite]" strokeWidth={2.5} />
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white">
                  Configure Your Interview
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Customize your interview experience by selecting your preferences below
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-8 bg-white dark:bg-black">
            <div className="scroll-m-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InterviewCard title="Role / Job Track" index={0}>
                <div className="flex flex-wrap gap-3">
                  {roles.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedRole === role
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Seniority Level" index={1}>
                <div className="flex flex-wrap gap-3">
                  {seniority.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedSeniority(level)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedSeniority === level
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Tech Stack / Focus Area (Multi-select)" index={2}>
                <div className="flex flex-wrap gap-3">
                  {techStack.map(tech => (
                    <button
                      key={tech}
                      onClick={() => toggleTechStack(tech)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedTechStack.includes(tech)
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Interview Type" index={3}>
                <div className="flex flex-wrap gap-3">
                  {interviewTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedInterviewType(type)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedInterviewType === type
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Company Target" index={4}>
                <select
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                >
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </InterviewCard>

              <InterviewCard title="Difficulty Level" index={5}>
                <div className="flex flex-wrap gap-3">
                  {difficulty.map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedDifficulty === diff
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Mode" index={6}>
                <div className="flex flex-wrap gap-3">
                  {modes.map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedMode === mode
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Duration" index={7}>
                <div className="flex flex-wrap gap-3">
                  {durations.map(dur => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedDuration === dur
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Feedback Type" index={8}>
                <div className="flex flex-wrap gap-3">
                  {feedbackTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedFeedbackType(type)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedFeedbackType === type
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/25 dark:shadow-white/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </InterviewCard>
            </div>

            {/* Floating Start Interview Button */}
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={handleStartInterview}
                className="bg-white text-black text-lg font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Play className="w-5 h-5" strokeWidth={2.5} />
                Start
              </button>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};

export default GiveInterview;
