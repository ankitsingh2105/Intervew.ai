import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCRO3jpEi5P7UH804JdeP4mcTCE-5pldOo";

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
- Focus on the specific topic area
- Interview should last approximately 10 minutes
- Adapt question difficulty based on candidate's responses
- Generate questions dynamically based on the conversation flow
- Don't repeat questions that have already been asked

Candidate's Answer:
"${answer}"

Based on the following interview history:
${historyText}

Now:
1. Give a brief, encouraging response to the candidate's answer (1-2 sentences max)
2. Generate and ask the next relevant interview question for this topic
3. Make sure the question is appropriate for the candidate's demonstrated skill level
4. Keep the total response under 100 words

Remember: Do NOT provide feedback or coaching after each answer. Only move the interview forward.
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