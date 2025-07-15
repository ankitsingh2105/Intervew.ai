import React from "react";
import InterviewLoop from "../Components/InterviewLoop";
import { useLocation } from "react-router-dom";

export default function Interview() {
  const location = useLocation();
  const { interviewData, resumeFile, sessionId } = location.state || {};

  // If interviewData or sessionId is missing, show a fallback or redirect
  if (!interviewData || !sessionId) {
    return <div>Error: Interview data missing. Please start a new interview.</div>;
  }

  return (
    <div className="mt-10 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-slate-900 dark:to-black text-black dark:text-white transition-all duration-500">
      <center>
        <h1>Interview Area</h1>
      </center>
      <div className="relative z-10 pt-8 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Interview Container */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8 md:p-12">
              <InterviewLoop
                interviewData={interviewData}
                resumeFile={resumeFile}
                sessionId={sessionId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
