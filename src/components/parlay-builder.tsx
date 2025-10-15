'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
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
}

interface ParlayBuilderProps {
  onSuccess?: () => void
}

export function ParlayBuilder({ onSuccess }: ParlayBuilderProps) {
  const router = useRouter()
  const [availablePicks, setAvailablePicks] = useState<Pick[]>([])
  const [selectedPicks, setSelectedPicks] = useState<Pick[]>([])
  const [stake, setStake] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailablePicks()
  }, [])

  const fetchAvailablePicks = async () => {
    try {
      const response = await fetch('/api/picks?status=PENDING&limit=100')
      if (response.ok) {
        const data = await response.json()
        setAvailablePicks(data.picks)
      }
    } catch (error) {
      console.error('Error fetching picks:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePickSelection = (pick: Pick) => {
    setSelectedPicks(prev => {
      const isSelected = prev.some(p => p.id === pick.id)
      if (isSelected) {
        return prev.filter(p => p.id !== pick.id)
      } else {
        return [...prev, pick]
      }
    })
  }

  const calculateParlayOdds = () => {
    if (selectedPicks.length < 2) return 0

    let totalOdds = 1
    for (const pick of selectedPicks) {
      const decimalOdds =
        pick.odds > 0 ? pick.odds / 100 + 1 : 100 / Math.abs(pick.odds) + 1
      totalOdds *= decimalOdds
    }

    // Convert back to American odds
    const americanOdds =
      totalOdds >= 2 ? (totalOdds - 1) * 100 : -100 / (totalOdds - 1)

    return americanOdds
  }

  const calculatePotentialWin = () => {
    if (selectedPicks.length < 2 || !stake) return 0

    const stakeAmount = parseFloat(stake)
    if (isNaN(stakeAmount) || stakeAmount <= 0) return 0

    let totalOdds = 1
    for (const pick of selectedPicks) {
      const decimalOdds =
        pick.odds > 0 ? pick.odds / 100 + 1 : 100 / Math.abs(pick.odds) + 1
      totalOdds *= decimalOdds
    }

    return (totalOdds - 1) * stakeAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPicks.length < 2) {
      alert('Please select at least 2 picks for your parlay')
      return
    }

    if (!stake || parseFloat(stake) <= 0) {
      alert('Please enter a valid stake amount')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/parlays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickIds: selectedPicks.map(pick => pick.id),
          stake: parseFloat(stake),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create parlay')
      }

      // Reset form
      setSelectedPicks([])
      setStake('')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/parlays')
      }
    } catch (error) {
      console.error('Error creating parlay:', error)
      alert('Failed to create parlay. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading picks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Parlay Builder</h1>
        <p className="text-muted-foreground">
          Select multiple picks to create a parlay bet
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Available Picks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Picks ({availablePicks.length})</CardTitle>
              <CardDescription>
                Select at least 2 pending picks for your parlay
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availablePicks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Pick</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePicks.map(pick => {
                      const isSelected = selectedPicks.some(
                        p => p.id === pick.id
                      )
                      return (
                        <TableRow
                          key={pick.id}
                          className={`cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                          onClick={() => togglePickSelection(pick)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePickSelection(pick)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pick.sport}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {pick.description}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {pick.betType.replace('_', ' ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {pick.odds > 0 ? '+' : ''}
                            {pick.odds}
                          </TableCell>
                          <TableCell>{formatDate(pick.gameDate)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No pending picks available!
                  </p>
                  <Button asChild>
                    <a href="/picks/add">Add Some Picks</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Parlay Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Parlay Summary</CardTitle>
              <CardDescription>
                {selectedPicks.length} leg
                {selectedPicks.length !== 1 ? 's' : ''} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedPicks.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Selected Picks:</h4>
                    <div className="space-y-2">
                      {selectedPicks.map(pick => (
                        <div
                          key={pick.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {pick.description}
                            </div>
                            <div className="text-muted-foreground">
                              {pick.sport} • {pick.betType.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div>
                              {pick.odds > 0 ? '+' : ''}
                              {pick.odds}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">Total Odds:</span>
                      <span className="font-bold">
                        {calculateParlayOdds() > 0 ? '+' : ''}
                        {calculateParlayOdds().toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake">Stake ($)</Label>
                  <Input
                    id="stake"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 50.00"
                    value={stake}
                    onChange={e => setStake(e.target.value)}
                    required
                  />
                </div>

                {stake && selectedPicks.length >= 2 && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Potential Winnings:
                      </span>
                      <Badge variant="secondary" className="text-lg">
                        {formatCurrency(calculatePotentialWin())}
                      </Badge>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={selectedPicks.length < 2 || !stake || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Creating Parlay...' : 'Create Parlay'}
                </Button>
              </form>

              {selectedPicks.length < 2 && (
                <p className="text-muted-foreground text-center text-sm">
                  Select at least 2 picks to create a parlay
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
