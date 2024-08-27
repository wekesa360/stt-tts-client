"use client";

import React from 'react';
import SpeechToText from '@/components/SpeechToText';
import TextToSpeech from '@/components/TextToSpeech';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-center mb-6">STT/TTS Demo</h1>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-xl font-bold text-gray-900">Speech to Text</h2>
                <SpeechToText />
              </div>
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-xl font-bold text-gray-900">Text to Speech</h2>
                <TextToSpeech />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
