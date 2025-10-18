'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function DemoModeBanner() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Only show banner for unauthenticated users
    if (!session && !isDismissed) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [session, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    // Store dismissal in localStorage to persist across page reloads
    localStorage.setItem('demo-banner-dismissed', 'true')
  }

  const handleSignUp = () => {
    router.push('/login')
  }

  const handleSignIn = () => {
    router.push('/login')
  }

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('demo-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-bold">🎯</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                You&apos;re viewing demo data - Sign up to track your own bets!
              </p>
              <p className="text-xs opacity-90">
                Get started with your own picks, analytics, and bankroll management
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignIn}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={handleSignUp}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              Sign Up Free
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
