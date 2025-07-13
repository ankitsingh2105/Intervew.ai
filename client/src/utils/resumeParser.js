import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker for Vite - use CDN directly
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Parse Resume Function with PDF support
export const parseResume = async (file) => {
  try {
    let text = '';
    
    if (file.type === 'application/pdf') {
      // Parse PDF using pdfjs-dist
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += pageText + '\n';
      }
    } else {
      // Only PDF files are allowed
      throw new Error('Only PDF files are supported');
    }
    
    // Basic parsing logic (you can enhance this)
    const parsed = {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      summary: extractSummary(text),
      fullText: text // Save the full text
    };
    
    return { success: true, data: parsed };
  } catch (error) {
    console.error('Error parsing resume:', error);
    return { success: false, error: error.message || 'Error parsing resume' };
  }
};

// Helper functions for parsing
const extractName = (text) => {
  // Simple name extraction - you can enhance this
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
  // Look for common skill keywords
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
  // Simple experience extraction
  const experienceKeywords = ['experience', 'work', 'employment', 'job'];
  const lines = text.split('\n');
  const experienceLines = lines.filter(line => 
    experienceKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
  return experienceLines.slice(0, 3); // Return first 3 experience lines
};

const extractEducation = (text) => {
  const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master'];
  const lines = text.split('\n');
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
  return educationLines.slice(0, 2); // Return first 2 education lines
};

const extractSummary = (text) => {
  const lines = text.split('\n');
  // Look for summary or objective section
  const summaryIndex = lines.findIndex(line => 
    line.toLowerCase().includes('summary') || line.toLowerCase().includes('objective')
  );
  
  if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
    return lines[summaryIndex + 1]?.trim() || 'Summary not found';
  }
  
  return 'Summary not found';
}; 