import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebaseAdmin';
import admin from '@/lib/firebaseAdmin';

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
          select: { userId: true },
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

    const conversationId = `booking_${bookingId}`;
    const receiverId = isSeeker ? booking.provider.userId : booking.seekerId;

    // Add message to Firestore
    const messageRef = await adminDb
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add({
        senderId: decoded.userId,
        receiverId,
        content: content.trim(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

    // Update conversation's last message
   await adminDb.collection('conversations').doc(conversationId).set(
  {
    bookingId,
    participants: [booking.seekerId, booking.provider.userId],
    lastMessage: content.trim(),
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);

    return NextResponse.json(
      {
        message: {
          id: messageRef.id,
          senderId: decoded.userId,
          receiverId,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          read: false,
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
