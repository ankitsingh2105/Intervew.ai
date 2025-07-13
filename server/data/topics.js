export const interviewTopics = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Master fundamental DSA concepts and problem-solving techniques",
    icon: "🔢",
    duration: 10, // minutes
    difficulty: "Medium",
    prompt: `You are conducting a Data Structures & Algorithms interview. Focus on:
    - Algorithm complexity analysis
    - Data structure implementations
    - Problem-solving approaches
    - Time and space complexity
    - Real-world applications of DSA
    
    Generate relevant questions dynamically based on the candidate's responses and adapt the difficulty accordingly.`
  },
  {
    id: "react",
    title: "React.js Development",
    description: "Test your React knowledge and modern frontend development skills",
    icon: "⚛️",
    duration: 10,
    difficulty: "Medium",
    prompt: `You are conducting a React.js interview. Focus on:
    - React fundamentals and concepts
    - Component lifecycle and hooks
    - State management
    - Performance optimization
    - Modern React patterns (functional components, hooks)
    
    Generate practical questions based on the candidate's experience level and responses.`
  },
  {
    id: "javascript",
    title: "JavaScript Fundamentals",
    description: "Deep dive into JavaScript concepts and modern ES6+ features",
    icon: "🟨",
    duration: 10,
    difficulty: "Medium",
    prompt: `You are conducting a JavaScript interview. Focus on:
    - Core JavaScript concepts
    - ES6+ features
    - Asynchronous programming
    - Scope and closures
    - Modern JavaScript patterns
    
    Generate questions that test deep understanding of JavaScript fundamentals based on the conversation flow.`
  },
  {
    id: "system-design",
    title: "System Design",
    description: "Design scalable systems and architecture patterns",
    icon: "🏗️",
    duration: 10,
    difficulty: "Hard",
    prompt: `You are conducting a System Design interview. Focus on:
    - Scalability and performance
    - Database design and optimization
    - Distributed systems concepts
    - Trade-offs and decision making
    - Real-world system architecture
    
    Generate high-level design questions and evaluate system thinking based on the candidate's responses.`
  },
  {
    id: "python",
    title: "Python Programming",
    description: "Test Python fundamentals and advanced programming concepts",
    icon: "🐍",
    duration: 10,
    difficulty: "Medium",
    prompt: `You are conducting a Python interview. Focus on:
    - Python fundamentals and syntax
    - Advanced Python features
    - Memory management
    - Performance optimization
    - Python-specific patterns and best practices
    
    Generate questions that test both basic and advanced Python knowledge dynamically.`
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description: "Explore ML algorithms, statistics, and data science concepts",
    icon: "🤖",
    duration: 10,
    difficulty: "Hard",
    prompt: `You are conducting a Machine Learning interview. Focus on:
    - ML algorithms and concepts
    - Statistics and probability
    - Data preprocessing and feature engineering
    - Model evaluation and validation
    - Practical ML applications
    
    Generate questions that test both theoretical and practical ML knowledge based on the candidate's expertise level.`
  }
];

