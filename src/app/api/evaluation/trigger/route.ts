import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';

const evaluationQueue = new Queue('evaluation', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export async function POST(request: NextRequest) {
  try {
    const job = await evaluationQueue.add('manual-evaluation', {});
    console.log(`Manual evaluation triggered with job ID: ${job.id}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Evaluation triggered successfully'
    });
  } catch (error) {
    console.error('Failed to trigger evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to trigger evaluation' },
      { status: 500 }
    );
  }
}
