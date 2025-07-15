import fetch from "node-fetch";

const GEMINI_API_KEY = "AIzaSyCRO3jpEi5P7UH804JdeP4mcTCE-5pldOo";

export async function generateGeminiResponse(answer, history = [], topicId = null, customSystemPrompt = null) {
    const historyText = history
        .map((h) => `${h.role === "user" ? "Candidate" : "AI"}: ${h.content}`)
        .join("\n");

    // Use custom system prompt if provided, otherwise use topic-specific prompt
    let systemPrompt = "";
    if (customSystemPrompt) {
        systemPrompt = customSystemPrompt;
    } else if (topicId) {
        const { getTopicById } = await import("../data/topics.js");
        const topic = getTopicById(topicId);
        if (topic) {
            systemPrompt = `You are conducting a ${topic.title} interview. ${topic.prompt}`;
        }
    } else {
        systemPrompt = "You are an AI interviewer conducting a professional mock interview.";
    }

    const finalPrompt = `
${systemPrompt}

CRITICAL INTERVIEW RULES:
- **ASK ONLY ONE QUESTION AT A TIME** - This is the most important rule
- Keep responses concise and professional (under 150 words total)
- Provide brief, constructive feedback on answers when appropriate
- Maintain a conversational but professional tone
- Focus on the specific role and technology stack
- Adapt question difficulty based on candidate's responses
- Generate questions dynamically based on the conversation flow
- Don't repeat questions that have already been asked
- Consider the candidate's resume information if available
- Ask follow-up questions based on the candidate's answers

Candidate's Answer:
"${answer}"

Based on the following interview history:
${historyText}

Now:
1. Give a brief, encouraging response to the candidate's answer (1-2 sentences max)
2. **ASK ONLY ONE RELEVANT INTERVIEW QUESTION** - Do not ask multiple questions
3. Make sure the question is appropriate for the candidate's demonstrated skill level
4. Keep the total response under 150 words
5. If this is the first question, ask them to introduce themselves

IMPORTANT: You must ask exactly ONE question per response. Do not ask multiple questions or compound questions.

Remember: Generate questions dynamically based on the conversation context and candidate's responses.
`;
    

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: finalPrompt }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
            "⚠️ Sorry, no response from Gemini.";

        return reply;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "⚠️ Gemini API request failed.";
    }
}
