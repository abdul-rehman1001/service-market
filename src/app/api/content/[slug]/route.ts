import { NextRequest, NextResponse } from "next/server";
import { isValidCmsStaticSlug } from "@/lib/cms-pages";
import prisma from "@/lib/prisma";

// Public endpoint — fetch content page by slug
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!isValidCmsStaticSlug(slug)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const content = await prisma.content.findUnique({ where: { page: slug } });

    return NextResponse.json({
      content: content ? { page: content.page, body: content.body } : null,
    });
  } catch (error) {
    console.error("Public content error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
