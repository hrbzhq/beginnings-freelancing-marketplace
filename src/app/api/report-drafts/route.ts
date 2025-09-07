import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reportDraftGenerator } from '@/lib/report-draft-generator';

export async function GET() {
  try {
    const drafts = await prisma.reportDraft.findMany({
      include: {
        evaluation: {
          select: {
            periodStart: true,
            periodEnd: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Failed to fetch report drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { evaluationId } = body;

    if (!evaluationId) {
      return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 });
    }

    const drafts = await reportDraftGenerator.generateAndSaveDraftsFromEvaluation(evaluationId);
    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Failed to generate report drafts:', error);
    return NextResponse.json({ error: 'Failed to generate drafts' }, { status: 500 });
  }
}
