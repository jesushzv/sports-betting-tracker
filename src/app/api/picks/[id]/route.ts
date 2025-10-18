import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { demoPicks } from '@/lib/demo-data'

const updatePickSchema = z.object({
  status: z.enum(['PENDING', 'WON', 'LOST', 'PUSH']).optional(),
  description: z.string().min(1).optional(),
  odds: z.number().min(-1000).max(1000).optional(),
  stake: z.number().min(0.01).optional(),
  gameDate: z.string().datetime().optional(),
})

// GET /api/picks/[id] - Get a specific pick
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    // Return demo data for unauthenticated users
    if (!session?.user || !session.user.id) {
      const demoPick = demoPicks.find(p => p.id === id)
      if (!demoPick) {
        return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
      }
      return NextResponse.json(demoPick)
    }

    const pick = await prisma.pick.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    return NextResponse.json(pick)
  } catch (error) {
    console.error('Error fetching pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/picks/[id] - Update a pick
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required to update picks' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePickSchema.parse(body)

    // Check if pick exists and belongs to user
    const { id } = await params
    const existingPick = await prisma.pick.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // If status is being updated to WON/LOST/PUSH, handle bankroll
    if (validatedData.status && validatedData.status !== 'PENDING') {
      const wasPending = existingPick.status === 'PENDING'
      const isNowSettled = true // validatedData.status is already confirmed to not be PENDING

      if (wasPending && isNowSettled) {
        // Update the existing bankroll history entry
        const bankrollEntry = await prisma.bankrollHistory.findFirst({
          where: {
            relatedPickId: id,
            type: 'LOSS', // The original stake entry
          },
        })

        if (bankrollEntry) {
          let newAmount = 0
          let newType: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS'

          if (validatedData.status === 'WON') {
            newAmount = existingPick.potentialWin
            newType = 'WIN'
          } else if (validatedData.status === 'LOST') {
            newAmount = -existingPick.stake
            newType = 'LOSS'
          } else if (validatedData.status === 'PUSH') {
            newAmount = 0 // Money back
            newType = 'PUSH'
          }

          await prisma.bankrollHistory.update({
            where: { id: bankrollEntry.id },
            data: {
              amount: newAmount,
              type: newType as 'WIN' | 'LOSS' | 'PUSH',
              notes: `Settled pick: ${existingPick.description} - ${validatedData.status}`,
            },
          })
        }
      }
    }

    // Calculate new potential win if odds or stake changed
    const updateData: Record<string, unknown> = { ...validatedData }
    if (validatedData.odds !== undefined || validatedData.stake !== undefined) {
      const odds = validatedData.odds ?? existingPick.odds
      const stake = validatedData.stake ?? existingPick.stake

      let potentialWin: number
      if (odds > 0) {
        potentialWin = (odds / 100) * stake
      } else {
        potentialWin = (100 / Math.abs(odds)) * stake
      }
      updateData.potentialWin = potentialWin
    }

    // Convert gameDate if provided
    if (validatedData.gameDate) {
      updateData.gameDate = new Date(validatedData.gameDate)
    }

    // Add settledAt timestamp if status is being set to settled
    if (validatedData.status && validatedData.status !== 'PENDING') {
      updateData.settledAt = new Date()
    }

    const updatedPick = await prisma.pick.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedPick)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/picks/[id] - Delete a pick
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required to delete picks' }, { status: 401 })
    }

    // Check if pick exists and belongs to user
    const { id } = await params
    const existingPick = await prisma.pick.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // Delete associated bankroll history entries
    await prisma.bankrollHistory.deleteMany({
      where: {
        relatedPickId: id,
      },
    })

    // Delete the pick
    await prisma.pick.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Pick deleted successfully' })
  } catch (error) {
    console.error('Error deleting pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
