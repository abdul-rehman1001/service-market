import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { validateCNIC } from '@/lib/validation/documentValidation';
import { Prisma } from '@prisma/client';

// Valid enum values matching Prisma schema exactly
const VALID_DOCUMENT_TYPES = ['CNIC_FRONT', 'CNIC_BACK', 'CERTIFICATE', 'OTHER'] as const;
const VALID_DOCUMENT_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

/**
 * POST - Upload provider document
 * 
 * This endpoint receives a document that's already been uploaded to Cloudinary via client-side upload.
 * The frontend should:
 * 1. Use client-side unsigned upload to Cloudinary via getClientUploadConfig()
 * 2. Send the secure_url, file metadata to this endpoint
 * 3. This endpoint validates and stores the metadata in database
 * 
 * Request body:
 * {
 *   "fileUrl": "https://res.cloudinary.com/.../image.jpg",
 *   "fileName": "cnic_front.jpg",
 *   "fileSize": 1024000,
 *   "mimeType": "image/jpeg",
 *   "documentType": "CNIC_FRONT",
 *   "cnicNumber": "1234567890123",     // optional, for CNIC docs
 *   "publicId": "service-market/..."   // optional
 * }
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await context.params;

    console.log("Provider ID (POST):", providerId);

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

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can upload documents' },
        { status: 403 }
      );
    }

    // باقي your existing POST logic stays the same

    const body = await req.json();
    const {
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      documentType,
      cnicNumber,
      publicId,
    } = body;

    // ========== DEFENSIVE VALIDATION ==========
    
    // Validate required fields
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json(
        { error: 'File URL is required and must be a string' },
        { status: 400 }
      );
    }

    if (!documentType || typeof documentType !== 'string') {
      return NextResponse.json(
        { error: 'Document type is required and must be a string' },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'File name is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof fileSize !== 'number' || fileSize < 0) {
      return NextResponse.json(
        { error: 'File size must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!mimeType || typeof mimeType !== 'string') {
      return NextResponse.json(
        { error: 'MIME type is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate document type enum value (case-sensitive exact match)
    if (!VALID_DOCUMENT_TYPES.includes(documentType as any)) {
      return NextResponse.json(
        { 
          error: `Invalid document type. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`,
          received: documentType,
        },
        { status: 400 }
      );
    }

    // Validate mime type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Only JPEG and PNG images are allowed' },
        { status: 400 }
      );
    }

    // All values must match Prisma enum exactly
    const validatedDocumentType = documentType as typeof VALID_DOCUMENT_TYPES[number];
    const validatedStatus = 'PENDING' as typeof VALID_DOCUMENT_STATUS[number];

    // Validate file size limit (5MB for all images)
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 413 }
      );
    }

    // ========== RELATION INTEGRITY CHECK ==========

    // Verify provider exists (confirms FK will succeed)
    let provider;
    try {
      provider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        select: {
          id: true,
          userId: true,
          cnic: true,
          verificationStatus: true,
        },
      });
    } catch (err) {
      console.error('Error finding provider:', err);
      return NextResponse.json(
        { error: 'Failed to fetch provider profile' },
        { status: 500 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Verify provider can only upload their own documents
    if (provider.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only upload documents for your own profile' },
        { status: 403 }
      );
    }

    // ========== CNIC VALIDATION ==========

    if (
      (validatedDocumentType === 'CNIC_FRONT' || validatedDocumentType === 'CNIC_BACK') &&
      cnicNumber
    ) {
      const cnicValidation = validateCNIC(cnicNumber);
      if (!cnicValidation.isValid) {
        return NextResponse.json(
          { error: cnicValidation.error },
          { status: 400 }
        );
      }

      // Update provider CNIC if different
      if (provider.cnic !== cnicNumber) {
        try {
          await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { cnic: cnicNumber },
          });
        } catch (err) {
          console.error('Error updating CNIC:', err);
          // Continue anyway - document can still be saved
        }
      }
    }

    // ========== CREATE DOCUMENT ==========

    let document;
    try {
      document = await prisma.providerDocument.create({
        data: {
          providerId,
          documentType: validatedDocumentType,
          fileName,
          fileUrl,
          fileSize,
          mimeType,
          status: validatedStatus,
        } as any, // Prisma client not yet regenerated with schema changes
      });
    } catch (err) {
      // Handle Prisma-specific errors
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', err.code);
        console.error('Prisma error message:', err.message);

        if (err.code === 'P2003') {
          // Foreign key violation
          return NextResponse.json(
            { error: 'Invalid provider reference' },
            { status: 400 }
          );
        }
        if (err.code === 'P2014') {
          // Required field missing
          return NextResponse.json(
            { error: 'Missing required document fields' },
            { status: 400 }
          );
        }
      }

      console.error('Document upload error:', err);
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 500 }
      );
    }

    // ========== UPDATE VERIFICATION STATUS ==========

    try {
      await prisma.serviceProvider.update({
        where: { id: providerId },
        data: {
          verificationStatus: 'PENDING',
        },
      });
    } catch (err) {
      console.error('Error updating verification status:', err);
      // Continue anyway - document was already saved
    }

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          fileSize: (document as any).fileSize || fileSize,
          fileName: (document as any).fileName || fileName,
          status: document.status,
          createdAt: document.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}


// GET - Fetch provider's documents
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await context.params;

    console.log("Provider ID (GET):", providerId);

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

    // Now this will work correctly
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // باقي your logic unchanged

    // Check authorization - only the provider themselves or admin can view
    if (provider.userId !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch documents
    let documents;
    try {
      documents = await prisma.providerDocument.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error fetching documents:', err.code, err.message);
      } else {
        console.error('Fetch documents error:', err);
      }
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        documents: documents || [],
        count: documents?.length || 0,
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
