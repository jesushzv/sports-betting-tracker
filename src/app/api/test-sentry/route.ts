import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Test Sentry error reporting
    throw new Error('Test error from Sentry integration')
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { 
        message: 'Test error sent to Sentry',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 }
    )
  }
}
