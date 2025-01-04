import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import API from '../utils/API';

function CreateUser({ onBack }) {
  // State for form data including user details and organization
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    text: '',
    organization: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  // Fetches available organizations and sets the first one as default
  const fetchOrganizations = async () => {
    try {
      const orgs = await API.getOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        setFormData(prev => ({ ...prev, organization: orgs[0] }));
      }
    } catch (error) {
      message.error('Failed to fetch organizations');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handles form submission and user creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organization) {
      message.error('Please select an organization');
      return;
    }
    setLoading(true);
    try {
      const response = await API.createUser(formData);
      console.log('User created:', response);
      message.success('User created successfully');
      onBack();
    } catch (error) {
      console.error('Error creating user:', error);
      message.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Handles changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggles password visibility in password field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Renders the back button component
  const renderBackButton = () => (
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
  );

  // Renders the username input field
  const renderUsernameField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Username
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        disabled={loading}
        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 disabled:opacity-50"
        placeholder="Enter username"
      />
    </div>
  );

  // Renders the password input field with visibility toggle
  const renderPasswordField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 disabled:opacity-50"
          placeholder="Enter password"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
    </div>
  );

  // Renders the organization selection dropdown
  const renderOrganizationField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Organization
      </label>
      <select
        name="organization"
        value={formData.organization}
        onChange={handleChange}
        required
        disabled={loading}
        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 disabled:opacity-50"
      >
        {organizations.map(org => (
          <option key={org} value={org}>
            {org.charAt(0).toUpperCase() + org.slice(1).replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );

  // Renders the training text input area
  const renderTrainingTextField = () => (
    <div className="flex-1">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Training Text
        </label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          required
          disabled={loading}
          className="block w-full h-[220px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 resize-none disabled:opacity-50"
          placeholder="Enter text for chatbot training"
        />
      </div>
    </div>
  );

  // Renders the submit button with loading state
  const renderSubmitButton = () => (
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
            <span>Creating...</span>
          </>
        ) : (
          <>
            <PlusOutlined className="text-lg" />
            <span>Create User</span>
          </>
        )}
      </button>
    </div>
  );

  // Renders the form fields container
  const renderFormFields = () => (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        {renderUsernameField()}
        {renderPasswordField()}
        {renderOrganizationField()}
      </div>
      {renderTrainingTextField()}
    </div>
  );

  // Main render function
  return (
    <div className="min-h-full bg-gray-50 p-6">
      {renderBackButton()}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New User</h1>
        <form onSubmit={handleSubmit}>
          {renderFormFields()}
          {renderSubmitButton()}
        </form>
      </div>
    </div>
  );
}

export default CreateUser; 