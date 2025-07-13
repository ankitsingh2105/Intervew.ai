import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        toast.error('Please upload a PDF file only.');
        return;
      }
      setResumeFile(file);
      toast.success(`Resume "${file.name}" uploaded successfully!`);
      setModalOpen(false);
      setModalOption(null);
    }
  };

  // Save job description function
  const handleSaveJobDescription = () => {
    if (jobDescription.trim()) {
      setSavedJobDescriptionText(jobDescription);
      toast.success('Job description saved successfully!');
      setModalOpen(false);
      setModalOption(null);
      // Reset modal state
      setJobDescription('');
    }
  };

  // Handle start interview - send raw resume file to backend for parsing
  const handleStartInterview = async () => {
    // Console log the current state values
    console.log('=== CURRENT SELECTIONS ===');
    console.log('selectedRole:', selectedRole);
    console.log('selectedSeniority:', selectedSeniority);
    console.log('selectedInterviewType:', selectedInterviewType);
    console.log('selectedTechStack:', selectedTechStack);
    console.log('selectedCompany:', selectedCompany);
    console.log('selectedDifficulty:', selectedDifficulty);
    console.log('selectedMode:', selectedMode);
    console.log('selectedDuration:', selectedDuration);
    console.log('selectedFeedbackType:', selectedFeedbackType);
    console.log('========================');

    // Check if required fields are selected
    if (!selectedRole || !selectedSeniority || !selectedInterviewType) {
      console.log('❌ Missing required fields:');
      console.log('  - selectedRole:', selectedRole ? '✅ Selected' : '❌ Not selected');
      console.log('  - selectedSeniority:', selectedSeniority ? '✅ Selected' : '❌ Not selected');
      console.log('  - selectedInterviewType:', selectedInterviewType ? '✅ Selected' : '❌ Not selected');
      toast.error('Please select Role, Seniority Level, and Interview Type before starting.');
      return;
    }

    console.log('✅ All required fields are selected!');

    try {
      toast.info('Starting interview...');

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

      const response = await axios.post('http://localhost:5000/api/interview/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Interview started successfully:', response.data);
      toast.success('Interview started successfully!');

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
      toast.error('Error starting interview. Please try again.');
    }
  };

  // Handle sidebar option click
  const handleSidebarOptionClick = (option) => {
    setModalOpen(true);
    setModalOption(option);
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300 pt-16">
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

      <section className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOptionClick={handleSidebarOptionClick}
        />

        {/* Main Content */}
        <div className={`transition-all duration-300 flex-1 overflow-y-auto ${sidebarOpen ? 'ml-30' : 'ml-20'}`}>
          {/* Header (Sticky) */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black p-6 ">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-violet-600 bg-clip-text text-transparent">
              Configure Your Interview
            </h1>
            <p className="text-gray-400 mt-2">
              Customize your interview experience by selecting your preferences below
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="p-8">
            <div className="scroll-m-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InterviewCard title="Role / Job Track" index={0}>
                <div className="flex flex-wrap gap-3">
                  {roles.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedRole === role
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-lg shadow-pink-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500 shadow-lg shadow-yellow-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
                    `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </InterviewCard>

              <InterviewCard title="Company Target" index={4}>
                <select
                  className="w-full p-4 rounded-xl border-2 border-gray-600 dark:border-gray-600 bg-gray-800/50 dark:bg-gray-800/30 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-600 shadow-lg shadow-gray-600/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/25'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/30 border-gray-300 dark:border-gray-600'}
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
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
              >
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
