import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Settings, ClipboardList } from 'lucide-react';
import logo from '/logo.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-dark-50 border-b border-dark-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img src={logo} alt="TweetForge AI" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-brand-blue text-dark font-medium' 
                    : 'text-gray-400 hover:bg-dark-100'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="ml-2">Dashboard</span>
              </Link>
              <Link
                to="/logs"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/logs')
                    ? 'bg-brand-blue text-dark font-medium'
                    : 'text-gray-400 hover:bg-dark-100'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="ml-2">Logs</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/settings')
                    ? 'bg-brand-blue text-dark font-medium'
                    : 'text-gray-400 hover:bg-dark-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="ml-2">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}