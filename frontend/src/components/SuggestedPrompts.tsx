interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <p className="text-sm text-gray-500 mb-3 font-medium">Try saying:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-amazon-orange hover:text-amazon-dark hover:shadow-md transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
