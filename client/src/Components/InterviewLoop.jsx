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
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [cameraPermission, setCameraPermission] = useState('requesting');
  const [userVideoStream, setUserVideoStream] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const userVideoRef = useRef(null);
  const timerInterval = useRef(null);

  const { listening, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: async (text) => {
      stopListening();
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
        if (response.data.finished) {
          setInterviewComplete(true);
          setRemaining(0);
          setIsAIResponding(false);
          return;
        }
        setRemaining(response.data.remaining);
        speak(response.data.reply, () => {
          resetTranscript();
          setIsAIResponding(false);
          startListening();
        });
      } catch (error) {
        setIsAIResponding(false);
      }
    },
  });

  // Timer display
  useEffect(() => {
    if (remaining === null || interviewComplete) return;
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, [remaining, interviewComplete]);

  // Request camera permission and start interview after video is set
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setUserVideoStream(stream);
        setCameraPermission('granted');
      } catch (error) {
        setCameraPermission('denied');
      }
    };
    initializeInterview();
  }, []);

  // Set video stream when video ref is available, then start interview
  useEffect(() => {
    if (userVideoRef.current && userVideoStream && !sessionId) {
      userVideoRef.current.srcObject = userVideoStream;
      startInterview();
    }
  }, [userVideoStream, userVideoRef.current]);

  const startInterview = async () => {
    setIsStarting(true);
    try {
      const formData = new FormData();
      formData.append('interviewData', JSON.stringify(propInterviewData));
      if (resumeFile) formData.append('resume', resumeFile);
      const response = await axios.post("http://localhost:5000/api/interview/start", formData);
      setSessionId(response.data.sessionId);
      setRemaining(response.data.duration);
      setIsStarting(false);
      setStarted(true);
      // Only speak after video is set and session is started
      let initialPrompt = "Welcome to interview.ai. Let's begin your mock interview. ";
      if (propInterviewData) {
        initialPrompt += `You are conducting a ${propInterviewData.interviewType} interview for a ${propInterviewData.seniority} ${propInterviewData.role} position`;
        if (propInterviewData.company) initialPrompt += ` at ${propInterviewData.company}`;
        if (propInterviewData.techStack && propInterviewData.techStack.length > 0) initialPrompt += `. Focus areas include: ${propInterviewData.techStack.join(', ')}`;
        if (propInterviewData.difficulty) initialPrompt += `. Interview difficulty: ${propInterviewData.difficulty}`;
        initialPrompt += ". Ask relevant questions based on the candidate's role and experience level. Tell me about yourself.";
      } else {
        initialPrompt += "Tell me about yourself.";
      }
      speak(initialPrompt, () => {
        startListening();
      });
    } catch (error) {
      setIsStarting(false);
    }
  };

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (userVideoStream) {
        userVideoStream.getTracks().forEach(track => track.stop());
      }
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [userVideoStream]);

  // Timer display helper
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
                propInterviewData ? (
                  <>
                    You'll be interviewed for a <span className="font-semibold text-gray-900 dark:text-white">{propInterviewData.seniority} {propInterviewData.role}</span> position
                    {propInterviewData.company && <span> at <span className="font-semibold text-gray-700 dark:text-gray-300">{propInterviewData.company}</span></span>}
                    {propInterviewData.techStack && propInterviewData.techStack.length > 0 && (
                      <span> focusing on <span className="font-semibold text-gray-700 dark:text-gray-300">{propInterviewData.techStack.join(', ')}</span></span>
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
        </div>
      ) : interviewComplete ? (
        <div className="flex flex-col items-center justify-center h-full py-24">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Interview Complete</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Thank you for participating in the mock interview!</p>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Timer */}
          <div className="flex justify-center items-center py-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl shadow">
              Time Remaining: {formatTime(remaining || 0)}
            </span>
          </div>
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
