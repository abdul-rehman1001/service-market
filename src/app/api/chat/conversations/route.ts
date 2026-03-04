import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/chat/conversations — list all chat conversations for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Find all confirmed+ bookings for this user (seeker or provider)
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { seekerId: userId },
          { provider: { userId: userId } },
        ],
        status: {
          in: ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'],
        },
      },
      include: {
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        provider: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // For each booking, check if a Firestore conversation exists; if not, create one
    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        const conversationId = `booking_${booking.id}`;
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        const doc = await conversationRef.get();

        const seekerName = `${booking.seeker.firstName} ${booking.seeker.lastName}`;
        const providerName = `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

        // Determine the "other" user for display
        const isSeeker = booking.seekerId === userId;
        const otherUser = isSeeker
          ? {
              id: booking.provider.userId,
              name: providerName,
              avatar: booking.provider.user.profileImage || '',
            }
          : {
              id: booking.seeker.id,
              name: seekerName,
              avatar: booking.seeker.profileImage || '',
            };

        if (!doc.exists) {
          // Create the conversation in Firestore
          await conversationRef.set({
            bookingId: booking.id,
            seekerId: booking.seekerId,
            providerId: booking.provider.userId,
            seekerName,
            providerName,
            seekerAvatar: booking.seeker.profileImage || '',
            providerAvatar: booking.provider.user.profileImage || '',
            serviceName: booking.service.name,
            lastMessage: '',
            lastMessageAt: null,
            createdAt: new Date().toISOString(),
          });

          return {
            id: conversationId,
            bookingId: booking.id,
            otherUser,
            serviceName: booking.service.name,
            lastMessage: '',
            lastMessageAt: null,
            unreadCount: 0,
            bookingStatus: booking.status,
          };
        }

        const data = doc.data()!;

        // Count unread messages
        const unreadSnapshot = await adminDb
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .where('read', '==', false)
          .get();

        // Filter in memory to exclude messages from current user
        const unreadMessages = unreadSnapshot.docs.filter(
          (doc) => doc.data().senderId !== userId
        );

        return {
          id: conversationId,
          bookingId: booking.id,
          otherUser,
          serviceName: data.serviceName || booking.service.name,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt || null,
          unreadCount: unreadMessages.length,
          bookingStatus: booking.status,
        };
      })
    );

    // Sort by lastMessageAt (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Chat conversations GET error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: errorMessage },
      { status: 500 }
    );
  }
}
