import React, { useState } from "react";
import ChatBox from "./ChatBox";

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating action button with enhanced styling */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full 
          bg-gradient-to-r from-blue-600 to-purple-600 text-white 
          shadow-lg hover:shadow-xl hover:scale-110 
          focus:outline-none focus:ring-4 focus:ring-blue-300 
          flex items-center justify-center text-xl
          transition-all duration-300 ease-in-out
          animate-pulse hover:animate-none
          ${open ? "rotate-45" : "hover:rotate-12"}`}
      >
        {open ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat panel with improved styling and animations */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-96 max-w-[90vw] h-[540px] 
          bg-white border border-gray-200 rounded-2xl shadow-2xl 
          overflow-hidden flex flex-col
          transform transition-all duration-300 ease-out
          animate-in slide-in-from-bottom-8 fade-in
          backdrop-blur-sm`}
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header with gradient */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">Emergency Assistant</h3>
            </div>
            <button
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors duration-200"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatBox />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
