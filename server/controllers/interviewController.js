import { generateGeminiResponse } from "../services/gemini.js";
import User from "../models/User.js";
import { parseResumeFromUrl, generateResumePrompt } from "../utils/resumeParser.js";

// Start interview with dynamic configuration
export const startInterviewController = async (req, res) => {
  try {
    const {
      roleTrack,
      seniorityLevel,
      techStack = [],
      interviewType,
      difficultyLevel,
      companyTarget,
      feedbackType,
      jobDescription,
      duration = 10
    } = req.body;

    // No validation required - start interview with whatever user selects
    // Set defaults for all fields
    const config = {
      roleTrack: roleTrack || 'Software Engineer',
      seniorityLevel: seniorityLevel || 'Entry-Level',
      techStack: techStack || [],
      interviewType: interviewType || 'General Technical',
      difficultyLevel: difficultyLevel || 'Intermediate',
      companyTarget: companyTarget || null,
      feedbackType: feedbackType || 'Detailed Explanation',
      jobDescription: jobDescription || null,
      duration: duration || 30
    };

    // Get user profile and resume
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log('User found:', user.name, 'Resume URL:', user.resumeUrl ? 'Available' : 'Not available');

    // Parse resume if available
    let resumeInfo = null;
    if (user.resumeUrl) {
      console.log('Parsing resume from URL:', user.resumeUrl);
      resumeInfo = await parseResumeFromUrl(user.resumeUrl);
      if (resumeInfo) {
        console.log('Resume parsed successfully. Skills found:', resumeInfo.skills.length);
        console.log('Skills:', resumeInfo.skills);
      } else {
        console.log('Failed to parse resume');
      }
    } else {
      console.log('No resume URL found for user');
    }

    // Generate dynamic prompt based on configuration
    const interviewPrompt = generateDynamicPrompt({
      ...config,
      userProfile: user,
      resumeUrl: user.resumeUrl,
      resumeInfo
    });

    console.log('Generated interview prompt length:', interviewPrompt.length);

    // Generate welcome message and first question
    const welcomePrompt = `${interviewPrompt}\n\nStart the interview with a welcoming introduction. Introduce yourself as the AI interviewer and briefly explain what to expect in this ${config.duration}-minute interview. Ask the first question based on the interview type and configuration.`;

    const welcomeMessage = await generateGeminiResponse(welcomePrompt, [], 'dynamic-interview');

    res.json({
      success: true,
      reply: welcomeMessage,
      interviewConfig: config,
      resumeInfo: resumeInfo ? {
        skills: resumeInfo.skills,
        hasResume: true
      } : {
        hasResume: false
      }
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start interview"
    });
  }
};

// Continue interview conversation with context
export const continueInterviewController = async (req, res) => {
  try {
    const { answer, history = [], interviewConfig } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        error: "Answer is required"
      });
    }

    if (!interviewConfig) {
      return res.status(400).json({
        success: false,
        error: "Interview configuration is required"
      });
    }

    console.log('Continuing interview. Answer length:', answer.length, 'History length:', history.length);

    // Get user profile for context
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Parse resume if available (only if we haven't already)
    let resumeInfo = null;
    if (user.resumeUrl) {
      resumeInfo = await parseResumeFromUrl(user.resumeUrl);
    }

    // Generate dynamic prompt
    const interviewPrompt = generateDynamicPrompt({
      ...interviewConfig,
      userProfile: user,
      resumeUrl: user.resumeUrl,
      resumeInfo
    });

    // Create context-aware prompt
    const contextPrompt = `${interviewPrompt}\n\nCURRENT CONVERSATION CONTEXT:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nCANDIDATE ANSWER: ${answer}\n\nProvide an appropriate response as the interviewer. Ask follow-up questions, provide feedback based on the configured feedback type, and continue the interview flow naturally. Keep your response concise and ask 1-2 questions at a time.`;

    const reply = await generateGeminiResponse(contextPrompt, history, 'dynamic-interview');

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("Continue interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to continue interview"
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