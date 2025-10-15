'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

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

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="py-12 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          Track Your Sports Bets
          <span className="text-primary block">Like a Pro</span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
          Professional and amateur sports bettors use BetTracker to maintain
          accurate records, track performance, and manage their bankroll
          effectively.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" className="px-8 text-lg">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="px-8 text-lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-8 py-12 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Analytics & Insights
              <Badge variant="secondary">Pro</Badge>
            </CardTitle>
            <CardDescription>
              Track your performance with detailed analytics, win rates by
              sport, and profit/loss trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• Win rate by sport and bet type</li>
              <li>• Profit/loss tracking over time</li>
              <li>• ROI calculations and trends</li>
              <li>• Best and worst performing periods</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Pick Management
              <Badge>Core</Badge>
            </CardTitle>
            <CardDescription>
              Record and track all your betting picks with support for spreads,
              moneylines, totals, and parlays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• NFL, NBA, MLB, NHL, UFC support</li>
              <li>• Spread, moneyline, over/under bets</li>
              <li>• Parlay builder with odds calculation</li>
              <li>• Automatic win/loss tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Bankroll Management
              <Badge>Core</Badge>
            </CardTitle>
            <CardDescription>
              Keep track of your bankroll with deposits, withdrawals, and
              transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>• Starting bankroll setup</li>
              <li>• Deposit and withdrawal tracking</li>
              <li>• Transaction history</li>
              <li>• Bankroll growth visualization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sports Support */}
      <div className="py-12 text-center">
        <h2 className="mb-8 text-3xl font-bold">Supported Sports</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['NFL', 'NBA', 'MLB', 'NHL', 'UFC'].map(sport => (
            <Badge key={sport} variant="outline" className="px-6 py-2 text-lg">
              {sport}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground mt-4">More sports coming soon!</p>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 rounded-lg py-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Start Tracking?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of bettors who trust BetTracker to keep their records
          straight.
        </p>
        <Button size="lg" className="px-8 text-lg">
          Sign Up Free
        </Button>
      </div>
    </div>
  )
}
