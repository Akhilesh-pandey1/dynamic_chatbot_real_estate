import React, { useState, useRef, useEffect } from 'react';
import { Select, Avatar, Input, Button, List } from 'antd';
import { UserOutlined, SendOutlined, RobotOutlined, FilterOutlined } from '@ant-design/icons';
import API from '../utils/API';

const { TextArea } = Input;
const { Option } = Select;

function ChatbotAdmin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUserNames();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users]);

  const fetchUserNames = async () => {
    try {
      const names = await API.getUserNames();
      const usersList = names.map(name => ({ name }));
      setUsers(usersList);
      
      if (usersList.length > 0 && !selectedUser) {
        setSelectedUser(usersList[0]);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserSelect = (value) => {
    const user = users.find(u => u.name === value);
    setSelectedUser(user);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;

    const userMessage = {
      text: inputMessage,
      sender: 'admin',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formattedHistory = [];
      const currentMessages = [...messages, userMessage];
      
      for (let i = 0; i < currentMessages.length - 1; i += 2) {
        const userMsg = currentMessages[i];
        const aiMsg = currentMessages[i + 1];
        if (userMsg && aiMsg) {
          formattedHistory.push([userMsg.text, aiMsg.text]);
        }
      }
      
      formattedHistory.push([userMessage.text, null]);

      const response = await API.chatWithUser(selectedUser.name, formattedHistory);

      const aiMessage = {
        text: response.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessages = () => {
    return messages.map((message, index) => (
      <div 
        key={index} 
        className={`chat-message ${message.role === 'user' ? 'user-message' : ''}`}
      >
        <div className={`message-avatar ${message.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
          {message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
        </div>
        <div className={`message-content ${message.role === 'user' ? 'user-content' : 'ai-content'}`}>
          {message.content}
        </div>
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Custom Select */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center flex-1">
          <h1 className="text-lg font-semibold text-gray-800">Chatbot Admin</h1>
        </div>
        
        {/* Custom Select Dropdown */}
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

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-[260px] py-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
              <div className="max-h-[240px] overflow-y-auto">
                {users.map(user => (
                  <button
                    key={user.name}
                    onClick={() => {
                      handleUserSelect(user.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 flex items-center hover:bg-gray-50 transition-colors duration-150 ${
                      selectedUser?.name === user.name ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 text-sm text-gray-700">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-auto bg-gray-50"
      >
        <div className="p-4">
          {selectedUser ? (
            <List
              dataSource={messages}
              renderItem={(message) => (
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
              )}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a user to start chatting
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-[95%] mx-auto py-3">
          <div className="flex items-center gap-3">
            <TextArea
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

      {/* Add custom styles */}
      <style jsx>{`
        .custom-select .ant-select-selector {
          height: 36px !important;
          border-radius: 6px !important;
          border-color: #e5e7eb !important;
          background-color: #f9fafb !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 12px !important;
        }

        .custom-select .ant-select-selection-placeholder {
          color: #6b7280 !important;
        }

        .custom-select .ant-select-arrow {
          color: #9ca3af !important;
        }

        .custom-select:hover .ant-select-selector {
          border-color: #d1d5db !important;
          background-color: #f3f4f6 !important;
        }

        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .ant-select-dropdown {
          padding: 4px !important;

        }

        .ant-select-item {
          padding: 8px 12px !important;
          border-radius: 4px !important;
        }

        .ant-select-item-option-selected {
          background-color: #eff6ff !important;
        }

        .ant-select-item-option-active {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}

export default ChatbotAdmin; 