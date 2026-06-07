'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  imageUrl?: string;
}

export default function ImageUploader({ onImageUpload, imageUrl }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      onImageUpload(data.secure_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(`Upload error: ${errorMessage}`);
      console.error('Cloudinary upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-5">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Profile preview"
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-[#10B981] ring-offset-2 ring-offset-[#F9FAFB]"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-2 -top-2 rounded-full bg-[#EF4444] p-1.5 text-white shadow-md transition hover:bg-[#DC2626]"
              disabled={isLoading}
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-white text-[#6B7280] transition hover:border-[#10B981] hover:text-[#059669]"
          >
            <Camera className="h-7 w-7" />
            <span className="text-[10px] font-medium">Add photo</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] transition',
            'hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/30 hover:text-[#059669] disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <Upload className="h-4 w-4" />
          {isLoading ? 'Uploading...' : preview ? 'Change photo' : 'Upload profile photo'}
        </button>

        <p className="text-center text-xs text-[#6B7280]">JPG, PNG or GIF · max 5MB · optional</p>
      </div>

      {error ? (
        <p className="mt-2 text-center text-sm text-[#EF4444]">{error}</p>
      ) : null}
    </div>
  );
}
