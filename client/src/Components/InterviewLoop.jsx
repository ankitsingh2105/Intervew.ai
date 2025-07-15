import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { speak } from "../utils/speak";

export default function InterviewLoop({ interviewData: propInterviewData, resumeFile, sessionId: propSessionId }) {
  // Always use interviewData from localStorage if available, else from props
  const [interviewData, setInterviewData] = useState(() => {
    const stored = localStorage.getItem('interviewData');
    if (stored) return JSON.parse(stored);
    if (propInterviewData) {
      localStorage.setItem('interviewData', JSON.stringify(propInterviewData));
      return propInterviewData;
    }
    return null;
  });

  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [cameraPermission, setCameraPermission] = useState('requesting');
  const [userVideoStream, setUserVideoStream] = useState(null);
  const chatEndRef = useRef(null);
  const userVideoRef = useRef(null);

  const { transcript, listening, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: async (text) => {
      console.log("User answered:", text);
      stopListening();
      const newHistory = [...history, { role: "user", content: text }];
      setHistory(newHistory);
      setIsAIResponding(true);

      // Ensure resumeText is present
      if (!interviewData || !interviewData.resumeText) {
        console.warn('Warning: resumeText missing from interviewData. AI will not have resume context.');
      }

      try {
        const response = await axios.post("http://localhost:5010/api/interview/process", {
          answer: text,
          history: newHistory,
          interviewData, // always defined from state/localStorage, should include resumeText
          sessionId: propSessionId
        });

        const { reply } = response.data;
        setHistory((h) => [...h, { role: "assistant", content: reply }]);

        speak(reply, () => {
          resetTranscript();
          setIsAIResponding(false);
          startListening(); // continue loop
        });
      } catch (error) {
        console.error('Error getting AI response:', error);
        setIsAIResponding(false);
      }
    },
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Request camera permission and start interview automatically
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setUserVideoStream(stream);
        setCameraPermission('granted');
        
        // Start the interview automatically
        await startInterview();
      } catch (error) {
        console.error('Camera permission denied or error:', error);
        setCameraPermission('denied');
        // Still start the interview without camera
        await startInterview();
      }
    };

    initializeInterview();
  }, []);

  // Set video stream when video ref is available
  useEffect(() => {
    if (userVideoRef.current && userVideoStream) {
      userVideoRef.current.srcObject = userVideoStream;
    }
  }, [userVideoStream, userVideoRef.current]);

  const startInterview = async () => {
    setIsStarting(true);
    
    // Create initial prompt based on interview data
    let initialPrompt = "Welcome to interview.ai. Let's begin your mock interview. ";
    
    if (interviewData) {
      initialPrompt += `You are conducting a ${interviewData.interviewType} interview for a ${interviewData.seniority} ${interviewData.role} position`;
      
      if (interviewData.company) {
        initialPrompt += ` at ${interviewData.company}`;
      }
      
      if (interviewData.techStack.length > 0) {
        initialPrompt += `. Focus areas include: ${interviewData.techStack.join(', ')}`;
      }
      
      if (interviewData.difficulty) {
        initialPrompt += `. Interview difficulty: ${interviewData.difficulty}`;
      }
      
      initialPrompt += ". Ask relevant questions based on the candidate's role and experience level. Tell me about yourself.";
    } else {
      initialPrompt += "Tell me about yourself.";
    }

    speak(initialPrompt, () => {
      setStarted(true);
      setIsStarting(false);
      startListening();
    });
  };

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (userVideoStream) {
        userVideoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userVideoStream]);

  return (
    <div className="h-full">
      {!started ? (
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {isStarting ? 'Initializing Interview...' : 'Ready to Start Your Interview?'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {isStarting ? (
                <>
                  {cameraPermission === 'requesting' && 'Requesting camera permissions...'}
                  {cameraPermission === 'granted' && 'Camera access granted! Starting interview...'}
                  {cameraPermission === 'denied' && 'Camera access denied. Starting audio-only interview...'}
                </>
              ) : (
                interviewData ? (
                  <>
                    You'll be interviewed for a <span className="font-semibold text-gray-900 dark:text-white">{interviewData.seniority} {interviewData.role}</span> position
                    {interviewData.company && <span> at <span className="font-semibold text-gray-700 dark:text-gray-300">{interviewData.company}</span></span>}
                    {interviewData.techStack.length > 0 && (
                      <span> focusing on <span className="font-semibold text-gray-700 dark:text-gray-300">{interviewData.techStack.join(', ')}</span></span>
                    )}
                  </>
                ) : (
                  "Get ready for a comprehensive mock interview experience"
                )
              )}
            </p>
          </div>
          
          {isStarting && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                {cameraPermission === 'requesting' && 'Requesting camera access...'}
                {cameraPermission === 'granted' && 'Starting interview...'}
                {cameraPermission === 'denied' && 'Starting audio interview...'}
              </span>
            </div>
          )}
          
          {!isStarting && (
            <button 
              onClick={startInterview}
              className="relative group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-black dark:bg-white text-white dark:text-black shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Start Interview</span>
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-pulse"></div>
              </div>
            </button>
          )}
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span>Voice Recognition</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span>AI Questions</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span>Real-time Feedback</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Video Call Style Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* AI Interviewer Window */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-slate-300 dark:border-gray-700 overflow-hidden shadow-lg">
              <div className="h-full flex flex-col">
                {/* AI Header */}
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Interviewer</h3>
                    </div>
                  </div>
                </div>

                {/* AI Video Area */}
                <div className="flex-1 flex items-center justify-center p-6 relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    {isAIResponding ? (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Window */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-slate-300 dark:border-gray-700 overflow-hidden shadow-lg">
              <div className="h-full flex flex-col">
                {/* User Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">You</h3>
                    </div>
                  </div>
                </div>

                {/* User Video Area */}
                <div className="flex-1 flex items-center justify-center p-6 relative">
                  {cameraPermission === 'granted' && userVideoStream ? (
                    <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
                      <video
                        ref={userVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {listening && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-green-500/90 rounded-full p-4">
                            <div className="flex gap-1">
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse"></div>
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-green-300 dark:border-gray-600 flex items-center justify-center">
                      {listening ? (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="flex gap-1">
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse"></div>
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat History */}
        </div>
      )}
    </div>
  );
}
