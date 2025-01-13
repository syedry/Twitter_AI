import { useNavigate } from 'react-router-dom';
import { ArrowLeft} from 'lucide-react';

export default function CreateToken() {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold text-gray-100">Add / Create Token</h1>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-300 mb-6">
            Add an existing token address or create a new pump / presale token
          </p>

          <button
            className="inline-flex items-center px-6 py-3 bg-[#aa1bce] text-white font-medium rounded-md hover:bg-[#aa1bbc] transition-colors disabled:opacity-50"
          >
            Add Existing CA
          </button>
          <div className="text-center py-8">
            <button
              className="inline-flex items-center px-6 py-3 bg-[#48974c] text-white font-medium rounded-md hover:bg-[#48972a] transition-colors disabled:opacity-50"
            >
              Create New Coin on Pump
            </button>
          </div>
          
          <button
            className="inline-flex items-center px-6 py-3 bg-[#1DA1F2] text-white font-medium rounded-md hover:bg-[#1a8cd8] transition-colors disabled:opacity-50"
          >
            Create New Presale on HYPE3
          </button>
        </div>
      </div>
    </div>
  );
} 