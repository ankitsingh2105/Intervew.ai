import React, { useEffect, useState } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { speak } from "../utils/speak";

export default function InterviewLoop() {
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAIResponding, setIsAIResponding] = useState(false);

  const { transcript, listening, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: async (text) => {
      console.log("User answered:", text);
      stopListening();
      setHistory((h) => [...h, { role: "user", content: text }]);
      setIsAIResponding(true);

      const res = await fetch("http://localhost:5000/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text, history }),
      });

      const { reply } = await res.json();
      setHistory((h) => [...h, { role: "assistant", content: reply }]);

      speak(reply, () => {
        resetTranscript();
        setIsAIResponding(false);
        startListening(); // continue loop
      });
    },
  });

  const handleStart = () => {
    setStarted(true);
    speak("Welcome to intervew.ai. Let's begin your mock interview. Tell me about yourself.", () => {
      startListening();
    });
  };

  return (
    <div>
      {!started ? (
        <button onClick={handleStart}>🎙️ Start Interview</button>
      ) : (
        <>
          <div style={{ marginTop: "1rem" }}>
            {history.map((msg, i) => (
              <div key={i} style={{ margin: "0.5rem 0" }}>
                <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
              </div>
            ))}
            {listening && !isAIResponding && <p>🎤 Listening...</p>}
          </div>
        </>
      )}
    </div>
  );
}
