import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import TweetPreview from './TweetPreview';
import TwitterHandleInput from './TwitterHandleInput';
import { useTweetGeneration } from '../hooks/useTweetGeneration';

interface AgentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function AgentForm({ onSubmit, initialData }: AgentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    twitterHandle: initialData?.twitterHandle || '',
    character: initialData?.character || '',
    tweetPriorities: initialData?.tweetPriorities || '',
    language: initialData?.language || '',
  });

  const [error, setError] = useState<string | null>(null);
  
  const {
    isLoading,
    tweets: previewTweets,
    generateSampleTweets
  } = useTweetGeneration({
    onError: (error) => setError(error.message)
  });

  const handleSimulate = async () => {
    setError(null);
    await generateSampleTweets(
      formData.twitterHandle,
      formData.character,
      formData.tweetPriorities,
      formData.language
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const canSimulate = formData.twitterHandle && formData.character && formData.tweetPriorities && formData.language;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-blue-600">Input</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-4">
              1. Enter Twitter handle to learn from:
            </label>
            <TwitterHandleInput
              value={formData.twitterHandle}
              onChange={(value) => setFormData({ ...formData, twitterHandle: value })}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2">
              2. Describe Your AI character:
            </label>
            <textarea
              value={formData.character}
              onChange={(e) => setFormData({ ...formData, character: e.target.value })}
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="A playful and knowledgeable enthusiast who shares tips and tricks..."
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2">
              3. Instruction on tweet priorities:
            </label>
            <textarea
              value={formData.tweetPriorities}
              onChange={(e) => setFormData({ ...formData, tweetPriorities: e.target.value })}
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Always comment on latest news and sometimes tweet philosophical thoughts..."
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2">
              4. Language:
            </label>
            <textarea
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Casual and friendly tone, using emojis and playful language..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSimulate}
            disabled={!canSimulate || isLoading}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${
              canSimulate && !isLoading
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {isLoading ? 'Generating...' : 'Simulate'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-600">Output (Chatbot style)</h2>
          <p className="text-sm text-red-500 mt-1">(Consider 1, 2, 3, 4 together)</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {previewTweets.map((tweet, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Sample tweet #{index + 1}</h3>
              <TweetPreview
                content={tweet.content}
                agent={{
                  name: formData.twitterHandle ? `@${formData.twitterHandle}` : 'AI Agent',
                  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop'
                }}
              />
            </div>
          ))}
          {previewTweets.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
              {canSimulate
                ? "Click 'Simulate' to generate sample tweets based on your inputs"
                : 'Fill in all fields to simulate tweets'}
            </div>
          )}
          {isLoading && (
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
        </div>

        {previewTweets.length > 0 && !isLoading && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Create agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}