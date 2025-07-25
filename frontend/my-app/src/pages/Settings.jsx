import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import API_URL from '../apiConfig';
import UserSettings from '../components/UserSettings';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.fetch(`${API_URL}/settings/get_settings`);
        setSettings(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Settings</h2>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#0065A8] mb-6">Settings</h1>
      
      {/* Notification Settings Section */}
      <section>
        <UserSettings />
      </section>
      
      {/* Server Settings Section (if available) */}
      {settings && (
        <section className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-[#0065A8]">System Settings</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">Configuration</h4>
            <pre className="text-sm text-gray-600 overflow-auto max-h-64">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default Settings;
