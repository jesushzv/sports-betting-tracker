import { Sport, BetType, PickStatus, BankrollTransactionType } from '@prisma/client'

// Demo picks data
export const demoPicks = [
  // NFL Picks
  {
    id: 'demo-pick-1',
    sport: 'NFL' as Sport,
    betType: 'SPREAD' as BetType,
    description: 'Chiefs -3.5',
    odds: -110,
    stake: 50,
    potentialWin: 45.45,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-15T20:00:00Z'),
    settledAt: new Date('2024-01-16T02:30:00Z'),
    createdAt: new Date('2024-01-15T18:00:00Z'),
    updatedAt: new Date('2024-01-16T02:30:00Z'),
  },
  {
    id: 'demo-pick-2',
    sport: 'NFL' as Sport,
    betType: 'OVER_UNDER' as BetType,
    description: 'Over 48.5',
    odds: -105,
    stake: 75,
    potentialWin: 71.43,
    status: 'LOST' as PickStatus,
    gameDate: new Date('2024-01-14T17:00:00Z'),
    settledAt: new Date('2024-01-14T20:15:00Z'),
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-14T20:15:00Z'),
  },
  {
    id: 'demo-pick-3',
    sport: 'NFL' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Bills ML',
    odds: +150,
    stake: 40,
    potentialWin: 60,
    status: 'PENDING' as PickStatus,
    gameDate: new Date('2024-01-21T20:00:00Z'),
    createdAt: new Date('2024-01-20T19:00:00Z'),
    updatedAt: new Date('2024-01-20T19:00:00Z'),
  },
  // NBA Picks
  {
    id: 'demo-pick-4',
    sport: 'NBA' as Sport,
    betType: 'SPREAD' as BetType,
    description: 'Lakers -7.5',
    odds: -110,
    stake: 60,
    potentialWin: 54.55,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-18T22:00:00Z'),
    settledAt: new Date('2024-01-19T01:00:00Z'),
    createdAt: new Date('2024-01-18T20:30:00Z'),
    updatedAt: new Date('2024-01-19T01:00:00Z'),
  },
  {
    id: 'demo-pick-5',
    sport: 'NBA' as Sport,
    betType: 'OVER_UNDER' as BetType,
    description: 'Over 225.5',
    odds: -110,
    stake: 55,
    potentialWin: 50,
    status: 'LOST' as PickStatus,
    gameDate: new Date('2024-01-17T20:00:00Z'),
    settledAt: new Date('2024-01-17T22:30:00Z'),
    createdAt: new Date('2024-01-17T18:45:00Z'),
    updatedAt: new Date('2024-01-17T22:30:00Z'),
  },
  {
    id: 'demo-pick-6',
    sport: 'NBA' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Warriors ML',
    odds: +120,
    stake: 45,
    potentialWin: 54,
    status: 'PENDING' as PickStatus,
    gameDate: new Date('2024-01-22T21:00:00Z'),
    createdAt: new Date('2024-01-22T19:15:00Z'),
    updatedAt: new Date('2024-01-22T19:15:00Z'),
  },
  // MLB Picks
  {
    id: 'demo-pick-7',
    sport: 'MLB' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Yankees ML',
    odds: -140,
    stake: 70,
    potentialWin: 50,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-16T19:00:00Z'),
    settledAt: new Date('2024-01-16T22:00:00Z'),
    createdAt: new Date('2024-01-16T17:30:00Z'),
    updatedAt: new Date('2024-01-16T22:00:00Z'),
  },
  {
    id: 'demo-pick-8',
    sport: 'MLB' as Sport,
    betType: 'OVER_UNDER' as BetType,
    description: 'Over 8.5',
    odds: -105,
    stake: 50,
    potentialWin: 47.62,
    status: 'PUSH' as PickStatus,
    gameDate: new Date('2024-01-15T20:00:00Z'),
    settledAt: new Date('2024-01-15T23:00:00Z'),
    createdAt: new Date('2024-01-15T18:00:00Z'),
    updatedAt: new Date('2024-01-15T23:00:00Z'),
  },
  // NHL Picks
  {
    id: 'demo-pick-9',
    sport: 'NHL' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Bruins ML',
    odds: -120,
    stake: 60,
    potentialWin: 50,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-19T20:00:00Z'),
    settledAt: new Date('2024-01-19T22:30:00Z'),
    createdAt: new Date('2024-01-19T18:30:00Z'),
    updatedAt: new Date('2024-01-19T22:30:00Z'),
  },
  {
    id: 'demo-pick-10',
    sport: 'NHL' as Sport,
    betType: 'OVER_UNDER' as BetType,
    description: 'Over 6.5',
    odds: -110,
    stake: 40,
    potentialWin: 36.36,
    status: 'LOST' as PickStatus,
    gameDate: new Date('2024-01-18T19:00:00Z'),
    settledAt: new Date('2024-01-18T21:30:00Z'),
    createdAt: new Date('2024-01-18T17:00:00Z'),
    updatedAt: new Date('2024-01-18T21:30:00Z'),
  },
  // UFC Picks
  {
    id: 'demo-pick-11',
    sport: 'UFC' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Jon Jones ML',
    odds: -200,
    stake: 100,
    potentialWin: 50,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-20T22:00:00Z'),
    settledAt: new Date('2024-01-21T00:30:00Z'),
    createdAt: new Date('2024-01-20T20:00:00Z'),
    updatedAt: new Date('2024-01-21T00:30:00Z'),
  },
  {
    id: 'demo-pick-12',
    sport: 'UFC' as Sport,
    betType: 'OVER_UNDER' as BetType,
    description: 'Over 2.5 rounds',
    odds: +110,
    stake: 50,
    potentialWin: 55,
    status: 'PENDING' as PickStatus,
    gameDate: new Date('2024-01-27T21:00:00Z'),
    createdAt: new Date('2024-01-27T19:00:00Z'),
    updatedAt: new Date('2024-01-27T19:00:00Z'),
  },
  // More picks for variety
  {
    id: 'demo-pick-13',
    sport: 'NFL' as Sport,
    betType: 'SPREAD' as BetType,
    description: 'Cowboys +4.5',
    odds: -110,
    stake: 80,
    potentialWin: 72.73,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-13T17:00:00Z'),
    settledAt: new Date('2024-01-13T20:00:00Z'),
    createdAt: new Date('2024-01-13T15:00:00Z'),
    updatedAt: new Date('2024-01-13T20:00:00Z'),
  },
  {
    id: 'demo-pick-14',
    sport: 'NBA' as Sport,
    betType: 'SPREAD' as BetType,
    description: 'Celtics -5.5',
    odds: -110,
    stake: 65,
    potentialWin: 59.09,
    status: 'LOST' as PickStatus,
    gameDate: new Date('2024-01-16T20:00:00Z'),
    settledAt: new Date('2024-01-16T22:30:00Z'),
    createdAt: new Date('2024-01-16T18:00:00Z'),
    updatedAt: new Date('2024-01-16T22:30:00Z'),
  },
  {
    id: 'demo-pick-15',
    sport: 'MLB' as Sport,
    betType: 'MONEYLINE' as BetType,
    description: 'Dodgers ML',
    odds: +130,
    stake: 50,
    potentialWin: 65,
    status: 'WON' as PickStatus,
    gameDate: new Date('2024-01-14T20:00:00Z'),
    settledAt: new Date('2024-01-14T23:00:00Z'),
    createdAt: new Date('2024-01-14T18:00:00Z'),
    updatedAt: new Date('2024-01-14T23:00:00Z'),
  },
]

