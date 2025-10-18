'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Pick {
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
  settledAt?: string
}

interface PicksResponse {
  picks: Pick[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function PicksPage() {
  const { data: session, status } = useSession()
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sport: '',
    betType: '',
    status: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // Remove authentication guard - allow demo mode

  const fetchPicks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.sport) params.append('sport', filters.sport)
      if (filters.betType) params.append('betType', filters.betType)
      if (filters.status) params.append('status', filters.status)
      params.append('page', filters.page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/picks?${params}`)
      if (response.ok) {
        const data: PicksResponse = await response.json()
        setPicks(data.picks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching picks:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // Fetch picks for both authenticated users and demo mode
    fetchPicks()
  }, [fetchPicks])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusUpdate = async (pickId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/picks/${pickId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the picks list
        fetchPicks()
      } else {
        alert('Failed to update pick status')
      }
    } catch (error) {
      console.error('Error updating pick:', error)
      alert('Failed to update pick status')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading picks...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WON':
        return <Badge className="bg-green-500">Won</Badge>
      case 'LOST':
        return <Badge variant="destructive">Lost</Badge>
      case 'PUSH':
        return <Badge variant="secondary">Push</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">All Picks</h1>
          <p className="text-muted-foreground">
            {session 
              ? 'Manage and track all your betting picks'
              : 'Demo Picks - Sign up to track your own picks!'
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/picks/add">Add Pick</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Sport</Label>
              <Select
                value={filters.sport}
                onValueChange={value => handleFilterChange('sport', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sports</SelectItem>
                  <SelectItem value="NFL">NFL</SelectItem>
                  <SelectItem value="NBA">NBA</SelectItem>
                  <SelectItem value="MLB">MLB</SelectItem>
                  <SelectItem value="NHL">NHL</SelectItem>
                  <SelectItem value="UFC">UFC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bet Type</Label>
              <Select
                value={filters.betType}
                onValueChange={value => handleFilterChange('betType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="SPREAD">Spread</SelectItem>
                  <SelectItem value="MONEYLINE">Moneyline</SelectItem>
                  <SelectItem value="OVER_UNDER">Over/Under</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={value => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="PUSH">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ sport: '', betType: '', status: '', page: 1 })
                }
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Picks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Picks ({pagination.total})</CardTitle>
          <CardDescription>
            Showing {picks.length} of {pagination.total} picks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {picks.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sport</TableHead>
                    <TableHead>Pick</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Potential Win</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Game Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picks.map(pick => (
                    <TableRow key={pick.id}>
                      <TableCell>
                        <Badge variant="outline">{pick.sport}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pick.description}</div>
                          <div className="text-muted-foreground text-sm">
                            {pick.betType.replace('_', ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pick.odds > 0 ? '+' : ''}
                        {pick.odds}
                      </TableCell>
                      <TableCell>{formatCurrency(pick.stake)}</TableCell>
                      <TableCell>{formatCurrency(pick.potentialWin)}</TableCell>
                      <TableCell>{getStatusBadge(pick.status)}</TableCell>
                      <TableCell>{formatDate(pick.gameDate)}</TableCell>
                      <TableCell>
                        {pick.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(pick.id, 'WON')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Win
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(pick.id, 'LOST')
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              Loss
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(pick.id, 'PUSH')
                              }
                            >
                              Push
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No picks found!</p>
              <Button asChild>
                <Link href="/picks/add">Add Your First Pick</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
