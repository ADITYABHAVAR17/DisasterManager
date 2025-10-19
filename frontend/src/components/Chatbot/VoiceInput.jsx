import React, { useState } from "react";

const VoiceInput = ({ onSend }) => {
  const [recording, setRecording] = useState(false);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onSend(transcript);
    };

    recognition.onend = () => setRecording(false);
    setRecording(true);
  };

  return (
    <button
      className={`send-btn ${recording ? "bg-red-500 hover:bg-red-600" : ""}`}
      onClick={handleVoiceInput}
      title="Use your voice"
      disabled={recording}
    >
      {recording ? (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          speak
        </span>
      ) : (
        "speak"
      )}
    </button>
  );
};

export default VoiceInput;
