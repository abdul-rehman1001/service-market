import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { validateCNIC } from '@/lib/validation/documentValidation';
import { Prisma } from '@prisma/client';

type CnicSidePayload = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

function validateSidePayload(side: CnicSidePayload | undefined, sideLabel: 'front' | 'back') {
  if (!side || typeof side !== 'object') {
    return `${sideLabel} CNIC document payload is required`;
  }

  if (!side.fileUrl || typeof side.fileUrl !== 'string') {
    return `${sideLabel} CNIC file URL is required`;
  }

  if (!side.fileName || typeof side.fileName !== 'string') {
    return `${sideLabel} CNIC file name is required`;
  }

  if (typeof side.fileSize !== 'number' || side.fileSize <= 0) {
    return `${sideLabel} CNIC file size must be a positive number`;
  }

  if (!side.mimeType || typeof side.mimeType !== 'string') {
    return `${sideLabel} CNIC MIME type is required`;
  }

  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(side.mimeType)) {
    return `${sideLabel} CNIC must be JPEG or PNG image`;
  }

  if (side.fileSize > 5 * 1024 * 1024) {
    return `${sideLabel} CNIC file size must be less than 5MB`;
  }

  return null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await context.params;

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can submit CNIC verification requests' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const cnicNumber = String(body?.cnicNumber || '').trim();
    const frontDocument = body?.frontDocument as CnicSidePayload | undefined;
    const backDocument = body?.backDocument as CnicSidePayload | undefined;

    const cnicValidation = validateCNIC(cnicNumber);
    if (!cnicValidation.isValid) {
      return NextResponse.json({ error: cnicValidation.error }, { status: 400 });
    }

    const frontError = validateSidePayload(frontDocument, 'front');
    if (frontError) {
      return NextResponse.json({ error: frontError }, { status: 400 });
    }

    const backError = validateSidePayload(backDocument, 'back');
    if (backError) {
      return NextResponse.json({ error: backError }, { status: 400 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        userId: true,
        cnic: true,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only submit CNIC for your own profile' },
        { status: 403 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      await tx.providerDocument.deleteMany({
        where: {
          providerId,
          documentType: {
            in: ['CNIC_FRONT', 'CNIC_BACK'],
          },
          status: {
            in: ['PENDING', 'REJECTED'],
          },
        },
      });

      const front = await tx.providerDocument.create({
        data: {
          providerId,
          documentType: 'CNIC_FRONT',
          fileName: frontDocument!.fileName,
          fileUrl: frontDocument!.fileUrl,
          fileSize: frontDocument!.fileSize,
          mimeType: frontDocument!.mimeType,
          status: 'PENDING',
        },
      });

      const back = await tx.providerDocument.create({
        data: {
          providerId,
          documentType: 'CNIC_BACK',
          fileName: backDocument!.fileName,
          fileUrl: backDocument!.fileUrl,
          fileSize: backDocument!.fileSize,
          mimeType: backDocument!.mimeType,
          status: 'PENDING',
        },
      });

      await tx.serviceProvider.update({
        where: { id: providerId },
        data: {
          cnic: cnicNumber,
          verificationStatus: 'PENDING',
        },
      });

      return { front, back };
    });

    return NextResponse.json(
      {
        message: 'CNIC verification request submitted successfully',
        documents: {
          frontId: created.front.id,
          backId: created.back.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'CNIC already belongs to another provider' },
        { status: 409 }
      );
    }

    console.error('CNIC verification request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit CNIC verification request' },
      { status: 500 }
    );
  }
}
