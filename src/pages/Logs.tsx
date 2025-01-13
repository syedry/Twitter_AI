import { useState, useEffect } from 'react';
import { Twitter, Clock, ThumbsUp, Repeat2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface TweetLog {
  id: string;
  content: string;
  createdAt: string;
  status: 'success' | 'failed';
  error?: string;
  twitterUsername: string;
  agentName: string;
  likes?: number;
  retweets?: number;
  replies?: number;
}

export default function Logs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<TweetLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      const response = await fetch(originLink + '/api/agents/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load tweet logs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tweet Logs</h1>
          <p className="text-gray-400 mt-1">History of tweets posted by your AI agents</p>
        </div>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-dark-50 rounded-lg p-8">
            <div className="text-center">
              <Twitter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Tweets Posted Yet</h3>
              <p className="text-gray-400 mb-6">
                Your AI agents haven't posted any tweets yet. Once they start posting, you'll see their tweet history here.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 bg-brand-blue text-dark rounded-md hover:bg-brand-blue-dark transition-colors"
              >
                Create an Agent
              </button>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`bg-dark-50 rounded-lg p-6 ${
                log.status === 'failed' ? 'border border-red-900/50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Twitter className="w-5 h-5 text-[#1DA1F2] mr-2" />
                  <div>
                    <p className="text-gray-300 font-medium">{log.agentName}</p>
                    <p className="text-sm text-gray-400">@{log.twitterUsername}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <time className="text-sm">
                    {formatDistanceToNow(new Date(log.createdAt))} ago
                  </time>
                </div>
              </div>

              <p className="text-gray-100 mb-4">{log.content}</p>

              {log.status === 'failed' ? (
                <div className="text-red-400 text-sm mt-2">
                  Error: {log.error}
                </div>
              ) : (
                <div className="flex items-center space-x-6 text-gray-400">
                  <div className="flex items-center">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">{log.likes || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Repeat2 className="w-4 h-4 mr-1" />
                    <span className="text-sm">{log.retweets || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{log.replies || 0}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 