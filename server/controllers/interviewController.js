import { generateGeminiResponse } from "../services/gemini.js";
import { parseResumeFromFile } from "../services/resumeParser.js";

// Start interview with resume and parameters
export const startInterviewController = async (req, res) => {
  try {
    const { interviewData } = req.body;
    const resumeFile = req.file;

    console.log('=== STARTING INTERVIEW ===');
    console.log('Interview Data:', interviewData);
    console.log('Resume File:', resumeFile ? resumeFile.originalname : 'No file');
    console.log('==========================');

    if (!interviewData) {
      return res.status(400).json({
        success: false,
        error: "Interview data is required"
      });
    }

    // Parse interview data
    let parsedData;
    if (typeof interviewData === 'string') {
      parsedData = JSON.parse(interviewData);
    } else if (typeof interviewData === 'object') {
      parsedData = interviewData;
    } else {
      throw new Error('Invalid interviewData format');
    }
    const { role, seniority, interviewType, techStack, company, difficulty, jobDescriptionText } = parsedData;

    // Parse resume if provided
    let resumeText = '';
    if (resumeFile) {
      try {
        resumeText = await parseResumeFromFile(resumeFile);
        console.log('Resume parsed successfully, length:', resumeText.length);
      } catch (error) {
        console.error('Resume parsing error:', error);
        // Continue without resume if parsing fails
      }
    }

    // Generate session ID
    const sessionId = Date.now().toString();

    // Create context for the AI
    const context = {
      role,
      seniority,
      interviewType,
      techStack,
      company,
      difficulty,
      jobDescription: jobDescriptionText,
      resumeText,
      sessionId
    };

    // Generate the first AI question using Gemini
    let initialQuestion = '';
    try {
      initialQuestion = await generateGeminiResponse('', [], context, sessionId);
    } catch (err) {
      console.error('Error generating initial Gemini question:', err);
      initialQuestion = '⚠️ Could not generate the first interview question.';
    }

    // Store session data (you might want to use Redis or database)
    // For now, we'll pass it in the response
    const sessionData = {
      sessionId,
      context,
      history: []
    };

    res.json({
      success: true,
      sessionId,
      message: "Interview started successfully",
      context: {
        role,
        seniority,
        interviewType,
        techStack,
        company,
        difficulty
      },
      initialQuestion
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start interview."
    });
  }
};

// Continue interview conversation with context
export const processInterviewController = async (req, res) => {
  try {
    const { answer, history = [], interviewData, sessionId } = req.body;

    console.log('=== PROCESSING INTERVIEW ===');
    console.log('Session ID:', sessionId);
    console.log('Answer:', answer);
    console.log('History length:', history.length);
    console.log('Interview Data:', interviewData);
    console.log('===========================');

    if (!answer) {
      return res.status(400).json({
        success: false,
        error: "Answer is required"
      });
    }

    // Pass all context to Gemini service
    const reply = await generateGeminiResponse(answer, history, interviewData, sessionId);

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("Process interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process interview response."
    });
  }
}; 