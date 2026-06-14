import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mic, MicOff } from 'lucide-react';

interface IntentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

// Web Speech API types (cross-browser)
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function IntentInput({ value, onChange, onSubmit, loading }: IntentInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChange(transcript);
        if (event.results[event.results.length - 1].isFinal) {
          setTimeout(() => onSubmit(), 500);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [onChange, onSubmit]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      onChange('');
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amazon-orange to-yellow-300 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you need right now?"
            rows={3}
            className="w-full px-6 py-5 text-lg text-gray-800 placeholder-gray-400 border-none outline-none resize-none"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles size={14} className="text-amazon-orange" />
                <span>Press Enter to generate your bundle</span>
              </div>
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isListening
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-amazon-orange hover:text-amazon-dark'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  {isListening ? 'Listening...' : 'Voice'}
                </button>
              )}
            </div>
            <button
              onClick={onSubmit}
              disabled={loading || !value.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-amazon-dark text-white rounded-xl font-medium hover:bg-amazon-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Flash It
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {isListening && (
        <p className="text-center text-sm text-red-600 mt-3 font-medium animate-pulse">
          🎤 Listening... tell us what happened
        </p>
      )}
    </div>
  );
}
