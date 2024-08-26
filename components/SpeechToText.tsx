"use client";
import React, { useState, useEffect, useCallback } from 'react'

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('')
  const [isListening, setIsListening] = useState<boolean>(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const newRecognition = new SpeechRecognition()
      newRecognition.continuous = true
      newRecognition.interimResults = true
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        setTranscript(prevTranscript => prevTranscript + finalTranscript);
      }
      newRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'network') {
          setError("Network error occurred. Please check your internet connection and try again.");
        } else {
          setError(`Error: ${event.error}. Please try again.`);
        }
        setIsListening(false);
      }
      newRecognition.onend = () => {
        setIsListening(false);
      }
      setRecognition(newRecognition)
    } else {
      setError('Your browser does not support speech recognition.');
    }
  }, [])

  const toggleListening = useCallback(() => {
    setError(null);  // Clear any previous errors
    if (isListening) {
      recognition?.stop()
    } else {
      try {
        recognition?.start()
        setTranscript('')
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('Failed to start speech recognition. Please try again.');
        return;
      }
    }
    setIsListening(!isListening)
  }, [isListening, recognition])

  const processTranscript = useCallback(() => {
    setTranscript(prevTranscript => prevTranscript.toUpperCase())
  }, [])

  const retryRecognition = useCallback(() => {
    setError(null);
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Error retrying recognition:', error);
        setError('Failed to restart speech recognition. Please try again.');
      }
    }
  }, [recognition]);

  return (
    <div className="space-y-4">
      <button
        onClick={toggleListening}
        className={`w-full px-4 py-2 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <div className="bg-gray-100 p-4 rounded-md min-h-[100px]">
        {error ? (
          <div>
            <p className="text-red-500">{error}</p>
            <button
              onClick={retryRecognition}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Retry
            </button>
          </div>
        ) : (
          <p className="text-gray-800">{transcript || 'Start speaking...'}</p>
        )}
      </div>
      <button
        onClick={processTranscript}
        className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Process Transcript
      </button>
    </div>
  )
}

export default SpeechToText