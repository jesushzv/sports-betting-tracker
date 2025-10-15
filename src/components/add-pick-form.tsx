"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const SPORTS = [
  { value: "NFL", label: "NFL" },
  { value: "NBA", label: "NBA" },
  { value: "MLB", label: "MLB" },
  { value: "NHL", label: "NHL" },
  { value: "UFC", label: "UFC" },
]

const BET_TYPES = [
  { value: "SPREAD", label: "Spread" },
  { value: "MONEYLINE", label: "Moneyline" },
  { value: "OVER_UNDER", label: "Over/Under" },
]

interface AddPickFormProps {
  onSuccess?: () => void
}

export function AddPickForm({ onSuccess }: AddPickFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    sport: "",
    betType: "",
    description: "",
    odds: "",
    stake: "",
    gameDate: "",
  })
  const [potentialWin, setPotentialWin] = useState(0)

  const calculatePotentialWin = (odds: string, stake: string) => {
    const oddsNum = parseFloat(odds)
    const stakeNum = parseFloat(stake)
    
    if (isNaN(oddsNum) || isNaN(stakeNum) || stakeNum <= 0) {
      setPotentialWin(0)
      return
    }

    let win: number
    if (oddsNum > 0) {
      // Positive odds: (odds / 100) * stake
      win = (oddsNum / 100) * stakeNum
    } else {
      // Negative odds: (100 / |odds|) * stake
      win = (100 / Math.abs(oddsNum)) * stakeNum
    }
    
    setPotentialWin(win)
  }

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Recalculate potential win when odds or stake changes
    if (field === "odds" || field === "stake") {
      calculatePotentialWin(
        field === "odds" ? value : newFormData.odds,
        field === "stake" ? value : newFormData.stake
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/picks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          odds: parseFloat(formData.odds),
          stake: parseFloat(formData.stake),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create pick")
      }

      // Reset form
      setFormData({
        sport: "",
        betType: "",
        description: "",
        odds: "",
        stake: "",
        gameDate: "",
      })
      setPotentialWin(0)

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/picks")
      }
    } catch (error) {
      console.error("Error creating pick:", error)
      alert("Failed to create pick. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Pick</CardTitle>
        <CardDescription>
          Record your sports betting pick with all the details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select
                value={formData.sport}
                onValueChange={(value) => handleInputChange("sport", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      {sport.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="betType">Bet Type</Label>
              <Select
                value={formData.betType}
                onValueChange={(value) => handleInputChange("betType", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bet type" />
                </SelectTrigger>
                <SelectContent>
                  {BET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Pick Description</Label>
            <Input
              id="description"
              placeholder="e.g., Lakers -5.5, Over 220.5, Chiefs ML"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odds">Odds (American)</Label>
              <Input
                id="odds"
                type="number"
                placeholder="e.g., -110, +150"
                value={formData.odds}
                onChange={(e) => handleInputChange("odds", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake">Stake ($)</Label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g., 50.00"
                value={formData.stake}
                onChange={(e) => handleInputChange("stake", e.target.value)}
                required
              />
            </div>
          </div>

          {potentialWin > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Potential Winnings:</span>
                <Badge variant="secondary" className="text-lg">
                  {formatCurrency(potentialWin)}
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gameDate">Game Date & Time</Label>
            <Input
              id="gameDate"
              type="datetime-local"
              value={formData.gameDate}
              onChange={(e) => handleInputChange("gameDate", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Pick"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
