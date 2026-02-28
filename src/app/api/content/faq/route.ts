import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public endpoint — fetch all FAQs
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: "asc" },
      select: { id: true, question: true, answer: true, order: true },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Public FAQ error:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
