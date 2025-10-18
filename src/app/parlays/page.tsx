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
}

interface ParlayLeg {
  id: string
  pick: Pick
}

interface Parlay {
  id: string
  totalOdds: number
  stake: number
  potentialWin: number
  status: string
  createdAt: string
  settledAt?: string
  legs: ParlayLeg[]
}

interface ParlaysResponse {
  parlays: Parlay[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ParlaysPage() {
  const { data: session, status } = useSession()
  const [parlays, setParlays] = useState<Parlay[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
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

  const fetchParlays = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      params.append('page', filters.page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/parlays?${params}`)
      if (response.ok) {
        const data: ParlaysResponse = await response.json()
        setParlays(data.parlays)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching parlays:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // Fetch parlays for both authenticated users and demo mode
    fetchParlays()
  }, [fetchParlays])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusUpdate = async (parlayId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/parlays/${parlayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the parlays list
        fetchParlays()
      } else {
        alert('Failed to update parlay status')
      }
    } catch (error) {
      console.error('Error updating parlay:', error)
      alert('Failed to update parlay status')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading parlays...</p>
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
          <h1 className="text-3xl font-bold">All Parlays</h1>
          <p className="text-muted-foreground">
            {session 
              ? 'Manage and track all your parlay bets'
              : 'Demo Parlays - Sign up to create your own parlays!'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/parlays/builder">Build Parlay</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/picks">View Picks</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label>Status</label>
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
                onClick={() => setFilters({ status: '', page: 1 })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parlays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Parlays ({pagination.total})</CardTitle>
          <CardDescription>
            Showing {parlays.length} of {pagination.total} parlays
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parlays.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Legs</TableHead>
                    <TableHead>Total Odds</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Potential Win</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parlays.map(parlay => (
                    <TableRow key={parlay.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {parlay.legs.length} leg
                            {parlay.legs.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {parlay.legs.map((leg, index) => (
                              <div key={leg.id}>
                                {index + 1}. {leg.pick.description} (
                                {leg.pick.sport})
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {parlay.totalOdds > 0 ? '+' : ''}
                        {parlay.totalOdds.toFixed(0)}
                      </TableCell>
                      <TableCell>{formatCurrency(parlay.stake)}</TableCell>
                      <TableCell>
                        {formatCurrency(parlay.potentialWin)}
                      </TableCell>
                      <TableCell>{getStatusBadge(parlay.status)}</TableCell>
                      <TableCell>{formatDate(parlay.createdAt)}</TableCell>
                      <TableCell>
                        {parlay.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(parlay.id, 'WON')
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              Win
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(parlay.id, 'LOST')
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              Loss
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(parlay.id, 'PUSH')
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
              <p className="text-muted-foreground mb-4">No parlays found!</p>
              <Button asChild>
                <Link href="/parlays/builder">Build Your First Parlay</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
