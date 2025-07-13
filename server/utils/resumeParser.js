// Resume Parser Utility
// Extracts text content from PDF resumes for AI context

import fetch from 'node-fetch';

// Resume cache to store parsed data
const resumeCache = new Map();

// Initialize resume cache on server start
export async function initializeResumeCache() {
  try {
    console.log('Initializing resume cache...');
    
    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('../models/User.js');
    
    // Get all users with resume URLs
    const usersWithResumes = await User.find({ resumeUrl: { $exists: true, $ne: null } });
    
    console.log(`Found ${usersWithResumes.length} users with resumes to cache`);
    
    // Parse and cache each resume
    for (const user of usersWithResumes) {
      if (user.resumeUrl) {
        try {
          const resumeInfo = await parseResumeFromUrl(user.resumeUrl);
          if (resumeInfo) {
            resumeCache.set(user.resumeUrl, {
              ...resumeInfo,
              userId: user._id,
              lastUpdated: new Date()
            });
            console.log(`Cached resume for user: ${user.name}`);
          }
        } catch (error) {
          console.error(`Failed to cache resume for user ${user.name}:`, error.message);
        }
      }
    }
    
    console.log(`Resume cache initialized with ${resumeCache.size} entries`);
  } catch (error) {
    console.error('Error initializing resume cache:', error);
  }
}

// Get cached resume data
export function getCachedResume(resumeUrl) {
  return resumeCache.get(resumeUrl);
}

// Update cache when new resume is uploaded
export function updateResumeCache(resumeUrl, resumeInfo, userId) {
  resumeCache.set(resumeUrl, {
    ...resumeInfo,
    userId,
    lastUpdated: new Date()
  });
  console.log(`Updated resume cache for URL: ${resumeUrl}`);
}

// Clear cache for a specific resume
export function clearResumeCache(resumeUrl) {
  resumeCache.delete(resumeUrl);
  console.log(`Cleared resume cache for URL: ${resumeUrl}`);
}

// Get cache statistics
export function getCacheStats() {
  return {
    totalCached: resumeCache.size,
    cacheEntries: Array.from(resumeCache.entries()).map(([url, data]) => ({
      url,
      userId: data.userId,
      lastUpdated: data.lastUpdated,
      skillsCount: data.skills?.length || 0
    }))
  };
}

export async function parseResumeFromUrl(resumeUrl) {
  try {
    if (!resumeUrl) {
      console.log('No resume URL provided');
      return null;
    }

    // Check if resume is already cached
    const cachedResume = getCachedResume(resumeUrl);
    if (cachedResume) {
      console.log('Using cached resume data');
      return cachedResume;
    }

    console.log('Parsing resume from URL:', resumeUrl);

    // Try to fetch the PDF content with better error handling
    let response = await fetch(resumeUrl);
    console.log('Fetch response status:', response.status, response.statusText);
    
    // If the original URL fails, try alternative URL formats
    if (!response.ok) {
      console.log('Original URL failed, trying alternative formats...');
      
      // Try different URL patterns
      const urlPatterns = [
        resumeUrl,
        resumeUrl.replace('/resumes/', '/interview/'),
        resumeUrl.replace('/interview/', '/resumes/'),
        resumeUrl.replace('/storage/v1/object/public/', '/storage/v1/object/sign/')
      ];
      
      for (const url of urlPatterns) {
        if (url === resumeUrl) continue; // Skip the original URL we already tried
        
        console.log('Trying URL:', url);
        response = await fetch(url);
        console.log('Alternative URL response status:', response.status, response.statusText);
        
        if (response.ok) {
          console.log('Success with alternative URL:', url);
          break;
        }
      }
    }
    
    if (!response.ok) {
      console.log('Failed to fetch resume from all URL attempts');
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      return null;
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('PDF buffer size:', pdfBuffer.byteLength, 'bytes');

    // Use pdf-parse with proper Node.js buffer
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(Buffer.from(pdfBuffer));
    const extractedText = data.text || '';

    console.log('Extracted text length:', extractedText.length);

    const resumeInfo = {
      text: extractedText,
      skills: extractSkillsFromText(extractedText),
      experience: extractExperienceFromText(extractedText),
      education: extractEducationFromText(extractedText),
      projects: extractProjectsFromText(extractedText)
    };

    console.log('Resume parsed successfully. Skills found:', resumeInfo.skills.length);
    return resumeInfo;

  } catch (error) {
    console.error('Error parsing resume:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

// Extract key information from resume text
export function extractResumeInfo(resumeText) {
  if (!resumeText) return null;

  return {
    skills: extractSkillsFromText(resumeText),
    experience: extractExperienceFromText(resumeText),
    education: extractEducationFromText(resumeText),
    projects: extractProjectsFromText(resumeText)
  };
}

// Extract skills from text
function extractSkillsFromText(text) {
  const skillKeywords = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala',
    // Frontend Technologies
    'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML', 'CSS', 'Sass', 'Less', 'Tailwind CSS', 'Bootstrap',
    // Backend Technologies
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET', 'FastAPI', 'Gin', 'Echo',
    // Databases
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform',
    // Tools & Others
    'Git', 'GraphQL', 'REST API', 'Microservices', 'RESTful', 'JWT', 'OAuth', 'WebSocket', 'Socket.io',
    // Frameworks & Libraries
    'Redux', 'MobX', 'Zustand', 'Jest', 'Cypress', 'Selenium', 'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier'
  ];

  const foundSkills = [];
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

// Extract experience from text
function extractExperienceFromText(text) {
  const experience = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('experience') || line.includes('work') || line.includes('job')) {
      // Look for company names and roles in subsequent lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.includes('at') || nextLine.includes('(') || nextLine.includes('-')) {
          experience.push(nextLine.trim());
        }
      }
      break;
    }
  }
  return experience;
}

