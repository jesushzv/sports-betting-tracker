import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'

// Mock NextAuth to avoid ES module issues
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}))

// Mock Prisma
const mockPrisma = {
  pick: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  bankrollHistory: {
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
  },
}))

// Import the route handlers after mocking
const { GET, POST } = require('@/app/api/picks/route')

describe('/api/picks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns picks for authenticated user', async () => {
      const mockPicks = [
        {
          id: '1',
          sport: 'NFL',
          betType: 'SPREAD',
          description: 'Lakers -5.5',
          odds: -110,
          stake: 100,
          potentialWin: 90.91,
          status: 'PENDING',
          gameDate: new Date(),
          createdAt: new Date(),
        },
      ]

      mockPrisma.pick.findMany.mockResolvedValue(mockPicks)
      mockPrisma.pick.count.mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/picks',
      })

      const response = await GET(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.picks).toHaveLength(1)
      expect(data.pagination.total).toBe(1)
    })

    it('returns 401 for unauthenticated user', async () => {
      // Mock unauthenticated session
      const { getServerSession } = require('next-auth/next')
      getServerSession.mockResolvedValueOnce(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/picks',
      })

      const response = await GET(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST', () => {
    it('creates a new pick with valid data', async () => {
      const mockPick = {
        id: '1',
        sport: 'NFL',
        betType: 'SPREAD',
        description: 'Lakers -5.5',
        odds: -110,
        stake: 100,
        potentialWin: 90.91,
        status: 'PENDING',
        gameDate: new Date('2024-01-01T20:00:00Z'),
        createdAt: new Date(),
      }

      mockPrisma.pick.create.mockResolvedValue(mockPick)
      mockPrisma.bankrollHistory.create.mockResolvedValue({})

      const { req } = createMocks({
        method: 'POST',
        url: '/api/picks',
        body: {
          sport: 'NFL',
          betType: 'SPREAD',
          description: 'Lakers -5.5',
          odds: -110,
          stake: 100,
          gameDate: '2024-01-01T20:00:00Z',
        },
      })

      const response = await POST(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('1')
      expect(mockPrisma.pick.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sport: 'NFL',
          betType: 'SPREAD',
          description: 'Lakers -5.5',
          odds: -110,
          stake: 100,
          potentialWin: 90.91,
          userId: 'test-user-id',
        }),
      })
    })

    it('returns 400 for invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/picks',
        body: {
          sport: 'INVALID',
          betType: 'SPREAD',
          description: '',
          odds: 'invalid',
          stake: -100,
          gameDate: 'invalid-date',
        },
      })

      const response = await POST(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.details).toBeDefined()
    })
  })
})