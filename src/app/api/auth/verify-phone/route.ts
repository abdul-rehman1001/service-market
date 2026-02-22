import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, firebaseUid } = await req.json();

    if (!userId || !firebaseUid) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Phone verified successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}