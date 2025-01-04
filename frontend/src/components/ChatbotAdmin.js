import React, { useState, useRef, useEffect } from 'react';
import { Select, Input, Button, List, message } from 'antd';
import { UserOutlined, SendOutlined, RobotOutlined, SearchOutlined } from '@ant-design/icons';
import API from '../utils/API';

// Main ChatbotAdmin component
function ChatbotAdmin() {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState(['manufacturing']);
  const [selectedOrg, setSelectedOrg] = useState('manufacturing');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Effect hooks
  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchUserNames();
    }
  }, [selectedOrg]);

  useEffect(() => {
    filterUsers();
  }, [searchText, users]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setupClickOutsideListener();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users]);

  // Handles click outside of dropdown to close it
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  // Sets up click outside listener for dropdown
  const setupClickOutsideListener = () => {
    document.addEventListener('mousedown', handleClickOutside);
  };

  // Fetches list of organizations from API
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
      // Silent error handling
      setOrganizations(['manufacturing']);
      setSelectedOrg('manufacturing');
    }
  };

  // Fetches users for selected organization
  const fetchUserNames = async () => {
    try {
      const names = await API.getUserNames(selectedOrg);
      const usersList = names.map(name => ({ name }));
      setUsers(usersList);
      
      if (usersList.length > 0 && !selectedUser) {
        setSelectedUser(usersList[0]);
        setMessages([]);
      }
    } catch (error) {
      // Silent error handling
      setUsers([]);
    }
  };

  // Filters users based on search text
  const filterUsers = () => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Scrolls chat to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handles user selection from dropdown
  const handleUserSelect = (value) => {
    const user = users.find(u => u.name === value);
    setSelectedUser(user);
    setMessages([]);
  };

  // Formats chat history for API request
  const formatChatHistory = (messages, newMessage) => {
    const formattedHistory = [];
    const currentMessages = [...messages, newMessage];
    
    for (let i = 0; i < currentMessages.length - 1; i += 2) {
      const userMsg = currentMessages[i];
      const aiMsg = currentMessages[i + 1];
      if (userMsg && aiMsg) {
        formattedHistory.push([userMsg.text, aiMsg.text]);
      }
    }
    
    formattedHistory.push([newMessage.text, null]);
    return formattedHistory;
  };

  // Handles sending a new message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;

    if (!chatStarted) {
      setChatStarted(true);
    }

    const userMessage = {
      text: inputMessage.trim(),
      sender: 'admin',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formattedHistory = formatChatHistory(messages, userMessage);
      const response = await API.chatWithUser(selectedUser.name, formattedHistory, selectedOrg);

      const aiMessage = {
        text: response.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Add a generic error message in chat instead of showing error popup
      const errorMessage = {
        text: "I'm unable to respond at the moment. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles organization change
  const handleOrgChange = (e) => {
    setSelectedOrg(e.target.value);
    setSelectedUser(null);
    setMessages([]);
  };

  // Renders the organization dropdown
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

  // Renders the user search input
  const renderUserSearch = () => (
    <div className="relative">
      <Input
        placeholder="Search users..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
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

  // Renders a single user in the dropdown
  const renderUserItem = (user) => (
    <button
      key={user.name}
      onClick={() => {
        handleUserSelect(user.name);
        setIsDropdownOpen(false);
        setSearchText('');
      }}
      className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-all duration-200 group"
    >
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium shadow-sm group-hover:bg-blue-200 transition-colors duration-200">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3 flex flex-col items-start">
        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {user.name}
        </span>
        <span className="text-xs text-gray-500">User</span>
      </div>
      {selectedUser?.name === user.name && (
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

  // Renders the user dropdown
  const renderUserDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-[260px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
      >
        {selectedUser ? (
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-gray-700">{selectedUser.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select a user to chat</span>
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

      {isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-[300px] bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            {renderUserSearch()}
          </div>
          <div className="py-2">
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(renderUserItem)
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <SearchOutlined style={{ fontSize: '24px' }} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No users found matching "{searchText}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renders the chat header
  const renderHeader = () => (
    <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center flex-1">
        <h1 className="text-lg font-semibold text-gray-800">Personalized AI Chatbot</h1>
      </div>
      
      {!chatStarted ? (
        <div className="flex items-center space-x-4">
          {renderOrgDropdown()}
          {renderUserDropdown()}
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <span className="ml-3 font-medium text-gray-700">{selectedUser.name}</span>
        </div>
      )}
    </div>
  );

  // Renders a single chat message
  const renderMessage = (message) => (
    <List.Item className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'} border-0 p-0 mb-3`}>
      <div className={`flex items-start max-w-[75%]`}>
        <div 
          className={`p-3 rounded-2xl ${
            message.sender === 'bot' 
              ? 'bg-white text-gray-800 rounded-bl-none shadow-sm' 
              : 'bg-[#4318FF] text-white rounded-br-none'
          }`}
        >
          {message.text}
        </div>
      </div>
    </List.Item>
  );

  // Renders the chat area
  const renderChatArea = () => (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-auto bg-gray-50"
    >
      <div className="p-4">
        {selectedUser ? (
          <List
            dataSource={messages}
            renderItem={renderMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  // Renders the message input area
  const renderInputArea = () => (
    <div className="bg-white border-t border-gray-100">
      <div className="max-w-[95%] mx-auto py-3">
        <div className="flex items-center gap-3">
          <Input.TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message here..."
            disabled={!selectedUser || isLoading}
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
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={!selectedUser}
            icon={<SendOutlined style={{ fontSize: '18px' }} />}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4318FF] hover:bg-[#3A16D9] border-0 shadow-sm flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {renderHeader()}
      {renderChatArea()}
      {renderInputArea()}
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

export default ChatbotAdmin; 