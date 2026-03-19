import { NextRequest, NextResponse } from 'next/server';
import admin from '../../../../lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const db = admin.firestore();

    // Sample conversation 1
    const conversation1Id = 'booking_test-booking-001';
    await db.collection('conversations').doc(conversation1Id).set({
      bookingId: 'test-booking-001',
      seekerId: 'user-seeker-001',
      providerId: 'user-provider-001',
      seekerName: 'Ahmed Khan',
      providerName: 'Ali Plumber',
      seekerAvatar: '',
      providerAvatar: '',
      serviceName: 'Plumbing Repair',
      lastMessage: 'I will arrive at 3 PM',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Add messages to conversation 1
    await db
      .collection('conversations')
      .doc(conversation1Id)
      .collection('messages')
      .add({
        senderId: 'user-provider-001',
        receiverId: 'user-seeker-001',
        content: 'Hello! I received your booking request.',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: true,
      });

    await db
      .collection('conversations')
      .doc(conversation1Id)
      .collection('messages')
      .add({
        senderId: 'user-seeker-001',
        receiverId: 'user-provider-001',
        content: 'When can you start?',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: true,
      });

    await db
      .collection('conversations')
      .doc(conversation1Id)
      .collection('messages')
      .add({
        senderId: 'user-provider-001',
        receiverId: 'user-seeker-001',
        content: 'I will arrive at 3 PM',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

    // Sample conversation 2
    const conversation2Id = 'booking_test-booking-002';
    await db.collection('conversations').doc(conversation2Id).set({
      bookingId: 'test-booking-002',
      seekerId: 'user-seeker-001',
      providerId: 'user-provider-002',
      seekerName: 'Ahmed Khan',
      providerName: 'Hassan Electrician',
      seekerAvatar: '',
      providerAvatar: '',
      serviceName: 'Electrical Wiring',
      lastMessage: 'Work completed successfully!',
      lastMessageAt: new Date(Date.now() - 60000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    });

    // Add messages to conversation 2
    await db
      .collection('conversations')
      .doc(conversation2Id)
      .collection('messages')
      .add({
        senderId: 'user-provider-002',
        receiverId: 'user-seeker-001',
        content: 'Work completed successfully!',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: true,
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Sample data seeded successfully',
        conversations: [
          {
            id: conversation1Id,
            bookingId: 'test-booking-001',
            messages: 3,
          },
          {
            id: conversation2Id,
            bookingId: 'test-booking-002',
            messages: 1,
          },
        ],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = admin.firestore();
    
    const conversations = await db.collection('conversations').get();
    const stats = {
      totalConversations: conversations.size,
      conversations: [] as any[],
    };

    for (const doc of conversations.docs) {
      const data = doc.data();
      const messages = await db
        .collection('conversations')
        .doc(doc.id)
        .collection('messages')
        .get();

      stats.conversations.push({
        id: doc.id,
        bookingId: data.bookingId,
        seekerName: data.seekerName,
        providerName: data.providerName,
        serviceName: data.serviceName,
        lastMessage: data.lastMessage,
        messageCount: messages.size,
      });
    }

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error('Get data error:', error);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
