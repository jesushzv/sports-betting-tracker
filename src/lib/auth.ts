import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { prisma } from './prisma'

// Helper function to get the correct NEXTAUTH_URL
// function getAuthUrl(): string {
//   if (process.env.NEXTAUTH_URL) {
//     return process.env.NEXTAUTH_URL
//   }
//   
//   // Fallback for development
//   if (process.env.NODE_ENV === 'development') {
//     return 'http://localhost:3000'
//   }
//   
//   // For production, use Vercel URL or throw error
//   throw new Error('NEXTAUTH_URL environment variable is required')
// }

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
    async signIn({ user, account, isNewUser }) {
      console.log('OAuth sign in successful:', { 
        provider: account?.provider, 
        userId: user.id, 
        isNewUser 
      })
    },
    async signOut({ token }) {
      console.log('User signed out:', { userId: token?.sub })
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
}
