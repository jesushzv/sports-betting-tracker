import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { prisma } from './prisma'

// Helper function to get the correct NEXTAUTH_URL
function getAuthUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // For production, use Vercel URL or throw error
  throw new Error('NEXTAUTH_URL environment variable is required')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        ;(session.user as { id: string }).id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('OAuth sign in successful:', { 
        provider: account?.provider, 
        userId: user.id, 
        isNewUser 
      })
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.sub })
    },
    async error({ error, provider }) {
      console.error('OAuth error:', { error: error.message, provider })
      
      // Log specific redirect URI mismatch errors
      if (error.message?.includes('redirect_uri_mismatch')) {
        const authUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        console.error(`
🚨 OAuth Redirect URI Mismatch Error 🚨
Provider: ${provider}
Error: ${error.message}

To fix this:
1. Check your ${provider} OAuth app settings
2. Ensure the redirect URI is set to: ${authUrl}/api/auth/callback/${provider}
3. Verify NEXTAUTH_URL environment variable is set to: ${process.env.NEXTAUTH_URL || 'NOT SET'}

Current expected redirect URIs should be:
- Development: http://localhost:3000/api/auth/callback/${provider}
- Production: ${authUrl}/api/auth/callback/${provider}
        `)
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
}
