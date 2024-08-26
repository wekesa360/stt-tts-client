/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
      },
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://stt-tts.onrender.com/:path*',
        },
      ]
    },
  }
  
  module.exports = nextConfig