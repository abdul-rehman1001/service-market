import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';

const SUPPORTING_DOCUMENT_TYPES = ['CERTIFICATE', 'OTHER'] as const;

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
      include: { user: true, documents: true },
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

    const pendingCnicDocuments = provider.documents?.filter(
      (doc) =>
        doc.status === 'PENDING' &&
        (doc.documentType === 'CNIC_FRONT' || doc.documentType === 'CNIC_BACK')
    ) || [];

    const pendingSupportingDocuments = provider.documents?.filter(
      (doc) =>
        doc.status === 'PENDING' &&
        SUPPORTING_DOCUMENT_TYPES.includes(doc.documentType as (typeof SUPPORTING_DOCUMENT_TYPES)[number])
    ) || [];

    const rejectVerification = pendingCnicDocuments.length > 0;
    const rejectSupportingDocuments =
      provider.verificationStatus === 'APPROVED' && pendingSupportingDocuments.length > 0 && !rejectVerification;

    if (!rejectVerification && !rejectSupportingDocuments) {
      return NextResponse.json(
        { error: 'No pending verification or supporting documents were found to reject' },
        { status: 400 }
      );
    }

    if (rejectVerification) {
      await prisma.serviceProvider.update({
        where: { id: providerId },
        data: {
          verificationStatus: 'REJECTED',
        },
      });

      await prisma.providerDocument.updateMany({
        where: {
          providerId,
          documentType: {
            in: ['CNIC_FRONT', 'CNIC_BACK'],
          },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });
    } else {
      await prisma.providerDocument.updateMany({
        where: {
          providerId,
          documentType: {
            in: [...SUPPORTING_DOCUMENT_TYPES],
          },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });
    }

    // ✅ Email (wrapped to prevent crash)
    try {
      const emailHtml = rejectVerification
        ? `
        <h2>Verification Update Required</h2>
        <p>Reason: ${reason}</p>
      `
        : `
        <h2>Supporting Documents Rejected</h2>
        <p>Reason: ${reason}</p>
      `;

      await sendEmail(
        provider.user.email,
        rejectVerification ? 'Verification Update Required' : 'Supporting Documents Update Required',
        emailHtml
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Do NOT break API if email fails
    }

    // Send push notification
    sendNotification({
      userId: provider.userId,
      type: rejectVerification ? 'VERIFICATION_STATUS_CHANGED' : 'SYSTEM_UPDATE',
      data: {
        status: 'REJECTED',
        kind: rejectVerification ? 'VERIFICATION' : 'SUPPORTING_DOCUMENTS',
      },
    });

    return NextResponse.json(
      { message: rejectVerification ? 'Provider rejected successfully' : 'Supporting documents rejected successfully' },
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