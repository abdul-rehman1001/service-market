import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import admin from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value;
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(tokenCookie) as { userId: string } | null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    const fcmTokensRef = admin.firestore().collection('fcmTokens');

    // Check if this exact token already exists for this user
    const existing = await fcmTokensRef
      .where('userId', '==', decoded.userId)
      .where('token', '==', token)
      .get();

    if (!existing.empty) {
      // Update timestamp
      await existing.docs[0].ref.update({ updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return NextResponse.json({ success: true });
    }

    // Save new token
    await fcmTokensRef.add({
      userId: decoded.userId,
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register FCM token error:', error);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}
