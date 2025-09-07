import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reportDraftGenerator } from '@/lib/report-draft-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await prisma.reportDraft.findUnique({
      where: { id },
      include: {
        evaluation: {
          select: {
            periodStart: true,
            periodEnd: true
          }
        }
      }
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Failed to fetch draft:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, comment } = body;

    const updateData: any = {
      status,
      reviewedAt: new Date()
    };

    if (comment) {
      updateData.reviewComment = comment;
    }

    const draft = await prisma.reportDraft.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Failed to update draft:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.reportDraft.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
