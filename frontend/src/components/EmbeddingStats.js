import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import API from '../utils/API';

function EmbeddingStats({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await API.getEmbeddingStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftOutlined className="mr-2" />
          <span>Back to list</span>
        </button>
      </div>

      {/* Stats Container */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">System Statistics</h1>
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-8">
            {/* Total Size Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="text-center">
                <div className="text-green-600 text-sm font-medium mb-2">Total Size</div>
                <div className="text-4xl font-bold text-green-700">
                  {stats.total_size_mb.toFixed(2)}
                  <span className="text-xl ml-1 font-medium">MB</span>
                </div>
              </div>
            </div>

            {/* Total Users Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm border border-blue-100">
              <div className="text-center">
                <div className="text-blue-600 text-sm font-medium mb-2">Total Users</div>
                <div className="text-4xl font-bold text-blue-700">
                  {stats.total_embeddings}
                  <span className="text-xl ml-1 font-medium">users</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No statistics available
          </div>
        )}

        {/* Last Updated */}
        {stats && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmbeddingStats; 