import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Gift,
  PartyPopper,
  Plane,
  Cake,
  Sparkles,
  Zap,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import AmazonHeader from '../components/AmazonHeader';
import AmazonFooter from '../components/AmazonFooter';
import { generateCart, getCalendarEvents } from '../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  type: string;
  suggestedQuery: string;
  context?: Record<string, string>;
}

const eventIcons: Record<string, React.ReactNode> = {
  birthday: <Cake size={20} className="text-pink-500" />,
  party: <PartyPopper size={20} className="text-purple-500" />,
  trip: <Plane size={20} className="text-blue-500" />,
  festival: <Sparkles size={20} className="text-amazon-orange" />,
  other: <Calendar size={20} className="text-gray-500" />,
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnected(true);
    setLoadingEvents(true);
    try {
      const data = await getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleGenerateCart = async (event: CalendarEvent) => {
    setLoadingEvent(event.id);
    try {
      const cart = await generateCart(event.suggestedQuery, undefined, event.context);
      navigate('/cart', { state: { cart, query: event.suggestedQuery } });
    } catch (err) {
      console.error(err);
      alert('Could not generate cart for this event. Try Flash Mode manually.');
    } finally {
      setLoadingEvent(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AmazonHeader />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={28} className="text-amazon-orange" />
                Flash Mode Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Automatically prepare carts for your upcoming events.
              </p>
            </div>
            <button
              onClick={handleConnect}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                connected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amazon-dark text-white hover:bg-amazon-light'
              }`}
            >
              {connected ? <LinkIcon size={18} /> : <Unlink size={18} />}
              {connected ? 'Calendar Connected' : 'Connect Calendar'}
            </button>
          </div>

          {!connected ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="w-16 h-16 bg-amazon-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-amazon-orange" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connect your calendar</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Flash Mode can scan your calendar and suggest ready-to-buy carts for birthdays, trips, parties, and festivals.
              </p>
              <button
                onClick={handleConnect}
                className="px-8 py-3 bg-amazon-orange text-amazon-dark rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Connect Calendar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3">
                <Zap size={20} className="text-amazon-blue" />
                <p className="text-sm text-blue-800">
                  Upcoming events detected. Tap <strong>Generate Cart</strong> to create a ready-to-buy bundle instantly.
                </p>
              </div>

              {loadingEvents ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white h-28 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {eventIcons[event.type]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1 text-amazon-blue font-medium">
                              <Clock size={14} />
                              {event.daysLeft === 0
                                ? 'Today'
                                : `${event.daysLeft} day${event.daysLeft > 1 ? 's' : ''} left`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Suggested: <span className="font-medium">{event.suggestedQuery}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerateCart(event)}
                        disabled={loadingEvent === event.id}
                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amazon-orange text-amazon-dark rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-70 transition-colors"
                      >
                        {loadingEvent === event.id ? (
                          <>
                            <span className="w-4 h-4 border-2 border-amazon-dark/30 border-t-amazon-dark rounded-full animate-spin"></span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Gift size={16} />
                            Generate Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <AmazonFooter />
    </div>
  );
}
