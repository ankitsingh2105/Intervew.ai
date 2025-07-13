import React from "react";
import InterviewLoop from "../Components/InterviewLoop";

export default function Interview() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🤖 AI Mock Interview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Practice with our intelligent AI interviewer and get real-time feedback on your responses
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8">
          <InterviewLoop />
        </div>
      </div>
    </div>
  );
}
