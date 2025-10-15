import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPickSchema = z.object({
  sport: z.enum(['NFL', 'NBA', 'MLB', 'NHL', 'UFC']),
  betType: z.enum(['SPREAD', 'MONEYLINE', 'OVER_UNDER']),
  description: z.string().min(1, 'Description is required'),
  odds: z.number().min(-1000).max(1000),
  stake: z.number().min(0.01, 'Stake must be greater than 0'),
  gameDate: z.string().datetime(),
})

// GET /api/picks - Get all picks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const betType = searchParams.get('betType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (sport) where.sport = sport
    if (betType) where.betType = betType
    if (status) where.status = status

    const [picks, total] = await Promise.all([
      prisma.pick.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pick.count({ where }),
    ])

    return NextResponse.json({
      picks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching picks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/picks - Create a new pick
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPickSchema.parse(body)

    // Calculate potential winnings based on American odds
    const { odds, stake } = validatedData
    let potentialWin: number

    if (odds > 0) {
      // Positive odds: (odds / 100) * stake
      potentialWin = (odds / 100) * stake
    } else {
      // Negative odds: (100 / |odds|) * stake
      potentialWin = (100 / Math.abs(odds)) * stake
    }

    const pick = await prisma.pick.create({
      data: {
        ...validatedData,
        gameDate: new Date(validatedData.gameDate),
        potentialWin,
        userId: session.user.id,
      },
    })

    // Create bankroll history entry for the stake
    await prisma.bankrollHistory.create({
      data: {
        userId: session.user.id,
        amount: -stake, // Negative because it's money going out
        type: 'LOSS', // Will be updated when pick is settled
        relatedPickId: pick.id,
        notes: `Stake for pick: ${validatedData.description}`,
      },
    })

    return NextResponse.json(pick, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
