"use client";

import React, { useState, useCallback } from 'react';
import axios from 'axios';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const speakBrowser = useCallback(() => {
    if (!text) {
      setError('Please enter some text to convert to speech.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
    window.speechSynthesis.speak(utterance);
    setError(null);
  }, [text]);

  const speakServer = useCallback(async () => {
    if (!text) {
      setError('Please enter some text to convert to speech.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/service?endpoint=tts',
        { text: text }
      );

      let base64Audio;
      if (typeof response.data === 'object' && response.data.audio) {
        base64Audio = response.data.audio;
      } else if (typeof response.data === 'string') {
        base64Audio = response.data;
      } else {
        throw new Error('Invalid response format: audio data is missing or in unexpected format');
      }

      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = bytes.buffer;

      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        setError(`Audio playback error: ${e.message}`);
      });
      setError(null);
    } catch (err: any) {
      setError(`Failed to convert text to speech: ${err.message}`);
    }
  }, [text]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak"
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        rows={4}
      />
      <div className="flex space-x-4">
        <button
          onClick={speakBrowser}
          className="flex-1 px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
        >
          Speak (Browser)
        </button>
        <button
          onClick={speakServer}
          className="flex-1 px-4 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors"
        >
          Speak (Server)
        </button>
      </div>
      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;