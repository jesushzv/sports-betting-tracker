import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const betType = searchParams.get('betType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause for filtering
    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (sport) where.sport = sport
    if (betType) where.betType = betType
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate)
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate)
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
    }

    // Get all picks for the user with filters
    const picks = await prisma.pick.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Calculate basic stats
    const totalPicks = picks.length
    const pendingPicks = picks.filter(p => p.status === 'PENDING').length
    const wonPicks = picks.filter(p => p.status === 'WON').length
    const lostPicks = picks.filter(p => p.status === 'LOST').length
    const pushPicks = picks.filter(p => p.status === 'PUSH').length
    const settledPicks = totalPicks - pendingPicks

    // Calculate win rate
    const winRate = settledPicks > 0 ? (wonPicks / settledPicks) * 100 : 0

    // Calculate profit/loss
    const totalStaked = picks.reduce((sum, pick) => sum + pick.stake, 0)
    const totalWinnings = picks
      .filter(p => p.status === 'WON')
      .reduce((sum, pick) => sum + pick.potentialWin, 0)
    const totalLosses = picks
      .filter(p => p.status === 'LOST')
      .reduce((sum, pick) => sum + pick.stake, 0)
    const totalPushes = picks
      .filter(p => p.status === 'PUSH')
      .reduce((sum, pick) => sum + pick.stake, 0)

    const netProfit = totalWinnings - totalLosses
    const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0

    // Get stats by sport
    const sportStats = await Promise.all(
      ['NFL', 'NBA', 'MLB', 'NHL', 'UFC'].map(async sportName => {
        const sportPicks = picks.filter(p => p.sport === sportName)
        const sportSettled = sportPicks.filter(p => p.status !== 'PENDING')
        const sportWon = sportPicks.filter(p => p.status === 'WON')
        const sportLost = sportPicks.filter(p => p.status === 'LOST')

        const sportStaked = sportPicks.reduce((sum, p) => sum + p.stake, 0)
        const sportWinnings = sportWon.reduce(
          (sum, p) => sum + p.potentialWin,
          0
        )
        const sportLosses = sportLost.reduce((sum, p) => sum + p.stake, 0)
        const sportNetProfit = sportWinnings - sportLosses
        const sportWinRate =
          sportSettled.length > 0
            ? (sportWon.length / sportSettled.length) * 100
            : 0
        const sportROI =
          sportStaked > 0 ? (sportNetProfit / sportStaked) * 100 : 0

        return {
          sport: sportName,
          totalPicks: sportPicks.length,
          won: sportWon.length,
          lost: sportLost.length,
          pending: sportPicks.filter(p => p.status === 'PENDING').length,
          winRate: sportWinRate,
          staked: sportStaked,
          winnings: sportWinnings,
          losses: sportLosses,
          netProfit: sportNetProfit,
          roi: sportROI,
        }
      })
    )

    // Get stats by bet type
    const betTypeStats = await Promise.all(
      ['SPREAD', 'MONEYLINE', 'OVER_UNDER'].map(async betTypeName => {
        const typePicks = picks.filter(p => p.betType === betTypeName)
        const typeSettled = typePicks.filter(p => p.status !== 'PENDING')
        const typeWon = typePicks.filter(p => p.status === 'WON')
        const typeLost = typePicks.filter(p => p.status === 'LOST')

        const typeStaked = typePicks.reduce((sum, p) => sum + p.stake, 0)
        const typeWinnings = typeWon.reduce((sum, p) => sum + p.potentialWin, 0)
        const typeLosses = typeLost.reduce((sum, p) => sum + p.stake, 0)
        const typeNetProfit = typeWinnings - typeLosses
        const typeWinRate =
          typeSettled.length > 0
            ? (typeWon.length / typeSettled.length) * 100
            : 0
        const typeROI = typeStaked > 0 ? (typeNetProfit / typeStaked) * 100 : 0

        return {
          betType: betTypeName,
          totalPicks: typePicks.length,
          won: typeWon.length,
          lost: typeLost.length,
          pending: typePicks.filter(p => p.status === 'PENDING').length,
          winRate: typeWinRate,
          staked: typeStaked,
          winnings: typeWinnings,
          losses: typeLosses,
          netProfit: typeNetProfit,
          roi: typeROI,
        }
      })
    )

    // Get recent picks for dashboard
    const recentPicks = picks.slice(0, 10)

    // Get bankroll history for profit/loss over time
    const bankrollHistory = await prisma.bankrollHistory.findMany({
      where: {
        userId: session.user.id,
        type: { in: ['WIN', 'LOSS', 'PUSH'] },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Calculate running balance
    let runningBalance = 0
    const balanceHistory = bankrollHistory.map(entry => {
      runningBalance += entry.amount
      return {
        date: entry.timestamp,
        balance: runningBalance,
        amount: entry.amount,
        type: entry.type,
      }
    })

    return NextResponse.json({
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
      sportStats: sportStats.map(stat => ({
        ...stat,
        winRate: Math.round(stat.winRate * 100) / 100,
        netProfit: Math.round(stat.netProfit * 100) / 100,
        roi: Math.round(stat.roi * 100) / 100,
      })),
      betTypeStats: betTypeStats.map(stat => ({
        ...stat,
        winRate: Math.round(stat.winRate * 100) / 100,
        netProfit: Math.round(stat.netProfit * 100) / 100,
        roi: Math.round(stat.roi * 100) / 100,
      })),
      recentPicks,
      balanceHistory,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
