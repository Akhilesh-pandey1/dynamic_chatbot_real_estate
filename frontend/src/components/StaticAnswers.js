import React, { useState, useEffect, useRef } from 'react';
import { Select, Button, List, message, Input } from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, SearchOutlined } from '@ant-design/icons';
import API from '../utils/API';

const { TextArea } = Input;

// Component for handling search input functionality for filtering users
const UserSearchInput = ({ searchText, onSearchChange }) => (
  <div className="relative">
    <Input
      placeholder="Search users..."
      value={searchText}
      onChange={onSearchChange}
      className="h-10 pl-10 pr-4 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
      style={{ 
        boxShadow: 'none',
        fontSize: '0.95rem'
      }}
    />
    <SearchOutlined 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      style={{ fontSize: '16px' }}
    />
  </div>
);

// Component for displaying user avatar with first letter of their name
const UserAvatar = ({ name, size = 'w-9 h-9' }) => (
  <div className={`${size} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium shadow-sm group-hover:bg-blue-200 transition-colors duration-200`}>
    {name.charAt(0).toUpperCase()}
  </div>
);

// Component for rendering individual user item in the dropdown
const UserListItem = ({ user, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-all duration-200 group"
  >
    <UserAvatar name={user.name} />
    <div className="ml-3 flex flex-col items-start">
      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {user.name}
      </span>
      <span className="text-xs text-gray-500">User</span>
    </div>
    {isSelected && (
      <div className="ml-auto">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    )}
  </button>
);

// Component for managing the user selection dropdown with search functionality
const UserDropdown = ({ users, selectedUser, onUserSelect, searchText, onSearchChange, isOpen, onClose }) => (
  <div className="absolute left-0 mt-1 w-[300px] bg-white border border-gray-100 rounded-xl shadow-lg z-50 top-full overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
      <UserSearchInput searchText={searchText} onSearchChange={onSearchChange} />
    </div>
    <div className="py-2">
      <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
        {users.length > 0 ? (
          users.map(user => (
            <UserListItem
              key={user.name}
              user={user}
              isSelected={selectedUser?.name === user.name}
              onClick={() => {
                onUserSelect(user);
                onClose();
              }}
            />
          ))
        ) : (
          <EmptySearchState searchText={searchText} />
        )}
      </div>
    </div>
  </div>
);

// Component for displaying empty state when no users match search criteria
const EmptySearchState = ({ searchText }) => (
  <div className="px-4 py-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <SearchOutlined style={{ fontSize: '24px' }} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-500">No users found matching "{searchText}"</p>
  </div>
);

// Component for displaying the list of questions and answers in a chat-like interface
const QuestionAnswerList = ({ questions, loading }) => (
  <List
    dataSource={questions}
    renderItem={(item) => (
      <>
        <List.Item className="flex justify-end border-0 p-0 mb-3">
          <div className="flex items-start max-w-[75%]">
            <div className="p-3 rounded-2xl bg-[#4318FF] text-white rounded-br-none">
              {item.question}
            </div>
          </div>
        </List.Item>
        <List.Item className="flex justify-start border-0 p-0 mb-3">
          <div className="flex items-start max-w-[75%]">
            <div className="p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm">
              {item.answer}
            </div>
          </div>
        </List.Item>
      </>
    )}
  />
);

// Main component that manages the static Q&A interface for selected users
function StaticAnswers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [questionsStarted, setQuestionsStarted] = useState(false);
  const [organizations, setOrganizations] = useState(['manufacturing']);
  const [selectedOrg, setSelectedOrg] = useState('manufacturing');
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize by fetching organizations and users
  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchUserNames();
    }
  }, [selectedOrg]);

  // Fetch organizations from API
  const fetchOrganizations = async () => {
    try {
      const orgs = await API.getOrganizations();
      if (Array.isArray(orgs) && orgs.length > 0) {
        setOrganizations(orgs);
        if (!selectedOrg) {
          setSelectedOrg(orgs[0]);
        }
      }
    } catch (error) {
      setOrganizations(['manufacturing']);
      setSelectedOrg('manufacturing');
    }
  };

  const fetchUserNames = async () => {
    try {
      const names = await API.getUserNames(selectedOrg);
      const usersList = names.map(name => ({ name }));
      setUsers(usersList);
      if (usersList.length > 0) {
        setSelectedUser(usersList[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  // Handle organization change
  const handleOrgChange = (e) => {
    setSelectedOrg(e.target.value);
    setSelectedUser(null);
    setQuestions([]);
    setQuestionsStarted(false);
  };

  // Render organization dropdown
  const renderOrgDropdown = () => (
    <div className="relative">
      <select
        value={selectedOrg}
        onChange={handleOrgChange}
        className="h-10 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {organizations.map(org => (
          <option key={org} value={org}>
            {org.charAt(0).toUpperCase() + org.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );

  // Update filtered users whenever search text changes
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  // Scroll to bottom when new questions are loaded
  useEffect(() => {
    scrollToBottom();
  }, [questions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setQuestions([]);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const data = await API.getStaticQuestions(selectedUser.name);
      const formattedData = data.map((item, index) => ({
        key: index,
        question: item[0],
        answer: item[1]
      }));
      setQuestions(formattedData);
      setQuestionsStarted(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error('Failed to fetch questions');
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center flex-1">
          <h1 className="text-lg font-semibold text-gray-800">Personalized AI Chatbot</h1>
        </div>
        
        {!questionsStarted ? (
          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            {renderOrgDropdown()}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-[260px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
            >
              {selectedUser ? (
                <div className="flex items-center">
                  <UserAvatar name={selectedUser.name} size="w-6 h-6" />
                  <span className="ml-2 text-gray-700">{selectedUser.name}</span>
                </div>
              ) : (
                <span className="text-gray-400">Select a user</span>
              )}
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                  isDropdownOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Button 
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!selectedUser}
              className={`
                flex items-center justify-center px-6 py-2 text-sm font-medium
                rounded-lg shadow-md transition-all duration-200
                ${!selectedUser 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4318FF] to-[#5623FF] hover:from-[#3A16E0] hover:to-[#4C1FE0] text-white hover:shadow-lg transform hover:-translate-y-0.5'
                }
              `}
              style={{
                height: '40px',
                border: 'none',
                minWidth: '100px'
              }}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Submit</span>
                  <svg 
                    className="ml-2 -mr-1 w-4 h-4 transition-transform duration-200 transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </Button>

            {isDropdownOpen && (
              <UserDropdown
                users={filteredUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                isOpen={isDropdownOpen}
                onClose={() => {
                  setIsDropdownOpen(false);
                  setSearchText('');
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <UserAvatar name={selectedUser.name} size="w-8 h-8" />
            <span className="ml-3 font-medium text-gray-700">{selectedUser.name}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          {selectedUser ? (
            questions.length > 0 ? (
              <QuestionAnswerList questions={questions} loading={loading} />
            ) : (
              <div className="text-center text-gray-500 mt-8">
                {loading ? 'Loading questions...' : 'Click submit to view questions'}
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a user to view questions
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Non-functional Input Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-[95%] mx-auto py-3">
          <div className="flex items-center gap-3">
            <TextArea
              placeholder="Type your message here..."
              disabled
              className="flex-grow rounded-xl border-gray-200 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] resize-none bg-[#F4F7FE]"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ 
                boxShadow: 'none',
                padding: '12px 16px',
                fontSize: '15px',
              }}
            />
            <Button
              type="primary"
              disabled
              icon={<SendOutlined style={{ fontSize: '18px' }} />}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4318FF] hover:bg-[#3A16D9] border-0 shadow-sm flex-shrink-0"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default StaticAnswers; 