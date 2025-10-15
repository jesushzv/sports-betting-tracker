import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createParlaySchema = z.object({
  pickIds: z.array(z.string()).min(2, 'Parlay must have at least 2 legs'),
  stake: z.number().min(0.01, 'Stake must be greater than 0'),
})

// GET /api/parlays - Get all parlays for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (status) where.status = status

    const [parlays, total] = await Promise.all([
      prisma.parlay.findMany({
        where,
        include: {
          legs: {
            include: {
              pick: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.parlay.count({ where }),
    ])

    return NextResponse.json({
      parlays,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching parlays:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/parlays - Create a new parlay
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createParlaySchema.parse(body)

    // Verify all picks belong to the user and are pending
    const picks = await prisma.pick.findMany({
      where: {
        id: { in: validatedData.pickIds },
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    if (picks.length !== validatedData.pickIds.length) {
      return NextResponse.json(
        { error: 'Some picks are invalid or already settled' },
        { status: 400 }
      )
    }

    // Calculate total odds for the parlay
    let totalOdds = 1
    for (const pick of picks) {
      const decimalOdds =
        pick.odds > 0 ? pick.odds / 100 + 1 : 100 / Math.abs(pick.odds) + 1
      totalOdds *= decimalOdds
    }

    // Convert back to American odds
    const americanOdds =
      totalOdds >= 2 ? (totalOdds - 1) * 100 : -100 / (totalOdds - 1)

    // Calculate potential winnings
    const potentialWin = (totalOdds - 1) * validatedData.stake

    // Create parlay and legs in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create the parlay
      const parlay = await tx.parlay.create({
        data: {
          userId: session.user.id,
          totalOdds: americanOdds,
          stake: validatedData.stake,
          potentialWin,
          status: 'PENDING',
        },
      })

      // Create parlay legs
      await tx.parlayLeg.createMany({
        data: validatedData.pickIds.map(pickId => ({
          parlayId: parlay.id,
          pickId,
        })),
      })

      // Create bankroll history entry for the stake
      await tx.bankrollHistory.create({
        data: {
          userId: session.user.id,
          amount: -validatedData.stake,
          type: 'LOSS', // Will be updated when parlay is settled
          relatedParlayId: parlay.id,
          notes: `Stake for parlay with ${picks.length} legs`,
        },
      })

      return parlay
    })

    // Fetch the created parlay with legs
    const parlayWithLegs = await prisma.parlay.findUnique({
      where: { id: result.id },
      include: {
        legs: {
          include: {
            pick: true,
          },
        },
      },
    })

    return NextResponse.json(parlayWithLegs, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating parlay:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
