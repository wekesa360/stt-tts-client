"use client"
import React, { useState } from 'react';
import { runPython } from '../lib/pyodide';

const TextToSpeech = () => {
  const [text, setText] = useState('');

  const speak = async () => {
    try {
      const processedText = await runPython(`
def process_text(text):
    return text.lower()

result = process_text("${text}")
result
      `);

      const utterance = new SpeechSynthesisUtterance(processedText);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error processing text:', error);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak"
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        rows="4"
      />
      <button
        onClick={speak}
        className="w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        Speak
      </button>
    </div>
  );
};

export default TextToSpeech;