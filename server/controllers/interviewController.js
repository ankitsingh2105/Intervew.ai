import { generateGeminiResponse } from "../services/gemini.js";
import { getTopicById, getTopicCombinationById } from "../data/topics.js";

// Start interview with topic or combination
export const startInterviewController = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!topicId) {
      return res.status(400).json({ 
        success: false,
        error: "Topic ID is required" 
      });
    }

    // First check if it's an individual topic
    let topic = getTopicById(topicId);
    
    // If not found, check if it's a combination
    if (!topic) {
      topic = getTopicCombinationById(topicId);
    }

    if (!topic) {
      return res.status(404).json({ 
        success: false,
        error: "Topic or combination not found" 
      });
    }

    let welcomeMessage;
    if (topic.topics) {
      // This is a combination
      const topicNames = topic.topics.map(t => getTopicById(t)?.title || t).join(", ");
      welcomeMessage = `Welcome to your ${topic.title} interview! I'll be asking you questions about ${topicNames} for the next ${topic.duration} minutes. Let's start with your first question: Can you tell me about your experience with these technologies?`;
    } else {
      // This is an individual topic
      welcomeMessage = `Welcome to your ${topic.title} interview! I'll be asking you questions about ${topic.title.toLowerCase()} for the next ${topic.duration} minutes. Let's start with your first question: Can you tell me about your experience with ${topic.title.toLowerCase()}?`;
    }

    res.json({ 
      success: true,
      reply: welcomeMessage,
      topic: {
        id: topic.id,
        title: topic.title,
        duration: topic.duration,
        difficulty: topic.difficulty,
        isCombination: !!topic.topics,
        topics: topic.topics || [topic.id]
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

// Continue interview conversation
export const continueInterviewController = async (req, res) => {
  try {
    const { answer, history = [] } = req.body;
    const { topicId } = req.params;

    if (!answer) {
      return res.status(400).json({ 
        success: false,
        error: "Answer is required" 
      });
    }

    const reply = await generateGeminiResponse(answer, history, topicId);
    
    res.json({ 
      success: true,
      reply 
    });
  } catch (error) {
    console.error("Continue interview error:", error);
    res.status(500).json({ 
      success: false,
      error: "Gemini API failed." 
    });
  }
}; 