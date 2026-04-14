import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await context.params;

    console.log("Approving provider:", providerId);

    // Get token and verify authentication
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

    // Verify user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can approve verification requests' },
        { status: 403 }
      );
    }

    // Get provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        user: true,
        documents: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    const pendingCnicFront = provider.documents.find(
      (doc) => doc.documentType === 'CNIC_FRONT' && doc.status === 'PENDING'
    );
    const pendingCnicBack = provider.documents.find(
      (doc) => doc.documentType === 'CNIC_BACK' && doc.status === 'PENDING'
    );

    if (!pendingCnicFront || !pendingCnicBack) {
      return NextResponse.json(
        {
          error:
            'Cannot approve provider verification until both CNIC front and CNIC back are submitted in pending status.',
        },
        { status: 400 }
      );
    }

    // Update provider verification status
    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        verificationStatus: 'APPROVED',
      },
    });

    // Update all documents to APPROVED
    await prisma.providerDocument.updateMany({
      where: {
        providerId,
        status: 'PENDING',
      },
      data: {
        status: 'APPROVED',
      },
    });

    // Send approval email to provider
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Verification Approved! 🎉</h2>
        <p>Hello ${provider.user.firstName},</p>
        <p>Great news! Your provider verification has been <strong>approved</strong>.</p>
        <p>You can now:</p>
        <ul>
          <li>Create and manage services</li>
          <li>Accept booking requests</li>
          <li>Build your portfolio</li>
          <li>Start earning as a verified provider</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/dashboard" 
             style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for choosing Service Market!
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Service Market - Your trusted service marketplace
        </p>
      </div>
    `;

    await sendEmail(
      provider.user.email,
      'Verification Approved - Service Market',
      emailHtml
    );

    // Send push notification
    sendNotification({
      userId: provider.userId,
      type: 'VERIFICATION_STATUS_CHANGED',
      data: {
        status: 'APPROVED',
      },
    });

    return NextResponse.json(
      {
        message: 'Provider verification approved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approve verification error:', error);
    return NextResponse.json(
      { error: 'Failed to approve verification' },
      { status: 500 }
    );
  }
}
