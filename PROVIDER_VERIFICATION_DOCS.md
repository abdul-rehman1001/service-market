# Provider Identity Verification & Document Management System

## 📋 Overview

Complete implementation of a Provider Identity Verification & Document Management system with secure file uploads, admin verification panel, and email notifications.

## ✅ Features Implemented

### 1. **Database Schema Updates**
- Updated `ProviderDocument` model with comprehensive fields:
  - `documentType` (CNIC_FRONT, CNIC_BACK, CERTIFICATE, OTHER)
  - `fileName`, `fileSize`, `mimeType`
  - `status` (PENDING, APPROVED, REJECTED)
  - `rejectionReason` for failed verifications
  - `uploadedAt` timestamps

- Added `DocumentType` enum for document categorization

### 2. **File Validation Utilities** (`src/lib/validation/documentValidation.ts`)

**CNIC Validation:**
- Exactly 13 digits required
- No special characters allowed
- Server-side validation

**File Size Limits:**
- CNIC Images (JPEG/PNG): Max 5MB
- Certificates (PDF): Max 2MB
- Other documents: Max 5MB

**MIME Type Validation:**
- CNIC: `image/jpeg`, `image/png`
- Certificates: `application/pdf`
- Proper error codes returned (400, 413)

### 3. **File Upload System** (`src/lib/cloudinary.ts`)

**Cloudinary Integration (Ready for Production):**
- Dynamic folder structure: `service-market/providers/{providerId}/documents`
- Automatic resource type detection (image vs raw)
- Mock implementation provided (no cloudinary dependency required)
- Easy migration path to real Cloudinary setup

**Installation for Production:**
```bash
npm install cloudinary
# Set environment variables:
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

### 4. **Provider Document Upload API**
**Route:** `POST /api/providers/[id]/documents`

**Features:**
- ✅ Authenticated users only (token required)
- ✅ PROVIDER role verification
- ✅ Self-only upload protection (provider can only upload their own docs)
- ✅ CNIC number validation (13 digits)
- ✅ Automatic CNIC storage in provider profile
- ✅ Automatic verification status update to PENDING
- ✅ Proper HTTP status codes:
  - `201` - Document uploaded successfully
  - `400` - Invalid input/format
  - `413` - File too large
  - `403` - Unauthorized access
  - `404` - Provider not found

**Request:**
```typescript
FormData:
  - file: File (image or PDF)
  - documentType: string (CNIC_FRONT, CNIC_BACK, CERTIFICATE, OTHER)
  - cnicNumber?: string (required for CNIC documents)
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "doc123",
    "fileSize": 1024000,
    "fileName": "cnic_front.jpg",
    "status": "PENDING",
    "createdAt": "2026-02-23T18:30:00Z"
  }
}
```

### 5. **Get Provider Documents**
**Route:** `GET /api/providers/[id]/documents`

**Features:**
- ✅ Provider or Admin access only
- ✅ Returns all documents with metadata
- ✅ Ordered by upload date (newest first)

### 6. **Get Provider Profile**
**Route:** `GET /api/providers/[id]`

**Returns:**
- Provider details and verification status
- Used by frontend for profile fetching

### 7. **Admin Verification Panel**
**Route:** `GET /api/admin/verification-requests`

**Features:**
- ✅ Admin-only access (403 if not admin)
- ✅ Fetches all PENDING and REJECTED requests
- ✅ Includes provider info, documents, and verification history
- ✅ Comprehensive data for review

### 8. **Approve Verification**
**Route:** `POST /api/admin/verification-requests/[id]/approve`

**On Approval:**
- ✅ Provider status → APPROVED
- ✅ All documents → APPROVED
- ✅ Email notification sent to provider with dashboard link
- ✅ Provider can now accept bookings

### 9. **Reject Verification**
**Route:** `POST /api/admin/verification-requests/[id]/reject`

**Required:**
- Admin comment/reason (mandatory)

**On Rejection:**
- ✅ Provider status → REJECTED
- ✅ All pending documents → REJECTED
- ✅ Rejection reason stored
- ✅ Email notification with feedback and re-upload instructions

### 10. **Provider Upload UI** (`src/app/provider/documents/page.tsx`)

**Features:**
- ✅ Clean, responsive interface
- ✅ Document type selector with CNIC number input
- ✅ File preview before upload
- ✅ Real-time file size display
- ✅ Status indicators (PENDING, APPROVED, REJECTED)
- ✅ Display rejection reasons with feedback
- ✅ View uploaded documents with links
- ✅ Verification status badge
- ✅ Loading and error states
- ✅ Form validation and error messages

### 11. **Admin Verification Panel UI** (`src/app/admin/verification/page.tsx`)

**Features:**
- ✅ List all pending verification requests
- ✅ Provider profile cards with avatar
- ✅ Document grid with preview links
- ✅ One-click approve/reject buttons
- ✅ Rejection modal with required reason field
- ✅ Processing states and loading indicators
- ✅ Success/error notifications
- ✅ Document status badges
- ✅ Provider contact information display
- ✅ Responsive design

## 🔒 Security Implementation

✅ **Token-Based Authentication**
- All routes require valid JWT token
- Token extracted from cookies

✅ **Role-Based Access Control**
- Provider routes: PROVIDER role only
- Admin routes: ADMIN role only
- Verify at each endpoint

✅ **Data Ownership**
- Providers can only access their own documents
- Cannot access other providers' data
- Admin can access all

✅ **File Validation**
- Server-side MIME type validation
- File size enforcement
- CNIC format validation
- No client-side trust

✅ **Input Sanitization**
- CNIC number: digits only, exactly 13
- Document type: enum validation
- Reason field: trimmed and required

## 📁 File Structure

```
src/
├── app/
│   ├── provider/
│   │   └── documents/
│   │       └── page.tsx       # Provider upload UI
│   ├── admin/
│   │   └── verification/
│   │       └── page.tsx       # Admin panel UI
│   └── api/
│       ├── providers/
│       │   └── [id]/
│       │       ├── route.ts            # Get provider
│       │       └── documents/
│       │           └── route.ts        # Upload & fetch docs
│       └── admin/
│           └── verification-requests/
│               ├── route.ts            # List requests
│               ├── [id]/
│               │   ├── approve/
│               │   │   └── route.ts    # Approve verification
│               │   └── reject/
│               │       └── route.ts    # Reject verification
├── lib/
│   ├── cloudinary.ts                   # File upload utility
│   └── validation/
│       └── documentValidation.ts       # File validators
└── prisma/
    └── schema.prisma                   # Updated database schema
