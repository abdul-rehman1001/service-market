import React from 'react';
import { ProviderProfileType } from '@/types/provider';
import { Phone, Mail, Award, FileCheck } from 'lucide-react';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderOverview({ provider }: Props) {
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const certificates = provider.documents.filter(doc => doc.documentType === 'CERTIFICATE');

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">About {fullName}</h2>
        {provider.user.bio ? (
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {provider.user.bio}
          </p>
        ) : (
          <p className="text-gray-500 italic">No bio available</p>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm font-medium">{provider.user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <Mail className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm font-medium break-all">{provider.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Certifications
          </h3>
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium">{cert.fileName}</span>
                </div>
                <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">
                  Approved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Professional Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{provider.yearsOfExperience}</p>
            <p className="text-sm text-gray-600">Years of Experience</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{provider.completedBookingsCount}</p>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{Number(provider.averageRating).toFixed(1)}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
