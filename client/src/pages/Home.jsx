import React from 'react';
import BubbleBackground from '../Components/BubbleBackground';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative overflow-hidden">
      <BubbleBackground />
      {/* Hero Section */}
      <section className="pt-20 flex flex-col items-center justify-center min-h-[90vh] w-full text-center z-10 relative">
        {/* Blurred white shape behind headline */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-48 md:w-[50vw] md:h-64 bg-white/60 dark:bg-white/10 rounded-full blur-2xl z-0" />
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8">
            Ace your next interview with <br className="hidden md:block" />
            <span className="text-blue-400 dark:text-blue-400">AI & Real Human Mock Interviews</span>
          </h1>
          <p className="text-1xl md:text-1xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Practice with our intelligent AI interviewer or schedule a real human mock interview. Get personalized feedback and boost your confidence for your next big opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-0">
            <button className="rounded-full border border-black dark:border-white bg-white/60 dark:bg-black/60 px-8 py-3 text-lg font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-lg">
              Book Demo
            </button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black text-black dark:text-white z-10 relative">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">AI-Powered Practice</h3>
            <p className="text-gray-500 dark:text-gray-400">Practice with our intelligent AI that adapts to your responses and provides real-time feedback.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Human Mock Interviews</h3>
            <p className="text-gray-500 dark:text-gray-400">Schedule real interviews with experienced professionals for authentic practice sessions.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Detailed Feedback</h3>
            <p className="text-gray-500 dark:text-gray-400">Get comprehensive feedback on your performance, body language, and communication skills.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 