'use client';

interface DocumentStatusProps {
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const DocumentStatus: React.FC<DocumentStatusProps> = ({ name, status }) => {
  let color = '';
  let text = '';

  switch (status) {
    case 'pending':
      color = 'text-yellow-600';
      text = 'Pending review';
      break;
    case 'approved':
      color = 'text-green-600';
      text = 'Approved ✅';
      break;
    case 'rejected':
      color = 'text-red-600';
      text = 'Rejected ❌';
      break;
  }

  return (
    <div className={`p-3 border rounded-lg flex justify-between items-center ${color}`}>
      <span>{name}</span>
      <span className="font-medium">{text}</span>
    </div>
  );
};