// Extract education from text
function extractEducationFromText(text) {
  const education = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('education') || line.includes('degree') || line.includes('university') || line.includes('college')) {
      // Look for education details in subsequent lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.includes('Bachelor') || nextLine.includes('Master') || nextLine.includes('PhD') || nextLine.includes('202')) {
          education.push(nextLine.trim());
        }
      }
      break;
    }
  }
  return education;
}

// Extract projects from text
function extractProjectsFromText(text) {
  const projects = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('project') || line.includes('portfolio')) {
      // Look for project details in subsequent lines
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.includes('(') || nextLine.includes('-') || nextLine.includes('React') || nextLine.includes('Node')) {
          projects.push(nextLine.trim());
        }
      }
      break;
    }
  }
  return projects;
}

// Generate resume-specific prompt
export function generateResumePrompt(userProfile, resumeInfo) {
  let prompt = `\n\nCANDIDATE RESUME ANALYSIS:\n`;
  if (userProfile) {
    prompt += `Name: ${userProfile.name}\n`;
    prompt += `Education: ${userProfile.college || 'Not specified'} - ${userProfile.course || 'Not specified'}\n`;
    prompt += `Graduation Year: ${userProfile.yearOfGraduation || 'Not specified'}\n`;
  }
  if (resumeInfo) {
    if (resumeInfo.skills && resumeInfo.skills.length > 0) {
      prompt += `\nDetected Skills: ${resumeInfo.skills.join(', ')}\n`;
      prompt += `Ask specific questions about these technologies and their real-world usage.\n`;
    }
    if (resumeInfo.experience && resumeInfo.experience.length > 0) {
      prompt += `\nWork Experience: ${resumeInfo.experience.join('; ')}\n`;
      prompt += `Ask about their roles, responsibilities, and achievements in these positions.\n`;
    }
    if (resumeInfo.projects && resumeInfo.projects.length > 0) {
      prompt += `\nProjects: ${resumeInfo.projects.join('; ')}\n`;
      prompt += `Ask detailed questions about these projects, their technical implementation, and challenges faced.\n`;
    }
  }
  prompt += `\nAsk detailed questions about:\n`;
  prompt += `1. Projects mentioned in their resume - technical decisions, architecture, challenges\n`;
  prompt += `2. Technologies they've worked with - practical usage, best practices, troubleshooting\n`;
  prompt += `3. Challenges they've faced and how they solved them - problem-solving approach\n`;
  prompt += `4. Their role and contributions in team projects - leadership, collaboration\n`;
  prompt += `5. Specific technical decisions they made - reasoning, trade-offs, alternatives considered\n`;
  prompt += `6. Real-world applications of their skills - production experience, scaling issues\n`;
  prompt += `7. Problem-solving approaches they used - debugging, optimization, performance\n`;
  prompt += `8. Learning experiences and how they stay updated with technology trends\n`;
  return prompt;
} 