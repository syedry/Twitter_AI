import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TweetPreview from '../components/TweetPreview';

interface FormData {
  name: string;
  twitterHandle: string;
  personality: string;
  languageStyle: string;
}

export default function CreateAgent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{ status: string; percent: number } | null>(null);
  const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    twitterHandle: '',
    personality: '',
    languageStyle: ''
  });

  const handleSimulate = async () => {
    setIsLoading(true);
    setProgress({ status: 'Starting...', percent: 0 });
    setGeneratedTweets([]);
    
    try {
      const params = new URLSearchParams({
        twitterHandle: formData.twitterHandle,
        personality: formData.personality,
        languageStyle: formData.languageStyle,
        name: formData.name
      });
      
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
      const eventSource = new EventSource(originLink + `/api/agents/simulate?${params}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.status === 'complete') {
          setGeneratedTweets(data.tweets);
          setProgress({ status: 'Complete!', percent: 100 });
          eventSource.close();
          setIsLoading(false);
        } else if (data.status === 'error') {
          throw new Error(data.error);
        } else {
          setProgress({ status: data.message, percent: data.progress });
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
        setProgress(null);
      };
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'

    try {
      const url = id 
        ? originLink + `/api/agents/${id}`
        : originLink + '/api/agents';
      
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          generatedTweets
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save agent');
      }

      const agent = await response.json();
      console.log('Created agent:', agent);
      navigate('/schedule', { 
        state: { agentId: agent.id },
        replace: true 
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex gap-8">
        {/* Left Panel - Form */}
        <div className="w-1/2">
          <form onSubmit={handleSubmit}>
            <div className="bg-gray-800 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-white mb-6">
                {id ? 'Edit AI Agent' : 'Create New AI Agent'}
              </h1>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Based on Twitter Handle</label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Personality Description</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Language Style</label>
                  <select
                    value={formData.languageStyle}
                    onChange={(e) => setFormData({ ...formData, languageStyle: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select style...</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humorous</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>

              {progress && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{progress.status}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Simulate Tweets'}
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || generatedTweets.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {id ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Panel - Tweet Previews */}
        <div className="w-1/2">
          {generatedTweets.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Sample Tweets</h2>
              <div className="space-y-4">
                {generatedTweets.map((tweet, index) => (
                  <TweetPreview
                    key={index}
                    content={tweet}
                    agent={{
                      name: formData.name || 'AI Agent',
                      avatar: `https://unavatar.io/twitter/${formData.twitterHandle}`,
                      twitterHandle: formData.twitterHandle
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}