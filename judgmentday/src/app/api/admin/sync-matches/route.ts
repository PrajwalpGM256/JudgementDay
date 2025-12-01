import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// POST /api/admin/sync-matches - Sync matches from ESPN (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { season, mode } = await request.json();

    // Validate inputs
    const validSeason = season || new Date().getFullYear();
    const validMode = mode || 'all'; // 'current' or 'all'

    console.log(`🔄 Admin ${session.user.username} triggered match sync: ${validSeason} ${validMode}`);

    // Execute the populate-matches script
    const command = `npx tsx scripts/populate-matches.ts ${validSeason} ${validMode}`;
    
    const { stdout, stderr } = await execPromise(command, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minute timeout
    });

    // Parse the output for summary
    const summaryMatch = stdout.match(/✅ Created: (\d+) matches[\s\S]*?🔄 Updated: (\d+) matches/);
    const statusMatch = stdout.match(/FINAL: (\d+) matches[\s\S]*?SCHEDULED: (\d+) matches/);

    const created = summaryMatch ? parseInt(summaryMatch[1]) : 0;
    const updated = summaryMatch ? parseInt(summaryMatch[2]) : 0;
    const finalCount = statusMatch ? parseInt(statusMatch[1]) : 0;
    const scheduledCount = statusMatch ? parseInt(statusMatch[2]) : 0;

    return NextResponse.json({
      success: true,
      message: `Match sync completed successfully`,
      summary: {
        created,
        updated,
        total: created + updated,
        finalMatches: finalCount,
        scheduledMatches: scheduledCount,
      },
      output: stdout,
    });
  } catch (error: any) {
    console.error('Error syncing matches:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to sync matches',
        message: error.message,
        details: error.stderr || error.stdout,
      },
      { status: 500 }
    );
  }
}

