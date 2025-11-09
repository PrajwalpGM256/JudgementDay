import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testAPIConnection, getAvailableSeasons } from '@/lib/api-football';

// GET /api/sports/test - Test RapidAPI connection
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    // Test API connection
    const connectionTest = await testAPIConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        { 
          success: false,
          error: connectionTest.message,
          tip: 'Make sure RAPIDAPI_KEY and RAPIDAPI_HOST are set in your .env file'
        },
        { status: 500 }
      );
    }

    // Try to fetch available seasons
    const seasons = await getAvailableSeasons();

    return NextResponse.json({
      success: true,
      message: connectionTest.message,
      apiConnected: true,
      availableSeasons: seasons.length,
      seasons: seasons.slice(0, 3), // Return first 3 seasons as sample
    });
  } catch (error: any) {
    console.error('Error testing API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test API connection',
        tip: 'Check your RapidAPI key and ensure API-FOOTBALL is subscribed'
      },
      { status: 500 }
    );
  }
}

