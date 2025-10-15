"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface BankrollTransaction {
  id: string
  amount: number
  type: string
  notes?: string
  timestamp: string
  pick?: {
    id: string
    description: string
    sport: string
  }
  parlay?: {
    id: string
    legs: Array<{
      pick: {
        description: string
        sport: string
      }
    }>
  }
}

interface BankrollData {
  transactions: BankrollTransaction[]
  currentBalance: number
  startingBankroll: number
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function BankrollManager() {
  const [bankrollData, setBankrollData] = useState<BankrollData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    type: "",
    notes: "",
  })

  useEffect(() => {
    fetchBankrollData()
  }, [])

  const fetchBankrollData = async () => {
    try {
      const response = await fetch("/api/bankroll")
      if (response.ok) {
        const data = await response.json()
        setBankrollData(data)
      }
    } catch (error) {
      console.error("Error fetching bankroll data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bankroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(transactionForm.amount),
          type: transactionForm.type,
          notes: transactionForm.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create transaction")
      }

      // Reset form and refresh data
      setTransactionForm({ amount: "", type: "", notes: "" })
      setShowAddTransaction(false)
      await fetchBankrollData()
    } catch (error) {
      console.error("Error creating transaction:", error)
      alert("Failed to create transaction. Please try again.")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <Badge className="bg-green-500">Deposit</Badge>
      case "WITHDRAWAL":
        return <Badge variant="destructive">Withdrawal</Badge>
      case "WIN":
        return <Badge className="bg-green-500">Win</Badge>
      case "LOSS":
        return <Badge variant="destructive">Loss</Badge>
      case "PUSH":
        return <Badge variant="secondary">Push</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bankroll data...</p>
        </div>
      </div>
    )
  }

  if (!bankrollData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load bankroll data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bankroll Management</h1>
          <p className="text-muted-foreground">
            Track your deposits, withdrawals, and betting activity
          </p>
        </div>
        <Button onClick={() => setShowAddTransaction(true)}>
          Add Transaction
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${bankrollData.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(bankrollData.currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bankroll balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starting Bankroll</CardTitle>
            <span className="text-2xl">🏦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(bankrollData.startingBankroll)}
            </div>
            <p className="text-xs text-muted-foreground">
              Initial bankroll amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(bankrollData.currentBalance - bankrollData.startingBankroll) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(bankrollData.currentBalance - bankrollData.startingBankroll)}
            </div>
            <p className="text-xs text-muted-foreground">
              Since starting bankroll
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>
              Record a deposit or withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 100.00"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value) => setTransactionForm(prev => ({ ...prev, type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEPOSIT">Deposit</SelectItem>
                      <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Monthly deposit, Emergency withdrawal"
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adding..." : "Add Transaction"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All your bankroll transactions and betting activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bankrollData.transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Related To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankrollData.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell>{getTransactionTypeBadge(transaction.type)}</TableCell>
                    <TableCell className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? "+" : ""}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.notes || "-"}</TableCell>
                    <TableCell>
                      {transaction.pick && (
                        <div className="text-sm">
                          <div className="font-medium">{transaction.pick.description}</div>
                          <div className="text-muted-foreground">{transaction.pick.sport}</div>
                        </div>
                      )}
                      {transaction.parlay && (
                        <div className="text-sm">
                          <div className="font-medium">Parlay ({transaction.parlay.legs.length} legs)</div>
                          <div className="text-muted-foreground">
                            {transaction.parlay.legs.map(leg => leg.pick.sport).join(", ")}
                          </div>
                        </div>
                      )}
                      {!transaction.pick && !transaction.parlay && "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No transactions yet!</p>
              <Button onClick={() => setShowAddTransaction(true)}>
                Add Your First Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
