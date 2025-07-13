// For Node.js, we'll use a simpler approach without pdfjs-dist
// You can install pdf-parse or pdf2pic for better Node.js compatibility

// Simple text extraction for now - you can enhance this later
export const parseResumeFromFile = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file or file buffer provided');
    }
    
    console.log('PDF file received:', file.originalname, 'Size:', file.size);
    
    // Placeholder - replace with actual PDF parsing
    const placeholderText = `Resume for ${file.originalname}
    
This is a placeholder for the parsed resume content.
In a production environment, you would implement proper PDF parsing here.

You can use libraries like:
- pdf-parse (simple text extraction)
- pdf2pic (convert to images then OCR)
- AWS Textract (cloud-based OCR)
- Google Cloud Vision API

For now, the interview will continue without resume context.`;

    return placeholderText;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

// Extract structured information from resume text
export const extractResumeInfo = (text) => {
  const info = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    summary: extractSummary(text)
  };
  
  return info;
};

// Helper functions for parsing
const extractName = (text) => {
  const lines = text.split('\n');
  return lines[0]?.trim() || 'Name not found';
};

const extractEmail = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : 'Email not found';
};

const extractPhone = (text) => {
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : 'Phone not found';
};

const extractSkills = (text) => {
  const skillKeywords = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'Angular', 'Vue.js',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Agile', 'Scrum'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.length > 0 ? foundSkills : ['Skills not detected'];
};

const extractExperience = (text) => {
  const experienceKeywords = ['experience', 'work', 'employment', 'job'];
  const lines = text.split('\n');
  const experienceLines = lines.filter(line => 
    experienceKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
  return experienceLines.slice(0, 3);
};

const extractEducation = (text) => {
  const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master'];
  const lines = text.split('\n');
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
  return educationLines.slice(0, 2);
};

const extractSummary = (text) => {
  const lines = text.split('\n');
  const summaryIndex = lines.findIndex(line => 
    line.toLowerCase().includes('summary') || line.toLowerCase().includes('objective')
  );
  
  if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
    return lines[summaryIndex + 1]?.trim() || 'Summary not found';
  }
  
  return 'Summary not found';
}; 