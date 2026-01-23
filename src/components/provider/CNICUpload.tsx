'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CNICUploadProps {
  onUploadSuccess?: () => void;
}

export const CNICUpload: React.FC<CNICUploadProps> = ({ onUploadSuccess }) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('File must be JPEG or PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = () => {
    if (!frontFile || !backFile) {
      toast.error('Please upload both CNIC front and back images');
      return;
    }

    // TODO: call API to upload CNIC images
    toast.success('CNIC uploaded successfully');
    onUploadSuccess && onUploadSuccess();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-slate-800">Upload CNIC</h2>
      <p className="text-sm text-slate-500">Please upload front and back images of your CNIC.</p>

      {/* Front CNIC */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">CNIC Front</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => handleFileChange(e, setFrontFile)}
          className="block w-full text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-2
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:bg-emerald-100 file:text-emerald-700
                     file:font-medium hover:file:bg-emerald-200
                     transition-all duration-200"
        />
        {frontFile && <p className="text-sm text-slate-600 mt-1">Selected: {frontFile.name}</p>}
      </div>

      {/* Back CNIC */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">CNIC Back</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => handleFileChange(e, setBackFile)}
          className="block w-full text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-2
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:bg-emerald-100 file:text-emerald-700
                     file:font-medium hover:file:bg-emerald-200
                     transition-all duration-200"
        />
        {backFile && <p className="text-sm text-slate-600 mt-1">Selected: {backFile.name}</p>}
      </div>

      <button
        onClick={handleUpload}
        className="
          w-full py-2 rounded-xl bg-emerald-600 text-white font-medium
          hover:bg-emerald-700 active:scale-95 transition-transform duration-150 shadow
        "
      >
        Upload CNIC
      </button>
    </div>
  );
};
