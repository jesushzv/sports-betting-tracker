"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Track Your Sports Bets
          <span className="text-primary block">Like a Pro</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Professional and amateur sports bettors use BetTracker to maintain accurate records, 
          track performance, and manage their bankroll effectively.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Learn More
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Analytics & Insights
              <Badge variant="secondary">Pro</Badge>
            </CardTitle>
            <CardDescription>
              Track your performance with detailed analytics, win rates by sport, and profit/loss trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
              Record and track all your betting picks with support for spreads, moneylines, totals, and parlays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
              Keep track of your bankroll with deposits, withdrawals, and transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
        <h2 className="text-3xl font-bold mb-8">Supported Sports</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["NFL", "NBA", "MLB", "NHL", "UFC"].map((sport) => (
            <Badge key={sport} variant="outline" className="text-lg px-6 py-2">
              {sport}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground mt-4">
          More sports coming soon!
        </p>
      </div>

      {/* CTA Section */}
      <div className="py-12 text-center bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Tracking?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of bettors who trust BetTracker to keep their records straight.
        </p>
        <Button size="lg" className="text-lg px-8">
          Sign Up Free
        </Button>
      </div>
    </div>
  )
}
