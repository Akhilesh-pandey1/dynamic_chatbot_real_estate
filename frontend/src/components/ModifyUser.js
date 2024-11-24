import React, { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { message } from 'antd';
import API from '../utils/API';

function ModifyUser({ user, onBack }) {
  const [formData, setFormData] = useState({
    text: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.modifyUser(user.name, formData.text);
      message.success('Training text updated successfully');
      onBack(); // Return to list view
    } catch (error) {
      console.error('Error modifying user:', error);
      message.error(error.response?.data?.error || 'Failed to update training text');
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
          disabled={loading}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          <ArrowLeftOutlined className="mr-2" />
          <span>Back to list</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Update Training Text</h1>
        
        {/* User Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500">Modifications: {user.modifications || 0}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Training Text
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={(e) => setFormData({ text: e.target.value })}
              required
              disabled={loading}
              className="block w-full h-[200px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 resize-none disabled:opacity-50"
              placeholder="Enter new text for chatbot training"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Training Text</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModifyUser; 