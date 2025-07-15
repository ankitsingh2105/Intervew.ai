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
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const [timerInterval, setTimerInterval] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);

  // Set default interview duration (15 minutes)
  const DEFAULT_DURATION = 15 * 60; // 15 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);

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
          interviewData, // always defined from state/localStorage, should includ resumeText
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

  // Timer effect: countdown from 15:00
  useEffect(() => {
    if (interviewStarted && !interviewEnded && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && interviewStarted && !interviewEnded) {
      handleEndInterview();
    }
  }, [interviewStarted, interviewEnded, timeLeft]);

  // Fullscreen logic
  const interviewRef = useRef(null);
  const handleFullscreen = () => {
    if (!isFullscreen && interviewRef.current) {
      if (interviewRef.current.requestFullscreen) {
        interviewRef.current.requestFullscreen();
      } else if (interviewRef.current.webkitRequestFullscreen) {
        interviewRef.current.webkitRequestFullscreen();
      } else if (interviewRef.current.msRequestFullscreen) {
        interviewRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // End interview logic
  const handleEndInterview = () => {
    setInterviewEnded(true);
    setInterviewStarted(false);
    if (timerInterval) clearInterval(timerInterval);
    speak('The interview has ended. Thank you for participating!');
  };

  // Only start interview after button click
  const handleStartInterviewClick = () => {
    setInterviewStarted(true);
    setTimer(0);
    // Optionally, reset history, etc.
    // ... any other logic to start interview ...
  };

  return (
    <div ref={interviewRef} className={isFullscreen ? "fixed inset-0 bg-black/80 z-40 flex flex-col" : "h-full flex flex-col"}>
      {/* Timer at top left */}
      {interviewStarted && !interviewEnded && (
        <div className="absolute top-4 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg font-mono text-lg shadow">
          Timer: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      {/* Go Fullscreen button at top right */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={handleFullscreen} className="px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-600 shadow-lg text-lg font-semibold">
          {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
        </button>
      </div>
      {/* End Interview button at bottom center */}
      {interviewStarted && !interviewEnded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center">
          <button onClick={handleEndInterview} className="px-8 py-4 rounded-full bg-red-600 text-white hover:bg-red-800 shadow-lg text-lg font-semibold">
            End Interview
          </button>
        </div>
      )}
      {/* Start Interview Button */}
      {!interviewStarted && !interviewEnded && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <button onClick={handleStartInterviewClick} className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-black dark:bg-white text-white dark:text-black shadow-lg hover:shadow-xl">
            Start Interview
          </button>
        </div>
      )}
      {/* Interview Ended Message */}
      {interviewEnded && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Interview Ended</h2>
          <p className="mb-4">Thank you for participating in the mock interview!</p>
        </div>
      )}
      {/* Main Interview UI (centered, Google Meet style) */}
      {interviewStarted && !interviewEnded && (
        <div className={isFullscreen ? "flex-1 flex items-center justify-center" : "flex-1 flex items-center justify-center py-8"}>
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Interviewer Panel */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-slate-300 dark:border-gray-700 overflow-hidden shadow-xl flex flex-col items-center justify-center min-h-[350px]">
              {/* AI Header */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 flex items-center justify-between w-full">
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
              <div className="flex-1 flex items-center justify-center p-6 relative w-full">
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

            {/* User Video Panel */}
            <div className="bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 rounded-2xl border-2 border-green-400 dark:border-green-700 overflow-hidden shadow-xl flex flex-col items-center justify-center min-h-[350px]">
              {/* User Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between w-full">
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
              <div className="flex-1 flex items-center justify-center p-6 relative w-full">
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
      )}
    </div>
  );
}
