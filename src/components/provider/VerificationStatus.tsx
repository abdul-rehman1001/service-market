'use client';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'rejected';
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  let text = '';
  let color = '';

  switch (status) {
    case 'pending':
      text = 'Your verification is pending';
      color = 'text-yellow-600';
      break;
    case 'verified':
      text = 'Your identity is verified ✅';
      color = 'text-green-600';
      break;
    case 'rejected':
      text = 'Your verification was rejected ❌';
      color = 'text-red-600';
      break;
  }

  return (
    <div className={`p-4 rounded-lg border ${color} font-medium text-center`}>
      {text}
    </div>
  );
};
