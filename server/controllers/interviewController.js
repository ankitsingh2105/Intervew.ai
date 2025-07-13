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

// Generate dynamic prompt based on configuration
function generateDynamicPrompt(config) {
  const {
    roleTrack,
    seniorityLevel,
    techStack,
    interviewType,
    difficultyLevel,
    companyTarget,
    feedbackType,
    jobDescription,
    duration,
    userProfile,
    resumeUrl,
    resumeInfo
  } = config;

  let prompt = `You are an expert technical interviewer conducting a ${duration}-minute interview for a ${seniorityLevel} ${roleTrack} position. `;

  // Add company context if specified
  if (companyTarget) {
    prompt += `This interview is targeting ${companyTarget} company standards. `;
  }

  // Add difficulty context
  prompt += `The difficulty level is ${difficultyLevel}. `;

  // Add tech stack context
  if (techStack && Array.isArray(techStack) && techStack.length > 0) {
    prompt += `Focus on these technologies: ${techStack.join(', ')}. `;
  }

  // Add interview type specific instructions
  prompt += getInterviewTypeInstructions(interviewType, seniorityLevel);

  // Add resume context and analysis
  if (resumeUrl && userProfile && resumeInfo) {
    console.log('Adding resume context to prompt');
    prompt += generateResumePrompt(userProfile, resumeInfo);
  } else if (resumeUrl && userProfile) {
    console.log('Resume URL exists but no parsed info available');
    prompt += `\n\nCANDIDATE RESUME: A resume is available for this candidate. Ask questions about their background, projects, and experience mentioned in their resume.`;
  } else {
    console.log('No resume available for this candidate');
    prompt += `\n\nCANDIDATE BACKGROUND: No resume available. Ask general questions about their background, projects, and experience.`;
  }

  // Add job description context if available
  if (jobDescription) {
    prompt += `\n\nJOB DESCRIPTION:\n${jobDescription}\n\nUse this job description to tailor your questions and evaluate candidate fit. `;
  }

  // Add feedback instructions
  prompt += getFeedbackInstructions(feedbackType);

  // Add conversation flow instructions
  prompt += `\n\nINTERVIEW FLOW:\n1. Start with a brief introduction and explain the interview format\n2. Ask 3-5 technical questions based on the role and tech stack\n3. For resume-based interviews, ask about specific projects and experiences mentioned in their resume\n4. Provide constructive feedback after each answer\n5. End with overall assessment and next steps\n\nKeep responses conversational and professional. Ask follow-up questions to dive deeper into technical concepts. Ask only 1-2 questions at a time.`;

  return prompt;
}

function getInterviewTypeInstructions(interviewType, seniorityLevel) {
  const instructions = {
    'DSA / Algorithm': `Focus on data structures and algorithms. For ${seniorityLevel} level, ask questions about time/space complexity, optimization techniques, and problem-solving approaches. Include coding questions and algorithmic thinking.`,
    
    'System Design': `Focus on system architecture, scalability, and design patterns. For ${seniorityLevel} level, ask about distributed systems, microservices, database design, and trade-offs. Include whiteboard discussions and architecture decisions.`,
    
    'Low-Level Design': `Focus on object-oriented design, design patterns, and code structure. For ${seniorityLevel} level, ask about SOLID principles, design patterns, and clean code practices. Include class diagrams and code reviews.`,
    
    'Behavioral': `Focus on soft skills, leadership, and past experiences. For ${seniorityLevel} level, ask about team collaboration, conflict resolution, and project management. Use STAR method for structured responses.`,
    
    'Resume Deep Dive': `Thoroughly examine the candidate's resume and ask detailed questions about their projects, technologies used, challenges faced, and outcomes achieved. Focus on their specific experiences and technical depth.`,
    
    'Project Discussion': `Ask detailed questions about the candidate's projects. Focus on technical decisions, challenges overcome, technologies used, and lessons learned. Ask about their role and contributions in team projects.`,
    
    'Tech Stack Check': `Focus on the specific technologies mentioned in their resume and the required tech stack. Ask practical questions about real-world usage, best practices, and troubleshooting. Include hands-on scenarios.`,
    
    'Take-Home Assignment': `Provide a realistic coding assignment or problem statement. Give clear requirements, constraints, and evaluation criteria. Ask about their approach, design decisions, and implementation details.`
  };

  return instructions[interviewType] || 'Conduct a general technical interview covering various aspects of the role.';
}

function getFeedbackInstructions(feedbackType) {
  const instructions = {
    'Score-based': `\n\nFEEDBACK FORMAT: Provide a score out of 10 for each answer and overall performance. Be specific about what was good and what could be improved.`,
    
    'Detailed Explanation': `\n\nFEEDBACK FORMAT: Provide comprehensive feedback explaining why answers were correct/incorrect, suggest improvements, and give specific examples. Include learning resources when appropriate.`,
    
    'Audio Summary': `\n\nFEEDBACK FORMAT: Provide concise, actionable feedback that could be converted to audio. Focus on key strengths, areas for improvement, and specific next steps.`
  };

  return instructions[feedbackType] || instructions['Detailed Explanation'];
} 