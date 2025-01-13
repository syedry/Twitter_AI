import { Link } from 'react-router-dom';
import { Play, Pause, Edit, Trash2, User } from 'lucide-react';
import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onDelete: () => void;
}

export default function AgentCard({ agent, onDelete }: AgentCardProps) {
  return (
    <div className="bg-dark-50 rounded-lg shadow-xl p-6 transition-all hover:bg-dark-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-200 flex items-center justify-center">
            {agent.profilePicture ? (
              <img
                src={agent.profilePicture}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-100">{agent.name}</h3>
            <p className="text-sm text-gray-400">@{agent.twitterHandle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-full transition-colors ${
              agent.isActive
                ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                : 'bg-dark-200 text-gray-400 hover:bg-dark-300'
            }`}
          >
            {agent.isActive ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <Link
            to={`/edit/${agent.id}`}
            className="p-2 rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={onDelete}
            className="p-2 rounded-full bg-red-900/10 text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-300">{agent.personality}</p>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
        <span>{agent.tweetsPerDay} tweets per day</span>
        <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}