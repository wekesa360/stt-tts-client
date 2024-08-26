import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const APP_ID = process.env.TTS_APP_ID;
const APP_KEY = process.env.TTS_APP_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint');

  if (!endpoint || (endpoint !== 'stt' && endpoint !== 'tts')) {
    return NextResponse.json({ message: 'Invalid endpoint' }, { status: 400 });
  }

  const url = `https://stt-tts.onrender.com/${endpoint}`;

  try {
    const formData = new FormData();
    const buffer = await req.arrayBuffer();
    formData.append('file', Buffer.from(buffer), {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-App-ID': APP_ID,
        'X-App-Key': APP_KEY,
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    console.error('Error response:', error.response?.data);
    return NextResponse.json(
      error.response?.data || { message: 'Internal Server Error' },
      { status: error.response?.status || 500 }
    );
  }
}