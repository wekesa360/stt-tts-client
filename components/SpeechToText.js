"use client"
import React, { useState } from 'react';
import { runPython } from '../lib/pyodide';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    // Stop the recognition
  };

  const processTranscript = async () => {
    try {
      const result = await runPython(`
def process_text(text):
    return text.upper()

result = process_text("${transcript}")
result
      `);
      setTranscript(result);
    } catch (error) {
      console.error('Error processing transcript:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full px-4 py-2 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <div className="bg-gray-100 p-4 rounded-md">
        <p className="text-gray-800">{transcript || 'Start speaking...'}</p>
      </div>
      <button
        onClick={processTranscript}
        className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Process Transcript
      </button>
    </div>
  );
};

export default SpeechToText;