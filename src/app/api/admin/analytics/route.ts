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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const trendPeriod = searchParams.get("trendPeriod") || "daily"; // daily | weekly | monthly
    const growthMonths = parseInt(searchParams.get("growthMonths") || "12");

    // ── Overall Stats ──────────────────────────────────────────────
    const [totalUsers, totalProviders, totalBookings, totalCategories, totalReviews] =
      await Promise.all([
        prisma.user.count({ where: { status: { not: "DELETED" } } }),
        prisma.serviceProvider.count(),
        prisma.booking.count(),
        prisma.serviceCategory.count({ where: { isActive: true } }),
        prisma.review.count(),
      ]);

    // Active bookings (not cancelled/completed)
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "EN_ROUTE", "IN_PROGRESS", "HOLD"],
        },
      },
    });

    // This month bookings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = await prisma.booking.count({
      where: { createdAt: { gte: monthStart } },
    });

    // ── Booking Trends ─────────────────────────────────────────────
    const bookingTrends = await getBookingTrends(trendPeriod);

    // ── User Growth ────────────────────────────────────────────────
    const userGrowth = await getUserGrowth(growthMonths);

    // ── Popular Categories ─────────────────────────────────────────
    const popularCategories = await getPopularCategories();

    // ── Booking Status Distribution ────────────────────────────────
    const statusDistribution = await getBookingStatusDistribution();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        activeBookings,
        thisMonthBookings,
        totalCategories,
        totalReviews,
      },
      bookingTrends,
      userGrowth,
      popularCategories,
      statusDistribution,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// ── Helper: Booking Trends ───────────────────────────────────────────
async function getBookingTrends(period: string) {
  const now = new Date();
  let startDate: Date;
  let groupByFormat: string;

  switch (period) {
    case "weekly":
      // Last 12 weeks
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 84);
      groupByFormat = "week";
      break;
    case "monthly":
      // Last 12 months
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      groupByFormat = "month";
      break;
    default:
      // Last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      groupByFormat = "day";
  }

  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped = new Map<string, { total: number; completed: number; cancelled: number }>();

  for (const booking of bookings) {
    const key = formatDateKey(booking.createdAt, groupByFormat);
    const current = grouped.get(key) || { total: 0, completed: 0, cancelled: 0 };
    current.total++;
    if (booking.status === "COMPLETED") current.completed++;
    if (booking.status === "CANCELLED" || booking.status === "AUTO_CANCELLED")
      current.cancelled++;
    grouped.set(key, current);
  }

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    total: data.total,
    completed: data.completed,
    cancelled: data.cancelled,
  }));
}

// ── Helper: User Growth ──────────────────────────────────────────────
async function getUserGrowth(months: number) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "DELETED" },
    },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped = new Map<string, { seekers: number; providers: number }>();

  for (const user of users) {
    const key = formatDateKey(user.createdAt, "month");
    const current = grouped.get(key) || { seekers: 0, providers: 0 };
    if (user.role === "PROVIDER") current.providers++;
    else if (user.role === "SEEKER") current.seekers++;
    grouped.set(key, current);
  }

  return Array.from(grouped.entries()).map(([month, data]) => ({
    month,
    seekers: data.seekers,
    providers: data.providers,
    total: data.seekers + data.providers,
  }));
}

// ── Helper: Popular Categories ───────────────────────────────────────
async function getPopularCategories() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      services: {
        select: {
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });

  const withCounts = categories.map((cat) => {
    const totalBookings = cat.services.reduce(
      (sum, svc) => sum + svc._count.bookings,
      0
    );
    return {
      id: cat.id,
      name: cat.name,
      bookings: totalBookings,
    };
  });

  // Sort by bookings descending, take top 10
  withCounts.sort((a, b) => b.bookings - a.bookings);
  return withCounts.slice(0, 10);
}

// ── Helper: Booking Status Distribution ──────────────────────────────
async function getBookingStatusDistribution() {
  const statuses = [
    "HOLD",
    "PENDING",
    "CONFIRMED",
    "EN_ROUTE",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "AUTO_CANCELLED",
  ] as const;

  const counts = await Promise.all(
    statuses.map(async (status) => ({
      status,
      count: await prisma.booking.count({ where: { status } }),
    }))
  );

  return counts.filter((c) => c.count > 0);
}

// ── Helper: Format Date Key ──────────────────────────────────────────
function formatDateKey(date: Date, format: string): string {
  const d = new Date(date);
  switch (format) {
    case "day":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    case "week": {
      // Get the Monday of the week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
    }
    case "month":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    default:
      return d.toISOString().split("T")[0];
  }
}
