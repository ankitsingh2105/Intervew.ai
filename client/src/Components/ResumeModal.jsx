import React from 'react';

const ResumeModal = ({ 
  modalOpen, 
  setModalOpen, 
  modalOption, 
  resumeFile, 
  jobDescription, 
  setJobDescription, 
  parsedResume, 
  isParsing, 
  handleFileUpload, 
  handleSaveResume, 
  handleSaveJobDescription 
}) => {
  if (!modalOpen) return null;

  const renderModalContent = () => {
    if (modalOption === 'Upload Resume') {
      return (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Upload Resume (PDF Only)</h2>
          
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700" 
          />

          {resumeFile && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">✅ Resume Uploaded</h3>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p><strong>File:</strong> {resumeFile.name}</p>
                <p><strong>Size:</strong> {(resumeFile.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs mt-2">Resume saved successfully</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (modalOption === 'Job-Description') {
      return (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Paste Job Description</h2>
          
          <textarea 
            rows={6} 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition" 
            placeholder="Paste the job description here..." 
          />

          <button 
            onClick={handleSaveJobDescription}
            className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 rounded-lg transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Add Job Description
          </button>
        </div>
      );
    }
    
    if (modalOption) {
      return (
        <div className="flex flex-col gap-4 items-center justify-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalOption}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            This feature is coming soon...
          </p>
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Close
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-gray-200 dark:border-gray-700 transition-colors">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {renderModalContent()}
      </div>
    </div>
  );
};

export default ResumeModal; 