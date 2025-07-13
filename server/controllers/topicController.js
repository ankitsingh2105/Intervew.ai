import { 
  getAllTopics, 
  getTopicById, 
  getAllTopicCombinations,
  getTopicCombinationById,
  createCustomTopicCombination,
  getAllAvailableTopics
} from "../data/topics.js";

// Get all available topics (individual + combinations)
export const getAllTopicsController = async (req, res) => {
  try {
    const allTopics = getAllAvailableTopics();
    res.json({ 
      success: true, 
      ...allTopics
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch topics" 
    });
  }
};

// Get only individual topics
export const getIndividualTopicsController = async (req, res) => {
  try {
    const topics = getAllTopics();
    res.json({ 
      success: true, 
      topics,
      count: topics.length 
    });
  } catch (error) {
    console.error("Error fetching individual topics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch individual topics" 
    });
  }
};

// Get only topic combinations
export const getTopicCombinationsController = async (req, res) => {
  try {
    const combinations = getAllTopicCombinations();
    res.json({ 
      success: true, 
      combinations,
      count: combinations.length 
    });
  } catch (error) {
    console.error("Error fetching topic combinations:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch topic combinations" 
    });
  }
};

// Create custom topic combination
export const createCustomCombinationController = async (req, res) => {
  try {
    const { topicIds } = req.body;
    
    if (!topicIds || !Array.isArray(topicIds)) {
      return res.status(400).json({ 
        success: false, 
        error: "topicIds array is required" 
      });
    }

    const customCombination = createCustomTopicCombination(topicIds);
    
    res.json({ 
      success: true, 
      combination: customCombination 
    });
  } catch (error) {
    console.error("Error creating custom combination:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get specific topic or combination by ID
export const getTopicByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if it's an individual topic
    let topic = getTopicById(id);
    
    // If not found, check if it's a combination
    if (!topic) {
      topic = getTopicCombinationById(id);
    }
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        error: "Topic or combination not found" 
      });
    }
    
    res.json({ 
      success: true, 
      topic 
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch topic" 
    });
  }
}; 