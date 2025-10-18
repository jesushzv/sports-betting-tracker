import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { demoBankrollHistory } from '@/lib/demo-data'

type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

const createTransactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  notes: z.string().optional(),
})

// GET /api/bankroll - Get bankroll history and current balance
export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: SessionUser
    } | null
    
    // Return demo data for unauthenticated users
    if (!session?.user || !session.user.id) {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      
      let filteredTransactions = demoBankrollHistory
      
      if (type) filteredTransactions = filteredTransactions.filter(t => t.type === type)
      
      const skip = (page - 1) * limit
      const paginatedTransactions = filteredTransactions.slice(skip, skip + limit)
      
      // Calculate current balance
      const currentBalance = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      return NextResponse.json({
        transactions: paginatedTransactions,
        currentBalance,
        startingBankroll: 1000,
        pagination: {
          page,
          limit,
          total: filteredTransactions.length,
          pages: Math.ceil(filteredTransactions.length / limit),
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (type) where.type = type

    const [transactions, total] = await Promise.all([
      prisma.bankrollHistory.findMany({
        where,
        include: {
          pick: {
            select: {
              id: true,
              description: true,
              sport: true,
            },
          },
          parlay: {
            select: {
              id: true,
              legs: {
                include: {
                  pick: {
                    select: {
                      description: true,
                      sport: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bankrollHistory.count({ where }),
    ])

    // Calculate current balance
    const allTransactions = await prisma.bankrollHistory.findMany({
      where: { userId: session.user.id },
      select: { amount: true },
    })

    const currentBalance = allTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

    // Get user's starting bankroll
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { startingBankroll: true },
    })

    const startingBankroll = user?.startingBankroll || 0

    return NextResponse.json({
      transactions,
      currentBalance,
      startingBankroll,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching bankroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bankroll - Create a new bankroll transaction (deposit/withdrawal)
export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: SessionUser
    } | null
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required to manage bankroll' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // For withdrawals, check if user has sufficient balance
    if (validatedData.type === 'WITHDRAWAL') {
      const allTransactions = await prisma.bankrollHistory.findMany({
        where: { userId: session.user.id },
        select: { amount: true },
      })

      const currentBalance = allTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      )

      if (currentBalance < validatedData.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance for withdrawal' },
          { status: 400 }
        )
      }
    }

    // Create the transaction
    const transaction = await prisma.bankrollHistory.create({
      data: {
        userId: session.user.id,
        amount:
          validatedData.type === 'DEPOSIT'
            ? validatedData.amount
            : -validatedData.amount,
        type: validatedData.type,
        notes:
          validatedData.notes ||
          `${validatedData.type.toLowerCase()} transaction`,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating bankroll transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
