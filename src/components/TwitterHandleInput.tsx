import { useState } from 'react';
import { AtSign, CheckCircle, XCircle } from 'lucide-react';

interface TwitterHandleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TwitterHandleInput({ value, onChange }: TwitterHandleInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateHandle = (handle: string) => {
    // Basic Twitter handle validation
    const isValidHandle = /^[A-Za-z0-9_]{1,15}$/.test(handle);
    setIsValid(handle === '' ? null : isValidHandle);
    onChange(handle);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <AtSign className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => validateHandle(e.target.value)}
          className={`pl-10 pr-10 py-3 w-full rounded-lg border ${
            isValid === true
              ? 'border-green-500 focus:ring-green-500'
              : isValid === false
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          } focus:border-transparent focus:ring-2 transition-colors`}
          placeholder="Enter Twitter handle (without @)"
        />
        {isValid !== null && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      {isValid === false && (
        <p className="mt-1 text-sm text-red-500">
          Twitter handle must be 1-15 characters and can only contain letters, numbers, and underscores
        </p>
      )}
    </div>
  );
}