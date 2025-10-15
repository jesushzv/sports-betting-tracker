import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateParlaySchema = z.object({
  status: z.enum(["PENDING", "WON", "LOST", "PUSH"]).optional(),
})

// GET /api/parlays/[id] - Get a specific parlay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const parlay = await prisma.parlay.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
      include: {
        legs: {
          include: {
            pick: true,
          },
        },
      },
    })

    if (!parlay) {
      return NextResponse.json({ error: "Parlay not found" }, { status: 404 })
    }

    return NextResponse.json(parlay)
  } catch (error) {
    console.error("Error fetching parlay:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/parlays/[id] - Update a parlay (settle it)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateParlaySchema.parse(body)

    // Check if parlay exists and belongs to user
    const { id } = await params
    const existingParlay = await prisma.parlay.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
      include: {
        legs: {
          include: {
            pick: true,
          },
        },
      },
    })

    if (!existingParlay) {
      return NextResponse.json({ error: "Parlay not found" }, { status: 404 })
    }

    // If status is being updated to WON/LOST/PUSH, handle bankroll
    if (validatedData.status && validatedData.status !== "PENDING") {
      const wasPending = existingParlay.status === "PENDING"
      const isNowSettled = validatedData.status !== "PENDING"

      if (wasPending && isNowSettled) {
        // Update the existing bankroll history entry
        const bankrollEntry = await prisma.bankrollHistory.findFirst({
          where: {
            relatedParlayId: id,
            type: "LOSS", // The original stake entry
          },
        })

        if (bankrollEntry) {
          let newAmount = 0
          let newType = validatedData.status

          if (validatedData.status === "WON") {
            newAmount = existingParlay.potentialWin
            newType = "WIN"
          } else if (validatedData.status === "LOST") {
            newAmount = -existingParlay.stake
            newType = "LOSS"
          } else if (validatedData.status === "PUSH") {
            newAmount = 0 // Money back
            newType = "PUSH"
          }

          await prisma.bankrollHistory.update({
            where: { id: bankrollEntry.id },
            data: {
              amount: newAmount,
              type: newType as "WIN" | "LOSS" | "PUSH",
              notes: `Settled parlay with ${existingParlay.legs.length} legs - ${validatedData.status}`,
            },
          })
        }
      }
    }

    // Add settledAt timestamp if status is being set to settled
    const updateData: Record<string, unknown> = { ...validatedData }
    if (validatedData.status && validatedData.status !== "PENDING") {
      updateData.settledAt = new Date()
    }

    const updatedParlay = await prisma.parlay.update({
      where: { id },
      data: updateData,
      include: {
        legs: {
          include: {
            pick: true,
          },
        },
      },
    })

    return NextResponse.json(updatedParlay)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating parlay:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/parlays/[id] - Delete a parlay
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if parlay exists and belongs to user
    const { id } = await params
    const existingParlay = await prisma.parlay.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
    })

    if (!existingParlay) {
      return NextResponse.json({ error: "Parlay not found" }, { status: 404 })
    }

    // Delete associated bankroll history entries
    await prisma.bankrollHistory.deleteMany({
      where: {
        relatedParlayId: id,
      },
    })

    // Delete parlay legs first (due to foreign key constraints)
    await prisma.parlayLeg.deleteMany({
      where: {
        parlayId: id,
      },
    })

    // Delete the parlay
    await prisma.parlay.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Parlay deleted successfully" })
  } catch (error) {
    console.error("Error deleting parlay:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
