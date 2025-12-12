import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
