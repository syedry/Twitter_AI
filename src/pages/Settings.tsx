import React, { useState } from 'react';
import { Save, Bell, Key, Globe, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      tweetGenerated: true,
      performanceReport: true,
      errorAlerts: true
    },
    apiKeys: {
      twitter: '********************************',
      openai: '********************************'
    },
    language: 'en',
    timezone: 'UTC',
    deleteConfirmation: false
  });

  const [showKeys, setShowKeys] = useState({
    twitter: false,
    openai: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your TweetForge AI preferences</p>
      </div>

      <div className="space-y-6">
        {/* Notifications Section */}
        <div className="bg-dark-50 rounded-lg shadow-xl p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-brand-blue mr-2" />
            <h2 className="text-lg font-semibold text-gray-100">Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [key]: e.target.checked
                      }
                    })
                  }
                  className="rounded border-dark-300 text-brand-blue focus:ring-brand-blue bg-dark-200"
                />
                <span className="ml-2 text-gray-200">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-dark-50 rounded-lg shadow-xl p-6">
          <div className="flex items-center mb-4">
            <Key className="h-5 w-5 text-brand-blue mr-2" />
            <h2 className="text-lg font-semibold text-gray-100">API Keys</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.apiKeys).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {key.toUpperCase()} API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys[key as keyof typeof showKeys] ? 'text' : 'password'}
                    value={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: {
                          ...settings.apiKeys,
                          [key]: e.target.value
                        }
                      })
                    }
                    className="flex-1 rounded-md bg-dark-200 border-dark-300 text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => 
                      setShowKeys(prev => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof showKeys]
                      }))
                    }
                    className="px-4 py-2 bg-dark-200 text-gray-300 rounded-md hover:bg-dark-300"
                  >
                    {showKeys[key as keyof typeof showKeys] ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Localization Section */}
        <div className="bg-dark-50 rounded-lg shadow-xl p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-brand-blue mr-2" />
            <h2 className="text-lg font-semibold text-gray-100">Localization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full rounded-md bg-dark-200 border-dark-300 text-gray-100"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="w-full rounded-md bg-dark-200 border-dark-300 text-gray-100"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">GMT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-dark-50 rounded-lg shadow-xl p-6 border border-red-900">
          <div className="flex items-center mb-4">
            <Trash2 className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-100">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, deleteConfirmation: true })}
                className="px-4 py-2 bg-red-600/20 text-red-500 rounded-md hover:bg-red-600/30 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 bg-brand-blue text-dark rounded-md hover:bg-brand-blue/90 transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}