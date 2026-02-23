import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  const existingToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!existingToken || existingToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: existingToken.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Mark email as verified
  const updatedUser = await prisma.user.update({
    where: { id: existingToken.userId },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      // Set status to ACTIVE only if phone is also verified
      status: user.phoneVerified ? "ACTIVE" : "UNVERIFIED",
    },
  });

  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.json({
    message: "Email verified successfully",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      status: updatedUser.status,
    },
  });
}