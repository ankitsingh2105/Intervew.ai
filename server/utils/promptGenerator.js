// Prompt Generator for Interview AI
// Generates contextual prompts based on interview configuration

export function generateInterviewPrompt(config, userProfile = null) {
  const {
    roleTrack,
    seniorityLevel,
    techStack,
    interviewType,
    difficultyLevel,
    companyTarget,
    feedbackType,
    jobDescription,
    resumeUrl,
    duration
  } = config;

  let basePrompt = `You are an expert technical interviewer conducting a ${duration}-minute interview for a ${seniorityLevel} ${roleTrack} position. `;

  // Add company context if specified
  if (companyTarget) {
    basePrompt += `This interview is targeting ${companyTarget} company standards. `;
  }

  // Add difficulty context
  basePrompt += `The difficulty level is ${difficultyLevel}. `;

  // Add tech stack context
  if (techStack && techStack.length > 0) {
    basePrompt += `Focus on these technologies: ${techStack.join(', ')}. `;
  }

  // Add interview type specific instructions
  basePrompt += getInterviewTypeInstructions(interviewType, seniorityLevel);

  // Add resume context if available
  if (resumeUrl && userProfile) {
    basePrompt += `\n\nCANDIDATE RESUME CONTEXT:\n${userProfile.name} has experience in: ${userProfile.college || 'Not specified'} college, ${userProfile.course || 'Not specified'} course, graduating in ${userProfile.yearOfGraduation || 'Not specified'}. `;
    basePrompt += `Resume is available at: ${resumeUrl}. Use this to ask relevant questions about their projects and experience. `;
  }

  // Add job description context if available
  if (jobDescription) {
    basePrompt += `\n\nJOB DESCRIPTION:\n${jobDescription}\n\nUse this job description to tailor your questions and evaluate candidate fit. `;
  }

  // Add feedback instructions
  basePrompt += getFeedbackInstructions(feedbackType);

  // Add conversation flow instructions
  basePrompt += `\n\nINTERVIEW FLOW:\n1. Start with a brief introduction and explain the interview format\n2. Ask 3-5 technical questions based on the role and tech stack\n3. For resume-based interviews, ask about specific projects and experiences\n4. Provide constructive feedback after each answer\n5. End with overall assessment and next steps\n\nKeep responses conversational and professional. Ask follow-up questions to dive deeper into technical concepts.`;

  return basePrompt;
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

// Generate specific question prompts based on configuration
export function generateQuestionPrompt(config, questionType = 'technical') {
  const { roleTrack, seniorityLevel, techStack, difficultyLevel } = config;
  
  let prompt = `Generate a ${difficultyLevel.toLowerCase()} level ${questionType} question for a ${seniorityLevel} ${roleTrack} position. `;
  
  if (techStack && techStack.length > 0) {
    prompt += `Focus on: ${techStack.join(', ')}. `;
  }
  
  prompt += `The question should be appropriate for ${seniorityLevel} level and relevant to ${roleTrack} responsibilities. `;
  
  if (questionType === 'behavioral') {
    prompt += `Use the STAR method format and ask about relevant experiences for this role.`;
  } else if (questionType === 'system_design') {
    prompt += `Include scalability considerations, trade-offs, and real-world constraints.`;
  } else if (questionType === 'coding') {
    prompt += `Include time/space complexity analysis and optimization opportunities.`;
  }
  
  return prompt;
} 