import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
const verificationUrl = `${appUrl}/verify-email?token=${token}`;
await sendEmail(
  user.email,
  "Verify your email",
  `<p>Click below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`
);

    return NextResponse.json({ message: "Verification email sent" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}