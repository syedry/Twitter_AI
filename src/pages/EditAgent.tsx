import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Agent } from '../types';

export default function EditAgent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    twitterHandle: '',
    personality: '',
    tweetPriorities: '',
    languageStyle: '',
    tweetsPerDay: 5
  });

  // Fetch agent data when component mounts
  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      const response = await fetch(originLink + `/api/agents/${id}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      
      const agent: Agent = await response.json();
      console.log('Fetched agent:', agent); // Debug log
      
      setFormData({
        name: agent.name || '',
        twitterHandle: agent.twitterHandle || '',
        personality: agent.personality || '',
        tweetPriorities: agent.tweetPriorities || '',
        languageStyle: agent.languageStyle || '',
        tweetsPerDay: agent.tweetsPerDay || 5
      });
    } catch (err) {
      console.error('Error fetching agent:', err);
      setError('Failed to load agent data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      const response = await fetch(originLink + `/api/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update agent');
      navigate('/');
    } catch (err) {
      console.error('Error updating agent:', err);
      setError('Failed to update agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      const response = await fetch(originLink + '/api/agents/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitterHandle: formData.twitterHandle,
          personality: formData.personality,
          tweetPriorities: formData.tweetPriorities.split(',').map(p => p.trim()),
          languageStyle: formData.languageStyle
        }),
      });

      if (!response.ok) throw new Error('Failed to simulate tweets');
      const data = await response.json();
      console.log('Simulated tweets:', data.tweets);
      // You can add state to show the simulated tweets in the UI
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to simulate tweets');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading...</div>
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

      <div className="bg-dark-50 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Edit Agent</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-md">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-200 rounded-md text-gray-100 placeholder-gray-500"
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-300 mb-2">
              Twitter Handle
            </label>
            <input
              type="text"
              id="twitterHandle"
              value={formData.twitterHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-200 rounded-md text-gray-100 placeholder-gray-500"
              placeholder="@username"
            />
          </div>

          <div>
            <label htmlFor="personality" className="block text-sm font-medium text-gray-300 mb-2">
              Personality
            </label>
            <textarea
              id="personality"
              value={formData.personality}
              onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-200 rounded-md text-gray-100 placeholder-gray-500"
              placeholder="Describe the agent's personality"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="tweetPriorities" className="block text-sm font-medium text-gray-300 mb-2">
              Tweet Priorities
            </label>
            <input
              type="text"
              id="tweetPriorities"
              value={formData.tweetPriorities}
              onChange={(e) => setFormData(prev => ({ ...prev, tweetPriorities: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-200 rounded-md text-gray-100 placeholder-gray-500"
              placeholder="Enter priorities separated by commas"
            />
          </div>

          <div>
            <label htmlFor="languageStyle" className="block text-sm font-medium text-gray-300 mb-2">
              Language Style
            </label>
            <input
              type="text"
              id="languageStyle"
              value={formData.languageStyle}
              onChange={(e) => setFormData(prev => ({ ...prev, languageStyle: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-200 rounded-md text-gray-100 placeholder-gray-500"
              placeholder="Describe the language style"
            />
          </div>

          <div className="pt-4 flex space-x-4">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isLoading}
              className="px-4 py-2 bg-brand-blue text-dark font-medium rounded-md hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Simulate Tweets'}
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 