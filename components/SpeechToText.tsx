"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const SpeechToTextAndTextToSpeech = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let audioChunks: Blob[] = [];

    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
          audioChunks = [];
        };
      } catch (err: any) {
        console.error('Error accessing microphone:', err);
        setError('Failed to access microphone. Please check your permissions and try again.');
      }
    };

    setupMediaRecorder();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    setError(null);
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
        setTranscript('');
      }
    }
    setIsListening(!isListening);
  }, [isListening]);

  const processTranscript = async () => {
    if (!audioBlob) {
      setError('No audio recorded. Please speak and stop recording before transcribing.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
  
      console.log('Sending request to /api/service');
      const response = await axios.post('/api/service?endpoint=stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Received response:', response.data);
      setTranscript(response.data.text);
    } catch (error: any) {
      console.error('Error processing audio:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      setError(`Failed to process audio: ${error.response?.data?.detail || error.message}`);
    }
  };

  const textToSpeech = useCallback(async () => {
    if (!transcript) {
      setError('No text to convert. Please speak or type something first.');
      return;
    }
  
    try {
      const response = await axios.post(
        '/api/service?endpoint=tts',
        { text: transcript },
        {
          responseType: 'arraybuffer',
        }
      );
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(response.data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (err) {
      console.error('Error converting text to speech:', err);
      setError('Failed to convert text to speech. Please try again.');
    }
  }, [transcript]);


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
          <p className="text-red-500">{error}</p>
        ) : (
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Start speaking or type here..."
          />
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={processTranscript}
          className="flex-1 px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Transcribe Audio
        </button>
        <button
          onClick={textToSpeech}
          className="flex-1 px-4 py-2 bg-purple-500 text-white font-bold rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Speak Text
        </button>
      </div>
    </div>
  );
};

export default SpeechToTextAndTextToSpeech;