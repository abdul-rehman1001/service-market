// src/app/api/chat/messages/read/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { adminDb } from "@/lib/firebaseAdmin";

const BATCH_LIMIT = 500;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Verify booking and participant
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: { select: { userId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isParticipant =
      booking.seekerId === decoded.userId || booking.provider.userId === decoded.userId;
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversationId = `booking_${bookingId}`;

    // Query unread messages for this user
    const unreadSnapshot = await adminDb
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .where("receiverId", "==", decoded.userId)
      .where("read", "==", false)
      .get();

    const docs = unreadSnapshot.docs;
    if (!docs.length) {
      // nothing to update
      return NextResponse.json({ updated: 0 }, { status: 200 });
    }

    // Chunk into batches of <= BATCH_LIMIT
    let totalUpdated = 0;
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const chunk = docs.slice(i, i + BATCH_LIMIT);
      const batch = adminDb.batch();
      chunk.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
      totalUpdated += chunk.length;
    }

    return NextResponse.json({ updated: totalUpdated }, { status: 200 });
  } catch (error: any) {
    console.error("Mark messages read error:", error);
    return NextResponse.json({ error: "Failed to mark as read", details: error?.message }, { status: 500 });
  }
}