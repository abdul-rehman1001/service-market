import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebaseAdmin';

const buildConversationId = (seekerId: string, providerId: string) =>
  `conversation_${seekerId}_${providerId}`;

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

    type Participant = { id: string; name: string; avatar: string };
    type ConversationGroup = {
      id: string;
      seeker: Participant;
      provider: Participant;
      bookings: { id: string; serviceName: string; status: string; updatedAt: string }[];
    };

    const conversationGroups = new Map<string, ConversationGroup>();

    bookings.forEach((booking) => {
      const seeker: Participant = {
        id: booking.seeker.id,
        name: `${booking.seeker.firstName} ${booking.seeker.lastName}`,
        avatar: booking.seeker.profileImage || '',
      };
      const provider: Participant = {
        id: booking.provider.userId,
        name: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
        avatar: booking.provider.user.profileImage || '',
      };
      const conversationId = buildConversationId(booking.seekerId, booking.provider.userId);
      const bookingSummary = {
        id: booking.id,
        serviceName: booking.service.name,
        status: booking.status,
        updatedAt: booking.updatedAt.toISOString(),
      };

      const existing = conversationGroups.get(conversationId);
      if (existing) {
        existing.bookings.push(bookingSummary);
      } else {
        conversationGroups.set(conversationId, {
          id: conversationId,
          seeker,
          provider,
          bookings: [bookingSummary],
        });
      }
    });

    const conversations = await Promise.all(
      Array.from(conversationGroups.values()).map(async (group) => {
        const sortedBookings = [...group.bookings].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        const latestBooking = sortedBookings[0];

        const conversationRef = adminDb.collection('conversations').doc(group.id);
        const snapshot = await conversationRef.get();
        const baseData = {
          seekerId: group.seeker.id,
          providerId: group.provider.id,
          seekerName: group.seeker.name,
          providerName: group.provider.name,
          seekerAvatar: group.seeker.avatar,
          providerAvatar: group.provider.avatar,
          participants: [group.seeker.id, group.provider.id],
          serviceName: latestBooking?.serviceName || '',
          lastMessage: '',
          lastMessageAt: null,
          createdAt: new Date().toISOString(),
        };

        let data = snapshot.data() || null;
        if (!snapshot.exists) {
          await conversationRef.set(baseData);
          data = baseData;
        }

        const unreadSnapshot = await conversationRef
          .collection('messages')
          .where('receiverId', '==', userId)
          .where('read', '==', false)
          .get();

        const otherUser = group.seeker.id === userId ? group.provider : group.seeker;

        return {
          id: group.id,
          seekerId: group.seeker.id,
          providerId: group.provider.id,
          otherUser,
          serviceName: latestBooking?.serviceName || data?.serviceName || '',
          lastMessage: data?.lastMessage || '',
          lastMessageAt: data?.lastMessageAt || null,
          unreadCount: unreadSnapshot.size,
          bookingStatus: latestBooking?.status,
          bookings: sortedBookings,
        };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessageAt || a.bookings[0]?.updatedAt || '';
      const bTime = b.lastMessageAt || b.bookings[0]?.updatedAt || '';
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
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
