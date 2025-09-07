import { NextRequest, NextResponse } from 'next/server';
import { reportDraftGenerator } from '@/lib/report-draft-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await reportDraftGenerator.publishDraft(id, 'system');
    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to publish draft:', error);
    return NextResponse.json({ error: 'Failed to publish draft' }, { status: 500 });
  }
}
