import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCRO3jpEi5P7UH804JdeP4mcTCE-5pldOo";

export async function generateGeminiResponse(answer, history = [], topicId = null) {
    const historyText = history
        .map((h) => `${h.role === "user" ? "Candidate" : "AI"}: ${h.content}`)
        .join("\n");

    // Get topic-specific prompt if topicId is provided
    let topicPrompt = "";
    if (topicId) {
        const { getTopicById } = await import("../data/topics.js");
        const topic = getTopicById(topicId);
        if (topic) {
            topicPrompt = `\n\nINTERVIEW CONTEXT:\n${topic.prompt}\n\nTOPIC: ${topic.title}\nDIFFICULTY: ${topic.difficulty}\nDURATION: ${topic.duration} minutes`;
        }
    }

    const prompt = `
You are an AI interviewer conducting a professional mock interview.

${topicPrompt}

INTERVIEW RULES:
- Keep responses concise and professional (under 100 words total)
- Ask one question at a time
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

Remember: This is a ${topicId ? 'topic-specific' : 'general'} interview. Generate questions dynamically based on the conversation context and candidate's responses.
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
                            parts: [{ text: prompt }],
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
