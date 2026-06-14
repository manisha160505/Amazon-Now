import { Zap } from 'lucide-react';

interface FlashToggleProps {
  isFlashMode: boolean;
  onToggle: (value: boolean) => void;
}

export default function FlashToggle({ isFlashMode, onToggle }: FlashToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-200 rounded-full p-1 shadow-inner">
      <button
        onClick={() => onToggle(false)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !isFlashMode
            ? 'bg-white text-amazon-dark shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Normal Mode
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
          isFlashMode
            ? 'bg-amazon-orange text-amazon-dark shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Zap size={14} className={isFlashMode ? 'fill-current' : ''} />
        Flash Mode
      </button>
    </div>
  );
}
