import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebaseAdmin';
import admin from '@/lib/firebaseAdmin';
import { sendChatNotification } from '@/lib/notifications';

const buildConversationId = (seekerId: string, providerId: string) =>
  `conversation_${seekerId}_${providerId}`;

// POST /api/chat/messages — send a message
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { bookingId, content } = await req.json();

    if (!bookingId || !content?.trim()) {
      return NextResponse.json(
        { error: 'bookingId and content are required' },
        { status: 400 }
      );
    }

    // Verify the booking exists and is confirmed, and user is a participant
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        service: {
          select: { name: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isSeeker = booking.seekerId === decoded.userId;
    const isProvider = booking.provider.userId === decoded.userId;

    if (!isSeeker && !isProvider) {
      return NextResponse.json(
        { error: 'You are not a participant of this booking' },
        { status: 403 }
      );
    }

    // Only allow chat for confirmed+ bookings
    const allowedStatuses = ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
    if (!allowedStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: 'Chat is only available for confirmed bookings' },
        { status: 403 }
      );
    }

    const conversationId = buildConversationId(booking.seekerId, booking.provider.userId);
    const conversationRef = adminDb.collection('conversations').doc(conversationId);
    const receiverId = isSeeker ? booking.provider.userId : booking.seekerId;

    const seekerName = `${booking.seeker.firstName} ${booking.seeker.lastName}`;
    const providerName = `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;
    const seekerAvatar = booking.seeker.profileImage || '';
    const providerAvatar = booking.provider.user.profileImage || '';

    const conversationSnapshot = await conversationRef.get();
    if (!conversationSnapshot.exists) {
      await conversationRef.set({
        seekerId: booking.seekerId,
        providerId: booking.provider.userId,
        seekerName,
        providerName,
        seekerAvatar,
        providerAvatar,
        participants: [booking.seekerId, booking.provider.userId],
        serviceName: booking.service.name,
        lastMessage: '',
        lastMessageAt: null,
        createdAt: new Date().toISOString(),
      });
    }

    const trimmedContent = content.trim();

    const messageRef = await conversationRef.collection('messages').add({
      senderId: decoded.userId,
      receiverId,
      content: trimmedContent,
      bookingId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    await conversationRef.update({
      lastMessage: trimmedContent,
      lastMessageAt: new Date().toISOString(),
      serviceName: booking.service.name,
    });

    // Send push notification to the recipient
    const senderName = isSeeker
      ? `${booking.seeker.firstName} ${booking.seeker.lastName}`
      : `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

    sendChatNotification({
      recipientUserId: receiverId,
      senderName,
      messagePreview: trimmedContent,
      bookingId,
    });

    return NextResponse.json(
      {
        message: {
          id: messageRef.id,
          senderId: decoded.userId,
          receiverId,
          content: trimmedContent,
          timestamp: new Date().toISOString(),
          read: false,
          bookingId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chat message POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET /api/chat/messages?conversationId=... — fetch messages for a conversation (server-side)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    if (!conversationId) return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });

    const conversationRef = adminDb.collection('conversations').doc(conversationId);
    const conversationSnapshot = await conversationRef.get();
    if (!conversationSnapshot.exists) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const conversation = conversationSnapshot.data();
    const isParticipant = conversation?.seekerId === decoded.userId || conversation?.providerId === decoded.userId;
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const messagesSnapshot = await conversationRef.collection('messages').orderBy('timestamp', 'asc').get();
    const items = messagesSnapshot.docs.map((doc) => {
      const data: any = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : null,
        read: data.read || false,
        bookingId: data.bookingId || null,
      };
    });

    return NextResponse.json({ messages: items }, { status: 200 });
  } catch (error) {
    console.error('Chat messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
