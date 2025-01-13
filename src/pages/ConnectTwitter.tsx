import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Twitter, Check, X } from 'lucide-react';

interface LocationState {
  agentId: string;
}

enum ConnectionStatus {
  NOT_STARTED = 'NOT_STARTED',
  CONNECTING = 'CONNECTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export default function ConnectTwitter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.NOT_STARTED);
  const [error, setError] = useState<string | null>(null);

  const { agentId } = (location.state as LocationState) || {};

  useEffect(() => {
    // Check if we're returning from Twitter OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const oauthSuccess = urlParams.get('success');

    if (oauthError) {
      setStatus(ConnectionStatus.FAILED);
      setError('Failed to connect Twitter account. Please try again.');
    } else if (oauthSuccess) {
      setStatus(ConnectionStatus.SUCCESS);
    }
  }, []);

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

  const handleConnect = async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      setError(null);

      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001';
      const response = await fetch(originLink + `/api/auth/twitter/connect/${agentId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Twitter connection');
      }

      const { authUrl } = await response.json();
      
      // Open Twitter OAuth in a new window
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      window.open(
        authUrl,
        'Twitter OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error('Error:', err);
      setStatus(ConnectionStatus.FAILED);
      setError('Failed to connect Twitter account. Please try again.');
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

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
          <Twitter className="w-6 h-6 text-[#1DA1F2] mr-2" />
          <h1 className="text-2xl font-bold text-gray-100">Connect X Account</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-md">
            <div className="flex items-center text-red-400">
              <X className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {status === ConnectionStatus.SUCCESS ? (
          <div className="text-center py-8">
            <div className="mb-6 p-4 bg-green-900/20 border border-green-900/50 rounded-md">
              <div className="flex items-center justify-center text-green-400">
                <Check className="w-5 h-5 mr-2" />
                <p>Successfully connected X account!</p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-brand-blue text-dark font-medium rounded-md hover:bg-brand-blue-dark transition-colors"
            >
              Complete Agent Setup
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-300 mb-6">
              Connect your X account to allow your AI agent to post tweets on your behalf.
              Your agent will start posting tweets according to the schedule once connected.
            </p>

            <button
              onClick={handleConnect}
              disabled={status === ConnectionStatus.CONNECTING}
              className="inline-flex items-center px-6 py-3 bg-[#1DA1F2] text-white font-medium rounded-md hover:bg-[#1a8cd8] transition-colors disabled:opacity-50"
            >
              <Twitter className="w-5 h-5 mr-2" />
              {status === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Connect X Account'}
            </button>
          </div>
        )}
        <div className="text-center py-8">
          <a className="text-gray-300 mb-6" href='/create-token'>Skip for now</a>
        </div>
      </div>
    </div>
  );
} 