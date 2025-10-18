'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsData {
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
  sportStats: Array<{
    sport: string
    totalPicks: number
    won: number
    lost: number
    pending: number
    winRate: number
    staked: number
    winnings: number
    losses: number
    netProfit: number
    roi: number
  }>
  betTypeStats: Array<{
    betType: string
    totalPicks: number
    won: number
    lost: number
    pending: number
    winRate: number
    staked: number
    winnings: number
    losses: number
    netProfit: number
    roi: number
  }>
  balanceHistory: Array<{
    date: string
    balance: number
    amount: number
    type: string
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Remove authentication guard - allow demo mode

  useEffect(() => {
    // Fetch analytics for both authenticated users and demo mode
    fetchAnalytics()
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Allow demo mode - no need to return null for unauthenticated users

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!data) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  // Prepare data for charts
  const sportChartData = data.sportStats.map(stat => ({
    sport: stat.sport,
    picks: stat.totalPicks,
    winRate: stat.winRate,
    netProfit: stat.netProfit,
  }))

  const winLossData = [
    { name: 'Won', value: data.overview.wonPicks, color: '#22c55e' },
    { name: 'Lost', value: data.overview.lostPicks, color: '#ef4444' },
    { name: 'Push', value: data.overview.pushPicks, color: '#6b7280' },
    { name: 'Pending', value: data.overview.pendingPicks, color: '#3b82f6' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          {session 
            ? 'Detailed performance analysis and insights'
            : 'Demo Analytics - Sign up to track your own performance!'
          }
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.winRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {data.overview.wonPicks}W - {data.overview.lostPicks}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${data.overview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(data.overview.netProfit)}
            </div>
            <p className="text-muted-foreground text-xs">
              {data.overview.roi.toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Picks</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalPicks}</div>
            <p className="text-muted-foreground text-xs">
              {data.overview.settledPicks} settled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <span className="text-2xl">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overview.totalStaked)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(data.overview.totalWinnings)} won
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Win/Loss Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pick Results</CardTitle>
            <CardDescription>
              Distribution of your pick outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance by Sport */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Sport</CardTitle>
            <CardDescription>Win rate and picks by sport</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sportChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sport" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="winRate" fill="#8884d8" name="Win Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Sport Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Sport</CardTitle>
            <CardDescription>Detailed breakdown by sport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sportStats.map(stat => (
                <div
                  key={stat.sport}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="font-medium">{stat.sport}</div>
                    <div className="text-muted-foreground text-sm">
                      {stat.totalPicks} picks • {stat.winRate.toFixed(1)}% win
                      rate
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${stat.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(stat.netProfit)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.roi.toFixed(1)}% ROI
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bet Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Bet Type</CardTitle>
            <CardDescription>Detailed breakdown by bet type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.betTypeStats.map(stat => (
                <div
                  key={stat.betType}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="font-medium">
                      {stat.betType.replace('_', ' ')}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.totalPicks} picks • {stat.winRate.toFixed(1)}% win
                      rate
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${stat.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(stat.netProfit)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.roi.toFixed(1)}% ROI
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance History Chart */}
      {data.balanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bankroll History</CardTitle>
            <CardDescription>Your bankroll balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={value => `$${value}`} />
                <Tooltip
                  labelFormatter={value => formatDate(value)}
                  formatter={value => [
                    formatCurrency(Number(value)),
                    'Balance',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
