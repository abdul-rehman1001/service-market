import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const queryType = searchParams.get("queryType") || "";
    const userType = searchParams.get("userType") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Search by query number, user name, email
    if (search) {
      where.OR = [
        { queryNumber: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by query type
    if (queryType) {
      where.queryType = queryType;
    }

    // Filter by user type (role)
    if (userType) {
      where.user = { ...where.user, role: userType };
    }

    // Date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [queries, total] = await Promise.all([
      prisma.userQuery.findMany({
        where,
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userQuery.count({ where }),
    ]);

    // Statistics
    const [totalQueries, openCount, inProgressCount, resolvedCount, closedCount] =
      await Promise.all([
        prisma.userQuery.count(),
        prisma.userQuery.count({ where: { status: "OPEN" } }),
        prisma.userQuery.count({ where: { status: "IN_PROGRESS" } }),
        prisma.userQuery.count({ where: { status: "RESOLVED" } }),
        prisma.userQuery.count({ where: { status: "CLOSED" } }),
      ]);

    // Average response time (for queries that have been replied to)
    const repliedQueries = await prisma.userQuery.findMany({
      where: { repliedAt: { not: null } },
      select: { createdAt: true, repliedAt: true },
    });

    let avgResponseTimeHours = 0;
    if (repliedQueries.length > 0) {
      const totalMs = repliedQueries.reduce((sum, q) => {
        const diff = new Date(q.repliedAt!).getTime() - new Date(q.createdAt).getTime();
        return sum + diff;
      }, 0);
      avgResponseTimeHours = Math.round((totalMs / repliedQueries.length) / (1000 * 60 * 60) * 10) / 10;
    }

    return NextResponse.json({
      queries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        total: totalQueries,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
        avgResponseTimeHours,
      },
    });
  } catch (error) {
    console.error("Queries GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queries" },
      { status: 500 }
    );
  }
}
