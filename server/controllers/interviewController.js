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
    const parsedData = JSON.parse(interviewData);
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
      }
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
    const { answer, history = [], interviewData, sessionId, resumeFile } = req.body;

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

    // Create enhanced prompt with interview context
    let systemPrompt = `You are an expert interviewer conducting a ${interviewData?.interviewType || 'technical'} interview for a ${interviewData?.seniority || 'mid-level'} ${interviewData?.role || 'software engineer'} position`;

    if (interviewData?.company) {
      systemPrompt += ` at ${interviewData.company}`;
    }

    if (interviewData?.techStack && interviewData.techStack.length > 0) {
      systemPrompt += `. Focus on: ${interviewData.techStack.join(', ')}`;
    }

    if (interviewData?.difficulty) {
      systemPrompt += `. Interview difficulty: ${interviewData.difficulty}`;
    }

    systemPrompt += `. Ask relevant, challenging questions based on the candidate's role and experience level. Provide constructive feedback when appropriate.`;

    // Generate AI response with context
    const reply = await generateGeminiResponse(answer, history, null, systemPrompt);

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