"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let audioChunks: Blob[] = [];

    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const wavBlob = await convertToWav(audioBlob);
          setAudioBlob(wavBlob);
          audioChunks = [];

          const audioUrl = URL.createObjectURL(wavBlob);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
          }
        };
      } catch (err: any) {
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

  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        const sample = Math.max(-1, Math.min(1, channel[j]));
        view.setInt16(offset + (j * blockAlign) + (i * bytesPerSample), sample * 0x7FFF, true);
      }
    }

    return arrayBuffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

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
      const response = await axios.post('/api/service?endpoint=stt', audioBlob, {
        headers: {
          'Content-Type': 'audio/wav',
        },
      });

      setTranscript(response.data.text);
    } catch (error: any) {
      setError(`Failed to process audio: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={toggleListening}
        className={`w-full px-4 py-2 text-white font-bold rounded-md transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <div className="bg-gray-100 p-4 rounded-md min-h-[100px]">
        <textarea
          className="w-full h-full bg-transparent resize-none outline-none"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcribed text will appear here..."
          readOnly
        />
      </div>
      <button
        onClick={processTranscript}
        className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
      >
        Transcribe Audio
      </button>
      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <audio ref={audioRef} controls className="w-full" />
    </div>
  );
};

export default SpeechToText;