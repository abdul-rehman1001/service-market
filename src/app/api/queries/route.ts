import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const VALID_QUERY_TYPES = ["GENERAL", "SERVICE_ISSUE", "PAYMENT", "BOOKING", "ACCOUNT", "OTHER"] as const;

function createQueryNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `QRY-${datePart}-${randomPart}`;
}

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

    const body = await req.json();
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    const rawQueryType = typeof body?.queryType === "string" ? body.queryType.trim().toUpperCase() : "GENERAL";
    const queryType = VALID_QUERY_TYPES.includes(rawQueryType as (typeof VALID_QUERY_TYPES)[number])
      ? rawQueryType
      : "GENERAL";

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          seekerId: true,
          provider: { select: { userId: true } },
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const isParticipant = booking.seekerId === decoded.userId || booking.provider.userId === decoded.userId;
      if (!isParticipant) {
        return NextResponse.json({ error: "You can only attach your own bookings" }, { status: 403 });
      }
    }

    const query = await prisma.userQuery.create({
      data: {
        queryNumber: createQueryNumber(),
        userId: decoded.userId,
        subject,
        message,
        queryType,
        bookingId: bookingId || null,
      },
    });

    return NextResponse.json({ query }, { status: 201 });
  } catch (error) {
    console.error("Query create error:", error);
    return NextResponse.json({ error: "Failed to submit query" }, { status: 500 });
  }
}