// Demo parlays
export const demoParlays = [
  {
    id: 'demo-parlay-1',
    totalOdds: 2.5,
    stake: 25,
    potentialWin: 62.5,
    status: 'WON' as PickStatus,
    settledAt: new Date('2024-01-16T02:30:00Z'),
    createdAt: new Date('2024-01-15T18:00:00Z'),
    updatedAt: new Date('2024-01-16T02:30:00Z'),
  },
  {
    id: 'demo-parlay-2',
    totalOdds: 4.2,
    stake: 20,
    potentialWin: 84,
    status: 'LOST' as PickStatus,
    settledAt: new Date('2024-01-18T22:30:00Z'),
    createdAt: new Date('2024-01-18T19:00:00Z'),
    updatedAt: new Date('2024-01-18T22:30:00Z'),
  },
  {
    id: 'demo-parlay-3',
    totalOdds: 3.8,
    stake: 30,
    potentialWin: 114,
    status: 'PENDING' as PickStatus,
    createdAt: new Date('2024-01-20T19:00:00Z'),
    updatedAt: new Date('2024-01-20T19:00:00Z'),
  },
]

// Demo bankroll history
export const demoBankrollHistory = [
  {
    id: 'demo-bankroll-1',
    amount: 1000,
    type: 'DEPOSIT' as BankrollTransactionType,
    timestamp: new Date('2024-01-01T00:00:00Z'),
    notes: 'Starting bankroll',
  },
  {
    id: 'demo-bankroll-2',
    amount: -50,
    type: 'LOSS' as BankrollTransactionType,
    timestamp: new Date('2024-01-15T18:00:00Z'),
    notes: 'Stake for pick: Chiefs -3.5',
  },
  {
    id: 'demo-bankroll-3',
    amount: 95.45,
    type: 'WIN' as BankrollTransactionType,
    timestamp: new Date('2024-01-16T02:30:00Z'),
    notes: 'Won: Chiefs -3.5',
  },
  {
    id: 'demo-bankroll-4',
    amount: -75,
    type: 'LOSS' as BankrollTransactionType,
    timestamp: new Date('2024-01-14T15:30:00Z'),
    notes: 'Stake for pick: Over 48.5',
  },
  {
    id: 'demo-bankroll-5',
    amount: -60,
    type: 'LOSS' as BankrollTransactionType,
    timestamp: new Date('2024-01-18T20:30:00Z'),
    notes: 'Stake for pick: Lakers -7.5',
  },
  {
    id: 'demo-bankroll-6',
    amount: 114.55,
    type: 'WIN' as BankrollTransactionType,
    timestamp: new Date('2024-01-19T01:00:00Z'),
    notes: 'Won: Lakers -7.5',
  },
  {
    id: 'demo-bankroll-7',
    amount: -25,
    type: 'LOSS' as BankrollTransactionType,
    timestamp: new Date('2024-01-15T18:00:00Z'),
    notes: 'Stake for parlay',
  },
  {
    id: 'demo-bankroll-8',
    amount: 62.5,
    type: 'WIN' as BankrollTransactionType,
    timestamp: new Date('2024-01-16T02:30:00Z'),
    notes: 'Won parlay',
  },
]

