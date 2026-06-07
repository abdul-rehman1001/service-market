import { NextRequest, NextResponse } from "next/server";
import { CMS_STATIC_PAGE_KEYS } from "@/lib/cms-pages";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

// GET — fetch a content page by ?page=about-us | terms | privacy
// Also returns all pages if no page param is given
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");

    if (page) {
      const content = await prisma.content.findUnique({ where: { page } });
      return NextResponse.json({ content: content || { page, body: "" } });
    }

    // Return all content pages
    const pages = await prisma.content.findMany({ orderBy: { page: "asc" } });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

// PUT — create or update a content page (admin only)
export async function PUT(req: NextRequest) {
  try {
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

    const { page, body } = await req.json();

    if (!page || typeof body !== "string") {
      return NextResponse.json(
        { error: "page and body are required" },
        { status: 400 }
      );
    }

    if (!CMS_STATIC_PAGE_KEYS.includes(page)) {
      return NextResponse.json(
        { error: `Invalid page. Must be one of: ${CMS_STATIC_PAGE_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    const content = await prisma.content.upsert({
      where: { page },
      create: { page, body },
      update: { body },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Content PUT error:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
