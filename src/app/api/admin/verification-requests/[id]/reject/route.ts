import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: Await params (Next.js 15+)
    const { id: providerId } = await context.params;

    console.log("Rejecting provider:", providerId);

    // Authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can reject verification requests' },
        { status: 403 }
      );
    }

    // Body validation
    const { reason } = await req.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: { user: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.user) {
      return NextResponse.json(
        { error: 'Provider user not found' },
        { status: 404 }
      );
    }

    // ✅ Single update (removed duplicate)
    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        verificationStatus: 'REJECTED',
      },
    });

    // Update documents
    await prisma.providerDocument.updateMany({
      where: {
        providerId,
        status: 'PENDING',
      },
      data: {
        status: 'REJECTED',
      },
    });

    // ✅ Email (wrapped to prevent crash)
    try {
      const emailHtml = `
        <h2>Verification Update Required</h2>
        <p>Reason: ${reason}</p>
      `;

      await sendEmail(
        provider.user.email,
        'Verification Update Required',
        emailHtml
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Do NOT break API if email fails
    }

    return NextResponse.json(
      { message: 'Provider rejected successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reject verification error:', error);
    return NextResponse.json(
      { error: 'Failed to reject verification' },
      { status: 500 }
    );
  }
}