// Pre-defined topic combinations for common interview scenarios
export const topicCombinations = [
  {
    id: "frontend-fullstack",
    title: "Frontend + Full Stack",
    description: "React + JavaScript + System Design for full-stack roles",
    icon: "🌐",
    topics: ["react", "javascript", "system-design"],
    duration: 15,
    difficulty: "Medium",
    prompt: `You are conducting a comprehensive Frontend + Full Stack interview covering React, JavaScript, and System Design. Focus on:
    - React fundamentals and modern patterns
    - JavaScript core concepts and ES6+ features
    - System design principles for web applications
    - Integration between frontend and backend
    - Performance optimization across the stack
    
    Generate questions that test both frontend expertise and system thinking, adapting based on the candidate's responses.`
  },
  {
    id: "backend-python",
    title: "Backend + Python",
    description: "Python + System Design + DSA for backend engineering",
    icon: "🐍",
    topics: ["python", "system-design", "dsa"],
    duration: 15,
    difficulty: "Hard",
    prompt: `You are conducting a Backend + Python interview covering Python programming, System Design, and DSA. Focus on:
    - Python fundamentals and advanced features
    - System design for backend services
    - Algorithm optimization and data structures
    - Database design and optimization
    - Scalability and performance considerations
    
    Generate questions that test both programming skills and architectural thinking.`
  },
  {
    id: "ml-data-science",
    title: "ML + Data Science",
    description: "Machine Learning + Python + DSA for ML engineering",
    icon: "📊",
    topics: ["machine-learning", "python", "dsa"],
    duration: 15,
    difficulty: "Hard",
    prompt: `You are conducting a Machine Learning + Data Science interview covering ML, Python, and DSA. Focus on:
    - Machine learning algorithms and concepts
    - Python for data science and ML
    - Algorithm optimization for ML applications
    - Data preprocessing and feature engineering
    - Model evaluation and deployment considerations
    
    Generate questions that test both ML theory and practical implementation skills.`
  },
  {
    id: "web-development",
    title: "Web Development",
    description: "React + JavaScript + Python for web development roles",
    icon: "💻",
    topics: ["react", "javascript", "python"],
    duration: 15,
    difficulty: "Medium",
    prompt: `You are conducting a Web Development interview covering React, JavaScript, and Python. Focus on:
    - React frontend development
    - JavaScript fundamentals and modern features
    - Python backend development
    - Full-stack integration
    - Web development best practices
    
    Generate questions that test both frontend and backend web development skills.`
  }
];

export const getTopicById = (id) => {
  return interviewTopics.find(topic => topic.id === id);
};

export const getAllTopics = () => {
  return interviewTopics;
};

export const getTopicCombinationById = (id) => {
  return topicCombinations.find(combo => combo.id === id);
};

export const getAllTopicCombinations = () => {
  return topicCombinations;
};

// Function to create custom topic combination from selected topic IDs
export const createCustomTopicCombination = (topicIds) => {
  if (!Array.isArray(topicIds) || topicIds.length < 2 || topicIds.length > 3) {
    throw new Error("Must select 2-3 topics for combination");
  }

  const selectedTopics = topicIds.map(id => getTopicById(id)).filter(Boolean);
  
  if (selectedTopics.length !== topicIds.length) {
    throw new Error("One or more selected topics not found");
  }

  const title = selectedTopics.map(t => t.title).join(" + ");
  const description = `Custom combination: ${selectedTopics.map(t => t.title).join(", ")}`;
  const icon = selectedTopics[0].icon; // Use first topic's icon
  
  // Calculate duration based on number of topics (10 min per topic, max 20 min)
  const duration = Math.min(selectedTopics.length * 5, 20);
  
  // Determine difficulty (if any topic is Hard, overall is Hard)
  const difficulty = selectedTopics.some(t => t.difficulty === "Hard") ? "Hard" : "Medium";
  
  // Combine prompts from all selected topics
  const combinedPrompt = `You are conducting a comprehensive interview covering multiple topics: ${title}. Focus on:
    ${selectedTopics.map(topic => `- ${topic.title}: ${topic.prompt.split('\n').slice(1, -1).join('\n    ')}`).join('\n    ')}
    
    Generate questions that test knowledge across all these areas, adapting based on the candidate's responses and ensuring balanced coverage of all topics.`;

  return {
    id: `custom-${topicIds.join('-')}`,
    title,
    description,
    icon,
    topics: topicIds,
    duration,
    difficulty,
    prompt: combinedPrompt,
    isCustom: true
  };
};

// Function to get all available topics (individual + combinations)
export const getAllAvailableTopics = () => {
  return {
    individual: interviewTopics,
    combinations: topicCombinations,
    total: interviewTopics.length + topicCombinations.length
  };
}; 