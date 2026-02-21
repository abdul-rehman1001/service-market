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

  await prisma.user.update({
    where: { id: existingToken.userId },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
  });

  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ message: "Email verified successfully" });
}