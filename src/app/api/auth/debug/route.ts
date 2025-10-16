import { NextResponse } from 'next/server'

// This endpoint helps debug OAuth configuration issues
export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    computedBaseUrl: baseUrl,
    redirectUris: {
      google: `${baseUrl}/api/auth/callback/google`,
      discord: `${baseUrl}/api/auth/callback/discord`,
    },
    configuredOAuth: {
      google: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      },
      discord: {
        hasClientId: !!process.env.DISCORD_CLIENT_ID,
        hasClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
      },
    },
    instructions: {
      google: [
        '1. Go to Google Cloud Console (https://console.cloud.google.com/)',
        '2. Select your project',
        '3. Go to APIs & Services > Credentials',
        '4. Find your OAuth 2.0 Client ID',
        '5. Add this URI to Authorized redirect URIs:',
        `   ${baseUrl}/api/auth/callback/google`,
      ],
      discord: [
        '1. Go to Discord Developer Portal (https://discord.com/developers/applications)',
        '2. Select your application',
        '3. Go to OAuth2 > General',
        '4. Add this URI to Redirects:',
        `   ${baseUrl}/api/auth/callback/discord`,
      ],
    },
  })
}
