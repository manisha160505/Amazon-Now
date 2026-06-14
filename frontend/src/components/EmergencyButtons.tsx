import { Thermometer, PartyPopper, Film, Home, Baby } from 'lucide-react';

interface EmergencyAction {
  label: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const actions: EmergencyAction[] = [
  { label: 'Feeling Sick', icon: <Thermometer size={20} />, prompt: 'I have a fever and need essentials', color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' },
  { label: 'Party Time', icon: <PartyPopper size={20} />, prompt: 'Guests are coming over in 30 minutes', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' },
  { label: 'Movie Night', icon: <Film size={20} />, prompt: 'I need snacks for movie night', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
  { label: 'New Home Setup', icon: <Home size={20} />, prompt: 'I am moving into a new apartment', color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' },
  { label: 'Baby Essentials', icon: <Baby size={20} />, prompt: 'I need baby essentials', color: 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100' },
];

interface EmergencyButtonsProps {
  onSelect: (prompt: string) => void;
}

export default function EmergencyButtons({ onSelect }: EmergencyButtonsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <p className="text-sm text-gray-500 mb-3 font-medium">Emergency Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelect(action.prompt)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${action.color}`}
          >
            {action.icon}
            <span className="text-xs font-semibold text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
