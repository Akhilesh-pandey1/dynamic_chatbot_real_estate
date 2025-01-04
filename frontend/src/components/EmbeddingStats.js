import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import API from '../utils/API';

const StatCard = ({ title, size, users, colorClass }) => (
  <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 shadow-sm border border-opacity-50`}>
    <div className="text-center">
      <div className="text-sm font-medium mb-4 opacity-90">{title}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold">
            {size.toFixed(2)}
            <span className="text-sm ml-1 font-medium">MB</span>
          </div>
          <div className="text-xs mt-1 opacity-75">Total Size</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {users}
            <span className="text-sm ml-1 font-medium">users</span>
          </div>
          <div className="text-xs mt-1 opacity-75">Total Users</div>
        </div>
      </div>
    </div>
  </div>
);

const colorClasses = {
  manufacturing: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
  finance: 'from-green-50 to-green-100 border-green-200 text-green-700',
  real_estate: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
  general: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
  total: 'from-gray-100 to-gray-200 border-gray-300 text-gray-700'
};

function EmbeddingStats({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTitle = (key) => {
    if (key === 'total') return 'Overall Total';
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftOutlined className="mr-2" />
          <span>Back to list</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">System Statistics</h1>
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(stats)
              .filter(([key]) => key !== 'total')
              .map(([key, data]) => (
                <StatCard
                  key={key}
                  title={formatTitle(key)}
                  size={data.total_size_mb}
                  users={data.total_embeddings}
                  colorClass={colorClasses[key]}
                />
              ))}
            <div className="md:col-span-2 lg:col-span-3">
              <StatCard
                title={formatTitle('total')}
                size={stats.total.total_size_mb}
                users={stats.total.total_embeddings}
                colorClass={colorClasses.total}
              />
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No statistics available
          </div>
        )}

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