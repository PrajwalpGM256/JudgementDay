import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { syncMatchFromAPI, fetchLiveScores } from '@/lib/api-football';

// POST /api/sports/sync - Sync match data from API-FOOTBALL
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fixtureId, season, week } = body;

    if (fixtureId) {
      // Sync specific match
      const result = await syncMatchFromAPI(prisma, fixtureId);
      return NextResponse.json(result);
    } else if (season && week) {
      // Sync all matches for a week
      const liveScores = await fetchLiveScores(season, week);
      
      const syncResults = [];
      for (const score of liveScores) {
        const result = await syncMatchFromAPI(prisma, score.matchId);
        syncResults.push(result);
      }

      const successCount = syncResults.filter(r => r.success).length;

      return NextResponse.json({
        success: true,
        message: `Synced ${successCount} of ${syncResults.length} matches`,
        results: syncResults,
      });
    } else {
      return NextResponse.json(
        { error: 'Please provide either fixtureId or (season and week)' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error syncing sports data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to sync data'
      },
      { status: 500 }
    );
  }
}

