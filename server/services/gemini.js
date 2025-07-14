import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCRO3jpEi5P7UH804JdeP4mcTCE-5pldOo";

export async function generateGeminiResponse(answer, history = [], interviewData = {}, sessionId = null) {
    const historyText = history
        .map((h) => `${h.role === "user" ? "Candidate" : "AI"}: ${h.content}`)
        .join("\n");

    // Build context from interviewData
    let context = "";
    if (interviewData) {
        context += `Role: ${interviewData.role || "N/A"}\n`;
        context += `Seniority: ${interviewData.seniority || "N/A"}\n`;
        context += `Interview Type: ${interviewData.interviewType || "N/A"}\n`;
        if (interviewData.company) context += `Company: ${interviewData.company}\n`;
        if (interviewData.techStack && interviewData.techStack.length > 0)
            context += `Tech Stack: ${interviewData.techStack.join(", ")}\n`;
        if (interviewData.difficulty) context += `Difficulty: ${interviewData.difficulty}\n`;
    }

    const prompt = `
You are an AI interviewer conducting a professional mock interview.

INTERVIEW CONTEXT:
${context}

INTERVIEW RULES:
- Keep responses concise and professional (under 100 words total)
- Ask one question at a time
- Do NOT provide feedback after each answer, just acknowledge and move to the next question
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