// Calculate demo stats
export function getDemoStats() {
  const totalPicks = demoPicks.length
  const pendingPicks = demoPicks.filter(p => p.status === 'PENDING').length
  const wonPicks = demoPicks.filter(p => p.status === 'WON').length
  const lostPicks = demoPicks.filter(p => p.status === 'LOST').length
  const pushPicks = demoPicks.filter(p => p.status === 'PUSH').length
  const settledPicks = totalPicks - pendingPicks

  const winRate = settledPicks > 0 ? (wonPicks / settledPicks) * 100 : 0

  const totalStaked = demoPicks.reduce((sum, pick) => sum + pick.stake, 0)
  const totalWinnings = demoPicks
    .filter(p => p.status === 'WON')
    .reduce((sum, pick) => sum + pick.potentialWin, 0)
  const totalLosses = demoPicks
    .filter(p => p.status === 'LOST')
    .reduce((sum, pick) => sum + pick.stake, 0)
  const totalPushes = demoPicks
    .filter(p => p.status === 'PUSH')
    .reduce((sum, pick) => sum + pick.stake, 0)

  const netProfit = totalWinnings - totalLosses
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0

  // Sport stats
  const sportStats = ['NFL', 'NBA', 'MLB', 'NHL', 'UFC'].map(sportName => {
    const sportPicks = demoPicks.filter(p => p.sport === sportName)
    const sportSettled = sportPicks.filter(p => p.status !== 'PENDING')
    const sportWon = sportPicks.filter(p => p.status === 'WON')
    const sportLost = sportPicks.filter(p => p.status === 'LOST')

    const sportStaked = sportPicks.reduce((sum, p) => sum + p.stake, 0)
    const sportWinnings = sportWon.reduce((sum, p) => sum + p.potentialWin, 0)
    const sportLosses = sportLost.reduce((sum, p) => sum + p.stake, 0)
    const sportNetProfit = sportWinnings - sportLosses
    const sportWinRate = sportSettled.length > 0 ? (sportWon.length / sportSettled.length) * 100 : 0
    const sportROI = sportStaked > 0 ? (sportNetProfit / sportStaked) * 100 : 0

    return {
      sport: sportName,
      totalPicks: sportPicks.length,
      won: sportWon.length,
      lost: sportLost.length,
      pending: sportPicks.filter(p => p.status === 'PENDING').length,
      winRate: Math.round(sportWinRate * 100) / 100,
      staked: sportStaked,
      winnings: sportWinnings,
      losses: sportLosses,
      netProfit: Math.round(sportNetProfit * 100) / 100,
      roi: Math.round(sportROI * 100) / 100,
    }
  })

  // Bet type stats
  const betTypeStats = ['SPREAD', 'MONEYLINE', 'OVER_UNDER'].map(betTypeName => {
    const typePicks = demoPicks.filter(p => p.betType === betTypeName)
    const typeSettled = typePicks.filter(p => p.status !== 'PENDING')
    const typeWon = typePicks.filter(p => p.status === 'WON')
    const typeLost = typePicks.filter(p => p.status === 'LOST')

    const typeStaked = typePicks.reduce((sum, p) => sum + p.stake, 0)
    const typeWinnings = typeWon.reduce((sum, p) => sum + p.potentialWin, 0)
    const typeLosses = typeLost.reduce((sum, p) => sum + p.stake, 0)
    const typeNetProfit = typeWinnings - typeLosses
    const typeWinRate = typeSettled.length > 0 ? (typeWon.length / typeSettled.length) * 100 : 0
    const typeROI = typeStaked > 0 ? (typeNetProfit / typeStaked) * 100 : 0

    return {
      betType: betTypeName,
      totalPicks: typePicks.length,
      won: typeWon.length,
      lost: typeLost.length,
      pending: typePicks.filter(p => p.status === 'PENDING').length,
      winRate: Math.round(typeWinRate * 100) / 100,
      staked: typeStaked,
      winnings: typeWinnings,
      losses: typeLosses,
      netProfit: Math.round(typeNetProfit * 100) / 100,
      roi: Math.round(typeROI * 100) / 100,
    }
  })

  // Calculate running balance
  let runningBalance = 1000 // Starting bankroll
  const balanceHistory = demoBankrollHistory.map(entry => {
    runningBalance += entry.amount
    return {
      date: entry.timestamp,
      balance: runningBalance,
      amount: entry.amount,
      type: entry.type,
    }
  })

  return {
    overview: {
      totalPicks,
      pendingPicks,
      wonPicks,
      lostPicks,
      pushPicks,
      settledPicks,
      winRate: Math.round(winRate * 100) / 100,
      totalStaked,
      totalWinnings,
      totalLosses,
      totalPushes,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    },
    sportStats,
    betTypeStats,
    recentPicks: demoPicks.slice(0, 10),
    balanceHistory,
  }
}

// Demo user profile
export const demoUser = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@bettracker.com',
  startingBankroll: 1000,
  createdAt: new Date('2024-01-01T00:00:00Z'),
}
