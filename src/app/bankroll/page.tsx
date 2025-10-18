'use client'

import { useSession } from 'next-auth/react'
import { BankrollManager } from '@/components/bankroll-manager'

export default function BankrollPage() {
  const { status } = useSession()

  // Remove authentication guard - allow demo mode

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return <BankrollManager />
}
