import { Loader2 } from 'lucide-react';

export function Loader({ size = 24, className = '', text }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <Loader2
        className="animate-spin text-blue-600"
        size={size}
      />

      {text && (
        <p className="mt-2 text-sm text-gray-500">
          {text}
        </p>
      )}
    </div>
  );
}