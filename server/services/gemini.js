import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCRO3jpEi5P7UH804JdeP4mcTCE-5pldOo";

export async function generateGeminiResponse(answer, history = []) {
    const historyText = history
        .map((h) => `${h.role === "user" ? "Candidate" : "AI"}: ${h.content}`)
        .join("\n");

    const prompt = `
You are an AI interviewer.

Candidate's Answer:
"${answer}"

Based on the following interview history:
${historyText}

Now:
1. Give some small respose to candiate but not too long
2. Ask the next interview question.

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