```

## 🧪 Testing Scenarios

### Test Case 1: Valid CNIC Upload
```bash
✅ Upload CNIC front image (JPEG, <5MB)
✅ Provide valid 13-digit CNIC number
✅ Should succeed with 201 status
✅ Provider status → PENDING
```

### Test Case 2: Invalid CNIC Format
```bash
❌ Upload with CNIC: "123" (too short)
❌ Should return 400 Bad Request
❌ Error: "CNIC must be exactly 13 digits"
```

### Test Case 3: File Too Large
```bash
❌ Upload PDF >2MB for certificate
❌ Should return 413 Payload Too Large
❌ Error: "Certificate PDF size must not exceed 2MB"
```

### Test Case 4: Invalid File Type
```bash
❌ Upload .exe or .txt for CNIC
❌ Should return 400 Bad Request
❌ Error: "Invalid file type. Only JPEG and PNG images are allowed"
```

### Test Case 5: Unauthorized Access
```bash
❌ Access document upload without token
❌ Should return 401 Unauthorized
```

### Test Case 6: Non-Provider Access
```bash
❌ SEEKER tries to upload documents
❌ Should return 403 Forbidden
❌ Error: "Only providers can upload documents"
```

### Test Case 7: Cross-Provider Access
```bash
❌ Provider A tries to access Provider B's documents
❌ Should return 403 Access denied
```

### Test Case 8: Admin Approve
```bash
✅ Admin clicks approve on pending request
✅ Provider status → APPROVED
✅ Documents → APPROVED
✅ Email sent with dashboard link
✅ Provider can now create services
```

### Test Case 9: Admin Reject with Reason
```bash
✅ Admin clicks reject
✅ Provides detailed rejection reason
✅ Provider status → REJECTED
✅ Documents → REJECTED
✅ Email sent with rejection feedback
✅ Provider can re-upload corrected documents
```

### Test Case 10: Provider Sees Rejection Reason
```bash
✅ Provider checks uploaded documents
✅ Sees rejection reason in UI
✅ Can download original documents
✅ Can re-upload corrected versions
```

## 📧 Email Notifications

### Approval Email
- **To:** Provider email
- **Subject:** "Verification Approved - Service Market"
- **Content:**
  - Congratulations message
  - List of enabled features
  - Link to provider dashboard
  - Call to action

### Rejection Email
- **To:** Provider email
- **Subject:** "Verification Update Required - Service Market"
- **Content:**
  - Reason for rejection
  - What needs to be fixed
  - Link to re-upload documents
  - Support contact info

## 🚀 Deployment Setup

### Environment Variables
```env
# Cloudinary (optional, uses mock if not set)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (required for notifications)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

### Database Migration
```bash
# Already created: 20260223181310_add_document_fields
npx prisma migrate deploy
```

### Install Dependencies (for Cloudinary)
```bash
npm install cloudinary
```

## 📊 Status Lifecycle

```
Provider Registration
        ↓
    NOT_SUBMITTED
        ↓
   Uploads Documents
        ↓
    PENDING (Admin Review)
        ↓
   ┌───────────────────┐
   ↓                   ↓
APPROVED           REJECTED (Feedback sent)
   ↓                   ↓
Can Create         Re-upload Documents
Services               ↓
                   Back to PENDING
```

## 🔧 Future Enhancements

1. **Multi-Document Upload:**
   - Batch upload multiple files at once
   - Progress bars for each file

2. **Document Management:**
   - Edit uploaded document metadata
   - Delete individual documents
   - Reorder documents

3. **Enhanced Validation:**
   - OCR for CNIC verification
   - Certificate authenticity check
   - Background verification integration

4. **Analytics:**
   - Verification success rate
   - Average verification time
   - Document type statistics

5. **Webhooks:**
   - Real-time notification on status change
   - Integration with external systems

6. **API Rate Limiting:**
   - Prevent abuse
   - Implement per-IP limits

## 📝 Notes

- All timestamps are in UTC
- Documents are permanently deleted when provider is deleted (CASCADE)
- Provider CNIC is unique and cannot be duplicated
- Email notifications use configured SMTP server
- Mock Cloudinary implementation ready for production swap
