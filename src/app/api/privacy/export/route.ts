import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
        purchases: {
          include: {
            report: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user activity data
    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      subscriptions: user.subscriptions,
      purchases: user.purchases,
      activity: analyticsEvents,
      exportDate: new Date().toISOString()
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const confirmDelete = searchParams.get('confirm') === 'true';

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  if (!confirmDelete) {
    return NextResponse.json({
      error: 'Deletion requires confirmation',
      message: 'Add ?confirm=true to confirm account deletion'
    }, { status: 400 });
  }

  try {
    // Delete user and all related data (cascade delete will handle relations)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
