import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition({ onResult }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onResult(result);
    };

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onerror = (e) => console.error("Speech recognition error:", e);

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => recognitionRef.current?.start();
  const stopListening = () => recognitionRef.current?.stop();
  const resetTranscript = () => setTranscript("");

  return { transcript, listening, startListening, stopListening, resetTranscript };
}
