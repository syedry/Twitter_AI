import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import AgentCard from '../components/AgentCard';
import type { Agent } from '../types';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showLimitError, setShowLimitError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001';
      const response = await fetch(originLink + '/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to load agents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateClick = (e: React.MouseEvent) => {
    if (agents.length > 0) {
      e.preventDefault();
      setShowLimitError(true);
      setTimeout(() => setShowLimitError(false), 3000);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        const originLink = import.meta.env.VITE_ORIGIN || 'http://localhost:3001'
        const response = await fetch(originLink + `/api/agents/${agentId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete agent');
        
        // Refresh the agents list
        await fetchAgents();
      } catch (err) {
        console.error('Error deleting agent:', err);
        alert('Failed to delete agent. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md">
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Your AI Agent</h1>
          <p className="text-gray-400 mt-1">Manage and monitor your AI Twitter agent</p>
        </div>
        <Link
          to={agents.length > 0 ? '#' : '/create'}
          onClick={handleCreateClick}
          className={`inline-flex items-center px-4 py-2 bg-brand-blue text-dark font-medium rounded-md transition-colors ${
            agents.length > 0 ? 'opacity-75 hover:opacity-100' : 'hover:bg-brand-blue/90'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Agent
        </Link>
      </div>

      {showLimitError && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-md">
          <div className="flex items-center text-yellow-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>You can only have one active agent at a time. Please delete your existing agent to create a new one.</p>
          </div>
        </div>
      )}

      {agents.length > 0 ? (
        <div className="space-y-6">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onDelete={() => handleDeleteAgent(agent.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-100 mb-2">No Agent Created Yet</h3>
          <p className="text-gray-400 mb-4">Create your first AI Twitter agent to get started</p>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 bg-brand-blue text-dark font-medium rounded-md hover:bg-brand-blue/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Agent
          </Link>
        </div>
      )}
    </div>
  );
}