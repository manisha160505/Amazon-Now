import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mic, Wallet, X, MessageCircleQuestion, Globe } from 'lucide-react';
import AmazonHeader from '../components/AmazonHeader';
import AmazonFooter from '../components/AmazonFooter';
import IntentInput from '../components/IntentInput';
import SuggestedPrompts from '../components/SuggestedPrompts';
import EmergencyButtons from '../components/EmergencyButtons';
import { generateCart } from '../services/api';
import type { ClarifyingQuestion, GenerateCartResponse } from '../types';

const SUGGESTED_PROMPTS = [
  'I have a fever',
  'Guests are coming over',
  'I want to make pasta',
  'Need snacks for movie night',
  'I am moving into a new apartment',
  'I want to decorate my room',
];

const VOICE_EXAMPLES = [
  'My daughter has a fever',
  "I forgot tomorrow is Rakhi",
  'Friends are coming over to watch IPL',
  'I need baby essentials',
];

export default function FlashInputPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Support prefill from React Router state (internal navigation) or URL query param (browser extension)
  const statePrefill = (location.state as { prefill?: string } | null)?.prefill || '';
  const urlPrefill = new URLSearchParams(location.search).get('prefill') || '';
  const prefill = statePrefill || urlPrefill;

  const [query, setQuery] = useState(prefill);
  const isExtensionPrefill = Boolean(urlPrefill);
  const [budget, setBudget] = useState<number | ''>('');
  const [showBudget, setShowBudget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Smart context question flow
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pendingQuery, setPendingQuery] = useState('');

  useEffect(() => {
    if (prefill) {
      setQuery(prefill);
    }
  }, [prefill]);

  const finishCart = (cart: GenerateCartResponse) => {
    navigate('/cart', {
      state: {
        cart,
        query: pendingQuery || query,
        budget: budget ? Number(budget) : undefined,
      },
    });
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setPendingQuery(query);

    try {
      const response = await generateCart(
        query,
        budget ? Number(budget) : undefined,
        undefined
      );

      if (response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        setAnswers(response.prefilledContext || {});
        setLoading(false);
        return;
      }

      finishCart(response);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to generate bundle. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitAnswers = async () => {
    if (!pendingQuery) return;
    setLoading(true);
    setError('');

    try {
      const response = await generateCart(
        pendingQuery,
        budget ? Number(budget) : undefined,
        answers
      );
      finishCart(response);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to generate bundle. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setQuery(prompt);
    setQuestions(null);
    setAnswers({});
  };

  const allAnswered =
    questions !== null && questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AmazonHeader searchValue={query} onSearch={setQuery} />

      {/* Flash banner */}
      <div className="bg-gradient-to-r from-amazon-orange to-yellow-300 text-amazon-dark py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} />
          <span>Flash Mode Active — Describe your situation and get everything you need instantly</span>
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            {isExtensionPrefill ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 mb-4">
                <Globe size={16} />
                <span className="text-sm font-medium">Imported from webpage</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-4">
                <Mic size={16} className="text-amazon-orange" />
                <span className="text-sm font-medium text-gray-700">Voice input supported</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Tell me what happened
            </h1>
            <p className="text-gray-600">
              Type or speak your situation in one sentence. We will build the perfect bundle.
            </p>
          </div>

          {!questions ? (
            <>
              <IntentInput
                value={query}
                onChange={setQuery}
                onSubmit={handleSubmit}
                loading={loading}
              />

              {/* Optional budget input */}
              <div className="mt-3 flex items-center justify-center">
                {!showBudget ? (
                  <button
                    onClick={() => setShowBudget(true)}
                    className="flex items-center gap-1.5 text-sm text-amazon-blue hover:text-amazon-orange transition-colors"
                  >
                    <Wallet size={14} />
                    Set budget (optional)
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <Wallet size={16} className="text-amazon-orange" />
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm text-gray-900">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="No limit"
                      className="w-28 text-sm outline-none"
                    />
                    <button
                      onClick={() => {
                        setShowBudget(false);
                        setBudget('');
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label="Clear budget"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <SuggestedPrompts prompts={SUGGESTED_PROMPTS} onSelect={handleSelectPrompt} />
              <EmergencyButtons onSelect={handleSelectPrompt} />
            </>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircleQuestion size={20} className="text-amazon-orange" />
                <h2 className="text-xl font-bold text-gray-900">Quick questions</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Help us build the most accurate bundle for:{' '}
                <span className="font-medium text-gray-900">"{pendingQuery}"</span>
              </p>

              <div className="space-y-5">
                {questions.map((question) => (
                  <div key={question.id}>
                    <p className="font-medium text-gray-900 mb-2">{question.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswer(question.id, option)}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            answers[question.id] === option
                              ? 'bg-amazon-orange text-amazon-dark border-amazon-orange'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-amazon-orange hover:bg-amazon-orange/10'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSubmitAnswers}
                  disabled={!allAnswered || loading}
                  className="flex-1 py-3 bg-amazon-dark text-white rounded-xl font-bold hover:bg-amazon-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generating bundle...' : 'Generate my bundle'}
                </button>
                <button
                  onClick={() => {
                    setQuestions(null);
                    setAnswers({});
                  }}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Voice examples */}
          {!questions && (
            <div className="mt-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mic size={16} className="text-amazon-orange" />
                Try saying:
              </p>
              <div className="flex flex-wrap gap-2">
                {VOICE_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    className="px-4 py-2 bg-gray-50 hover:bg-amazon-orange/10 border border-gray-200 hover:border-amazon-orange rounded-full text-sm text-gray-700 transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </main>

      <AmazonFooter />
    </div>
  );
}
