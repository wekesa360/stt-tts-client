import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FormData } from 'formdata-node';

const APP_ID = process.env.NEXT_PUBLIC_TTS_APP_ID;
const APP_KEY = process.env.NEXT_PUBLIC_TTS_APP_KEY;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('Received request to /api/service');
  
  const endpoint = req.nextUrl.searchParams.get('endpoint');
  console.log('Endpoint:', endpoint);

  if (!endpoint || (endpoint !== 'stt' && endpoint !== 'tts')) {
    console.log('Invalid endpoint');
    return NextResponse.json({ message: 'Invalid endpoint' }, { status: 400 });
  }

  const url = `https://stt-tts.onrender.com/${endpoint}`;
  console.log('Target URL:', url);

  try {
    let data;
    let headers: Record<string, string> = {
      'X-App-ID': APP_ID!,
      'X-App-Key': APP_KEY!,
    };

    if (endpoint === 'stt') {
      const formData = new FormData();
      const buffer = await req.arrayBuffer();
      formData.append('file', new Blob([buffer]), 'audio.wav');
      data = formData;
      headers = {
        ...headers,
        ...formData.headers,
      };
    } else if (endpoint === 'tts') {
      const json = await req.json();
      data = json;
      headers['Content-Type'] = 'application/json';
    }

    console.log('Sending request to STT/TTS service');
    const response = await axios.post(url, data, {
      headers: headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000, // 30 seconds timeout
    });

    console.log('Received response from STT/TTS service');
    return NextResponse.json(response.data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-ID, X-App-Key',
      }
    });
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    console.error('Error response:', error.response?.data);
    return NextResponse.json(
      error.response?.data || { message: 'Internal Server Error' },
      { 
        status: error.response?.status || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-ID, X-App-Key',
        }
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-ID, X-App-Key',
    },
  });
}