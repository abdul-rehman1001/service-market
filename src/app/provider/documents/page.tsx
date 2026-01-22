'use client';

import { useState } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import { DocumentUpload } from '@/components/provider/DocumentUpload';
import { DocumentStatus } from '@/components/provider/DocumentStatus';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<{ name: string; status: 'pending' | 'approved' | 'rejected' }[]>([]);

  const handleUploadSuccess = (docName: string) => {
    setDocuments((prev) => [...prev, { name: docName, status: 'pending' }]);
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-emerald-50 py-10">
      <div className="max-w-2xl w-full">
        <AuthCard>
          <h2 className="text-3xl font-bold text-emerald-700 text-center">Upload Certifications</h2>
        <p className="text-center text-gray-600 mt-2">
          Upload up to 3 certification documents in PDF format (Max size 2MB each)
        </p>

        <div className="mt-6 space-y-6">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} uploadedCount={documents.length} />

          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <DocumentStatus key={index} name={doc.name} status={doc.status} />
              ))}
            </div>
          )}
        </div>
        </AuthCard>
      </div>
    </div>
  );
}
