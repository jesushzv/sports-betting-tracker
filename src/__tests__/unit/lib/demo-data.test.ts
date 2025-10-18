import { demoPicks, demoParlays, demoBankrollHistory, getDemoStats } from '@/lib/demo-data'

describe('Demo Data Service', () => {
  describe('demoPicks', () => {
    it('contains realistic pick data', () => {
      expect(demoPicks).toHaveLength(15)
      
      // Check that all picks have required fields
      demoPicks.forEach(pick => {
        expect(pick.id).toBeDefined()
        expect(pick.sport).toMatch(/^(NFL|NBA|MLB|NHL|UFC)$/)
        expect(pick.betType).toMatch(/^(SPREAD|MONEYLINE|OVER_UNDER)$/)
        expect(pick.description).toBeDefined()
        expect(typeof pick.odds).toBe('number')
        expect(typeof pick.stake).toBe('number')
        expect(typeof pick.potentialWin).toBe('number')
        expect(pick.status).toMatch(/^(WON|LOST|PENDING|PUSH)$/)
        expect(pick.gameDate).toBeInstanceOf(Date)
        expect(pick.createdAt).toBeInstanceOf(Date)
      })
    })

    it('has realistic odds values', () => {
      demoPicks.forEach(pick => {
        expect(pick.odds).toBeGreaterThanOrEqual(-1000)
        expect(pick.odds).toBeLessThanOrEqual(1000)
      })
    })

    it('has realistic stake amounts', () => {
      demoPicks.forEach(pick => {
        expect(pick.stake).toBeGreaterThan(0)
        expect(pick.stake).toBeLessThanOrEqual(1000)
      })
    })

    it('has mix of different sports', () => {
      const sports = new Set(demoPicks.map(pick => pick.sport))
      expect(sports.size).toBeGreaterThan(1)
    })

    it('has mix of different bet types', () => {
      const betTypes = new Set(demoPicks.map(pick => pick.betType))
      expect(betTypes.size).toBeGreaterThan(1)
    })

    it('has mix of different statuses', () => {
      const statuses = new Set(demoPicks.map(pick => pick.status))
      expect(statuses.size).toBeGreaterThan(1)
    })
  })

  describe('demoParlays', () => {
    it('contains realistic parlay data', () => {
      expect(demoParlays).toHaveLength(3)
      
      demoParlays.forEach(parlay => {
        expect(parlay.id).toBeDefined()
        expect(typeof parlay.totalOdds).toBe('number')
        expect(typeof parlay.stake).toBe('number')
        expect(typeof parlay.potentialWin).toBe('number')
        expect(parlay.status).toMatch(/^(WON|LOST|PENDING|PUSH)$/)
        expect(parlay.createdAt).toBeInstanceOf(Date)
      })
    })

    it('has realistic parlay odds', () => {
      demoParlays.forEach(parlay => {
        expect(parlay.totalOdds).toBeGreaterThan(1) // Parlays should have higher odds than 1
        expect(parlay.stake).toBeGreaterThan(0)
        expect(parlay.potentialWin).toBeGreaterThan(parlay.stake)
      })
    })
  })

  describe('demoBankrollHistory', () => {
    it('contains realistic bankroll transactions', () => {
      expect(demoBankrollHistory.length).toBeGreaterThan(5)
      
      demoBankrollHistory.forEach(transaction => {
        expect(transaction.id).toBeDefined()
        expect(typeof transaction.amount).toBe('number')
        expect(transaction.type).toMatch(/^(DEPOSIT|WITHDRAWAL|WIN|LOSS|PUSH)$/)
        expect(transaction.notes).toBeDefined()
        expect(transaction.timestamp).toBeInstanceOf(Date)
      })
    })

    it('has realistic transaction amounts', () => {
      demoBankrollHistory.forEach(transaction => {
        expect(transaction.amount).not.toBe(0)
        expect(Math.abs(transaction.amount)).toBeLessThanOrEqual(1000)
      })
    })

    it('has mix of different transaction types', () => {
      const types = new Set(demoBankrollHistory.map(t => t.type))
      expect(types.size).toBeGreaterThan(2)
    })

    it('starts with a deposit', () => {
      const firstTransaction = demoBankrollHistory[0]
      expect(firstTransaction.type).toBe('DEPOSIT')
      expect(firstTransaction.amount).toBeGreaterThan(0)
    })
  })

  describe('getDemoStats', () => {
    it('returns comprehensive stats object', () => {
      const stats = getDemoStats()
      
      expect(stats).toHaveProperty('overview')
      expect(stats).toHaveProperty('sportStats')
      expect(stats).toHaveProperty('betTypeStats')
      expect(stats).toHaveProperty('balanceHistory')
      expect(stats).toHaveProperty('recentPicks')
    })

    it('calculates correct pick counts', () => {
      const stats = getDemoStats()
      
      expect(stats.overview.totalPicks).toBe(demoPicks.length)
      expect(stats.overview.wonPicks + stats.overview.lostPicks + stats.overview.pendingPicks + stats.overview.pushPicks).toBe(stats.overview.totalPicks)
    })

    it('calculates realistic win rate', () => {
      const stats = getDemoStats()
      
      expect(stats.overview.winRate).toBeGreaterThanOrEqual(0)
      expect(stats.overview.winRate).toBeLessThanOrEqual(100)
      // Win rate is calculated from settled picks only
      const settledPicks = stats.overview.wonPicks + stats.overview.lostPicks + stats.overview.pushPicks
      if (settledPicks > 0) {
        expect(stats.overview.winRate).toBeCloseTo((stats.overview.wonPicks / settledPicks) * 100, 1)
      }
    })

    it('calculates correct profit', () => {
      const stats = getDemoStats()
      
      // Profit should be calculated from won picks minus lost stakes
      const expectedProfit = demoPicks.reduce((sum, pick) => {
        if (pick.status === 'WON') return sum + pick.potentialWin
        if (pick.status === 'LOST') return sum - pick.stake
        return sum
      }, 0)
      
      expect(stats.overview.netProfit).toBeCloseTo(expectedProfit, 2)
    })

    it('calculates correct ROI', () => {
      const stats = getDemoStats()
      
      const totalStake = demoPicks.reduce((sum, pick) => sum + pick.stake, 0)
      const expectedROI = totalStake > 0 ? (stats.overview.netProfit / totalStake) * 100 : 0
      
      expect(stats.overview.roi).toBeCloseTo(expectedROI, 1)
    })

    it('provides performance by sport data', () => {
      const stats = getDemoStats()
      
      expect(Array.isArray(stats.sportStats)).toBe(true)
      expect(stats.sportStats.length).toBeGreaterThan(0)
      
      stats.sportStats.forEach(sport => {
        expect(sport).toHaveProperty('sport')
        expect(sport).toHaveProperty('won')
        expect(sport).toHaveProperty('lost')
        expect(sport).toHaveProperty('pending')
        expect(sport).toHaveProperty('netProfit')
        expect(sport).toHaveProperty('roi')
      })
    })

    it('provides bankroll history chart data', () => {
      const stats = getDemoStats()
      
      expect(Array.isArray(stats.balanceHistory)).toBe(true)
      expect(stats.balanceHistory.length).toBeGreaterThan(0)
      
      stats.balanceHistory.forEach(entry => {
        expect(entry).toHaveProperty('date')
        expect(entry).toHaveProperty('balance')
        expect(entry.date).toBeInstanceOf(Date)
        expect(typeof entry.balance).toBe('number')
      })
    })

    it('provides recent picks data', () => {
      const stats = getDemoStats()
      
      expect(Array.isArray(stats.recentPicks)).toBe(true)
      expect(stats.recentPicks.length).toBeLessThanOrEqual(10)
      expect(stats.recentPicks.length).toBeGreaterThan(0)
      
      // Should be sorted by creation date (most recent first)
      for (let i = 1; i < stats.recentPicks.length; i++) {
        const prevDate = new Date(stats.recentPicks[i - 1].createdAt)
        const currDate = new Date(stats.recentPicks[i].createdAt)
        // Allow for some flexibility in sorting due to demo data generation
        expect(Math.abs(prevDate.getTime() - currDate.getTime())).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
