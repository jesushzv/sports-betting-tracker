"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Stats {
  overview: {
    totalPicks: number
    pendingPicks: number
    wonPicks: number
    lostPicks: number
    pushPicks: number
    settledPicks: number
    winRate: number
    totalStaked: number
    totalWinnings: number
    totalLosses: number
    netProfit: number
    roi: number
  }
  recentPicks: Array<{
    id: string
    sport: string
    betType: string
    description: string
    odds: number
    stake: number
    potentialWin: number
    status: string
    gameDate: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WON":
        return <Badge className="bg-green-500">Won</Badge>
      case "LOST":
        return <Badge variant="destructive">Lost</Badge>
      case "PUSH":
        return <Badge variant="secondary">Push</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name || "User"}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/picks/add">Add Pick</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/parlays/builder">Build Parlay</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/picks">View All Picks</Link>
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Picks</CardTitle>
                <span className="text-2xl">🎯</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalPicks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.pendingPicks} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <span className="text-2xl">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.winRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.wonPicks}W - {stats.overview.lostPicks}L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <span className="text-2xl">💰</span>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.overview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.overview.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.roi.toFixed(1)}% ROI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
                <span className="text-2xl">💸</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.overview.totalStaked)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.overview.totalWinnings)} won
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Picks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Picks</CardTitle>
              <CardDescription>
                Your latest betting picks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentPicks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sport</TableHead>
                      <TableHead>Pick</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentPicks.map((pick) => (
                      <TableRow key={pick.id}>
                        <TableCell>
                          <Badge variant="outline">{pick.sport}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pick.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {pick.betType.replace("_", " ")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pick.odds > 0 ? "+" : ""}{pick.odds}
                        </TableCell>
                        <TableCell>{formatCurrency(pick.stake)}</TableCell>
                        <TableCell>{getStatusBadge(pick.status)}</TableCell>
                        <TableCell>{formatDate(pick.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No picks yet!</p>
                  <Button asChild>
                    <Link href="/picks/add">Add Your First Pick</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/picks/add">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">➕</span>
                    Add Pick
                  </CardTitle>
                  <CardDescription>
                    Record a new betting pick
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/parlays/builder">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Build Parlay
                  </CardTitle>
                  <CardDescription>
                    Create multi-leg parlay bets
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/picks">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    All Picks
                  </CardTitle>
                  <CardDescription>
                    View and manage all your picks
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/parlays">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎲</span>
                    All Parlays
                  </CardTitle>
                  <CardDescription>
                    View and manage all your parlays
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/bankroll">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Bankroll
                  </CardTitle>
                  <CardDescription>
                    Manage deposits and withdrawals
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/analytics">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed performance analysis
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/profile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
