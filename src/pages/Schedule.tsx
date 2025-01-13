import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface LocationState {
  agentId: string;
}

// Common timezones list
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get agentId from location state
  const { agentId } = (location.state as LocationState) || {};
  
  console.log('Schedule page state:', location.state); // Add debug logging

  const [tweetsPerDay, setTweetsPerDay] = useState(5);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [postingStartHour, setPostingStartHour] = useState(9);
  const [postingEndHour, setPostingEndHour] = useState(21);
  const [post24Hours, setPost24Hours] = useState(false);

  // Add useEffect to check state on mount
  React.useEffect(() => {
    if (!location.state) {
      console.log('No state received in Schedule page');
    }
  }, [location.state]);

  if (!agentId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-400">
          No agent selected. Please go back and create an agent first.
          <button
            onClick={() => navigate('/create')}
            className="ml-4 px-4 py-2 bg-brand-blue text-dark rounded-md hover:bg-brand-blue-dark"
          >
            Create Agent
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      // Update agent with schedule settings
      const response = await fetch(originLink + `/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetsPerDay,
          timezone,
          postingStartHour,
          postingEndHour,
          post24Hours
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent schedule');
      }

      // Navigate to Twitter connection page
      navigate('/connect-twitter', { 
        state: { agentId },
        replace: true
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save schedule. Please try again.');
      setIsLoading(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-dark-50 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-brand-blue mr-2" />
          <h1 className="text-2xl font-bold text-gray-100">Set Tweet Schedule</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-md">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tweets per day
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={tweetsPerDay}
              onChange={(e) => setTweetsPerDay(Number(e.target.value))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="post24Hours"
              checked={post24Hours}
              onChange={(e) => setPost24Hours(e.target.checked)}
              className="w-4 h-4 text-brand-blue bg-dark-800 border-dark-700 rounded focus:ring-brand-blue"
            />
            <label htmlFor="post24Hours" className="text-sm font-medium text-gray-300">
              Post 24/7 (Ignore time range)
            </label>
          </div>

          {!post24Hours && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start posting at
                </label>
                <select
                  value={postingStartHour}
                  onChange={(e) => setPostingStartHour(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop posting at
                </label>
                <select
                  value={postingEndHour}
                  onChange={(e) => setPostingEndHour(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-dark font-medium rounded-md hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <span>Continue to Twitter Connection</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 