import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const APP_ID = process.env.NEXT_PUBLIC_TTS_APP_ID;
const APP_KEY = process.env.NEXT_PUBLIC_TTS_APP_KEY;

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
    const formData = new FormData();
    const buffer = await req.arrayBuffer();
    formData.append('file', Buffer.from(buffer), {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });

    console.log('Sending request to STT/TTS service');
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-App-ID': APP_ID,
        'X-App-Key': APP_KEY,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log('Received response from STT/TTS service');
    return NextResponse.json(response.data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}