import React, { useState, useEffect } from 'react';
import { Button, message, Input } from 'antd';
import { EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined, SearchOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import API from '../utils/API';
import CreateUser from './CreateUser';
import ModifyUser from './ModifyUser';
import EmbeddingStats from './EmbeddingStats';

// Header component that displays title and action buttons
const Header = ({ onStatsClick, onSearchChange, onCreateUser, onDeleteAllUsers }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
    <div className="flex items-center space-x-4">
      <Button
        icon={<BarChartOutlined />}
        onClick={onStatsClick}
        className="flex items-center h-10 px-4 bg-green-50 text-green-600 hover:bg-green-100 border-none rounded-md shadow-sm transition-all duration-150"
      >
        <span className="ml-2 font-medium">Usage Stats</span>
      </Button>
      <Button
        icon={<DeleteOutlined />}
        onClick={onDeleteAllUsers}
        className="flex items-center h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-md shadow-sm transition-all duration-150"
      >
        <span className="ml-2 font-medium">Delete All Users</span>
      </Button>
      <SearchBox onSearchChange={onSearchChange} />
      <CreateUserButton onClick={onCreateUser} />
    </div>
  </div>
);

// Search input component with icon
const SearchBox = ({ onSearchChange }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Search users..."
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-64 h-10 pl-10 pr-4 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-150"
    />
    <SearchOutlined className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
  </div>
);

// Create user button component
const CreateUserButton = ({ onClick }) => (
  <Button
    type="primary"
    icon={<PlusOutlined className="text-lg" />}
    className="flex items-center h-10 px-4 bg-blue-600 hover:bg-blue-700 border-none rounded-md shadow-sm transition-all duration-150"
    onClick={onClick}
  >
    <span className="ml-2 font-medium">Add user</span>
  </Button>
);

// Table header component with column titles
const TableHeader = () => (
  <div className="grid grid-cols-5 p-5 text-sm font-medium text-gray-600 border-b bg-gray-50">
    <div className="col-span-1">Name</div>
    <div className="col-span-1">Password</div>
    <div className="col-span-1">Created at</div>
    <div className="col-span-1">Modifications</div>
    <div className="col-span-1 text-center">Actions</div>
  </div>
);

// User row component that displays user information
const UserRow = ({ user, onModify, onDelete, formatDate }) => (
  <div className="grid grid-cols-5 p-5 hover:bg-gray-50 border-b items-center transition-colors duration-150">
    <div className="col-span-1 flex items-center space-x-3">
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium shadow-sm">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium text-gray-700">{user.name}</span>
    </div>
    <div className="col-span-1 font-mono text-gray-600">{user.password}</div>
    <div className="col-span-1 text-gray-600">{formatDate(user.created_at)}</div>
    <div className="col-span-1 text-gray-600">{user.modifications || 0}</div>
    <UserActions user={user} onModify={onModify} onDelete={onDelete} />
  </div>
);

// Action buttons component for each user row
const UserActions = ({ user, onModify, onDelete }) => (
  <div className="col-span-1 flex items-center justify-center space-x-3">
    <Button 
      type="text"
      onClick={() => onModify(user)}
      className="flex items-center px-4 py-1.5 bg-blue-50 hover:bg-blue-100 border-none rounded-lg transition-colors duration-150"
    >
      <EditOutlined className="text-blue-600 mr-1.5" />
      <span className="text-blue-600 font-medium">Modify</span>
    </Button>
    <Button 
      type="text"
      onClick={() => onDelete(user.name)}
      className="flex items-center px-4 py-1.5 bg-red-50 hover:bg-red-100 border-none rounded-lg transition-colors duration-150"
    >
      <DeleteOutlined className="text-red-600 mr-1.5" />
      <span className="text-red-600 font-medium">Delete</span>
    </Button>
  </div>
);

// Pagination component for navigating between pages
const Pagination = ({ currentPage, totalPages, totalUsers, onPrevPage, onNextPage }) => (
  <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
    <div className="text-sm text-gray-600 font-medium">
      Total {totalUsers} users
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-600">
        PAGE
        <span className="mx-2 font-medium">{currentPage}</span>
        OF {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          type="text"
          icon={<LeftOutlined />}
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg"
        />
        <Button 
          type="text"
          icon={<RightOutlined />}
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg"
        />
      </div>
    </div>
  </div>
);

// Main UserList component that manages state and composition
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modifyUser, setModifyUser] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleDelete = async (name) => {
    try {
      setLoading(true);
      await API.deleteUser(name);
      message.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    const confirmation = prompt('Type "Deleting all users" to confirm:');
    if (confirmation === 'Deleting all users') {
      try {
        setLoading(true);
        await API.deleteAllUsers();
        message.success('All users deleted successfully');
        await fetchUsers();
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      message.info('Deletion cancelled');
    }
  };

  const indexOfLastUser = currentPage * pageSize;
  const indexOfFirstUser = indexOfLastUser - pageSize;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / pageSize);

  if (showStats) return <EmbeddingStats onBack={() => setShowStats(false)} />;
  if (error) return <div className="w-full p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  if (showCreateForm) return <CreateUser onBack={() => setShowCreateForm(false)} />;
  if (modifyUser) return <ModifyUser user={modifyUser} onBack={() => setModifyUser(null)} />;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <Header
          onStatsClick={() => setShowStats(true)}
          onSearchChange={setSearchText}
          onCreateUser={() => setShowCreateForm(true)}
          onDeleteAllUsers={handleDeleteAllUsers}
        />
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <TableHeader />
            {currentUsers.map((user) => (
              <UserRow
                key={user.name}
                user={user}
                onModify={setModifyUser}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
            {currentUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gray-50">
                No users found
              </div>
            )}
            {users.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalUsers={users.length}
                onPrevPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList; 