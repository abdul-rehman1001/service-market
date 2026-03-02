import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// GET — full query details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query = await prisma.userQuery.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            profileImage: true,
            city: true,
            address: true,
            createdAt: true,
          },
        },
      },
    });

    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // If bookingId is present, fetch booking details
    let booking = null;
    if (query.bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: query.bookingId },
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          scheduledStart: true,
          scheduledEnd: true,
          service: { select: { name: true } },
        },
      });
    }

    return NextResponse.json({ query, booking });
  } catch (error) {
    console.error("Query detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch query details" },
      { status: 500 }
    );
  }
}

// PATCH — update query status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();
    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.userQuery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status };
    if (status === "RESOLVED" && !existing.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const query = await prisma.userQuery.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ query });
  } catch (error) {
    console.error("Query status update error:", error);
    return NextResponse.json(
      { error: "Failed to update query status" },
      { status: 500 }
    );
  }
}

// POST — reply to user via email
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { reply } = await req.json();
    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { error: "Reply message is required" },
        { status: 400 }
      );
    }

    const query = await prisma.userQuery.findUnique({
      where: { id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // Send email to user
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Service Market Support</h2>
        </div>
        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dear ${query.user.firstName} ${query.user.lastName},</p>
          <p>Thank you for contacting us. Here is our response to your query <strong>${query.queryNumber}</strong>:</p>
          <p><strong>Your Query:</strong> ${query.subject}</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
            ${reply.replace(/\n/g, "<br>")}
          </div>
          <p>If you have further questions, please don't hesitate to reach out.</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Best regards,<br>Service Market Support Team
          </p>
        </div>
      </div>
    `;

    await sendEmail(
      query.user.email,
      `Re: ${query.subject} (${query.queryNumber})`,
      emailHtml
    );

    // Update query with admin reply
    const updated = await prisma.userQuery.update({
      where: { id },
      data: {
        adminReply: reply.trim(),
        repliedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      message: "Reply sent successfully",
      query: updated,
    });
  } catch (error) {
    console.error("Query reply error:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
