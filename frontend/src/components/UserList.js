import React, { useState, useEffect } from 'react';
import { Button, message, Input } from 'antd';
import { EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined, SearchOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import API from '../utils/API';
import CreateUser from './CreateUser';
import ModifyUser from './ModifyUser';
import EmbeddingStats from './EmbeddingStats';

// Renders organization dropdown with custom styling
const OrganizationDropdown = ({ selectedOrg, organizations, onOrgChange }) => (
  <div className="relative">
    <select
      value={selectedOrg}
      onChange={(e) => onOrgChange(e.target.value)}
      className="h-10 pl-4 pr-10 bg-blue-50 text-blue-600 border-none rounded-md shadow-sm transition-all duration-150 cursor-pointer hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none font-medium"
    >
      {organizations.map(org => (
        <option key={org} value={org}>
          {org.charAt(0).toUpperCase() + org.slice(1).replace(/_/g, ' ')}
        </option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
      <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  </div>
);

// Renders the usage stats button
const StatsButton = ({ onClick }) => (
  <Button
    icon={<BarChartOutlined />}
    onClick={onClick}
    className="flex items-center h-10 px-4 bg-green-50 text-green-600 hover:bg-green-100 border-none rounded-md shadow-sm transition-all duration-150"
  >
    <span className="ml-2 font-medium">Usage Stats</span>
  </Button>
);

// Renders the delete all users button
const DeleteAllButton = ({ onClick, selectedOrg }) => (
  <Button
    icon={<DeleteOutlined />}
    onClick={() => onClick(selectedOrg)}
    className="flex items-center h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-md shadow-sm transition-all duration-150"
  >
    <span className="ml-2 font-medium">Delete All Users</span>
  </Button>
);

// Renders search input with icon
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

// Renders create user button
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

// Renders the bulk delete button
const BulkDeleteButton = ({ selectedUsers, onClick, disabled }) => (
  <Button
    icon={<DeleteOutlined />}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center h-10 px-4 ${
      disabled 
        ? 'bg-gray-100 text-gray-400' 
        : 'bg-red-50 text-red-600 hover:bg-red-100'
    } border-none rounded-md shadow-sm transition-all duration-150`}
  >
    <span className="ml-2 font-medium">Delete Selected ({selectedUsers.length})</span>
  </Button>
);

// Renders header with all control buttons
const Header = ({ onStatsClick, onSearchChange, onCreateUser, onDeleteAllUsers, organizations, selectedOrg, onOrgChange, selectedUsers, onBulkDelete }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
    <div className="flex items-center space-x-4">
      <StatsButton onClick={onStatsClick} />
      <DeleteAllButton onClick={onDeleteAllUsers} selectedOrg={selectedOrg} />
      <BulkDeleteButton 
        selectedUsers={selectedUsers}
        onClick={onBulkDelete}
        disabled={selectedUsers.length === 0}
      />
      <SearchBox onSearchChange={onSearchChange} />
      <OrganizationDropdown 
        selectedOrg={selectedOrg}
        organizations={organizations}
        onOrgChange={onOrgChange}
      />
      <CreateUserButton onClick={onCreateUser} />
    </div>
  </div>
);

// Renders table header with column titles
const TableHeader = ({ onSelectAll, allSelected, hasUsers }) => (
  <div className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1.5fr] p-5 text-sm font-medium text-gray-600 border-b bg-gray-50">
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={onSelectAll}
        disabled={!hasUsers}
        className="w-4 h-4 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
      />
    </div>
    <div>Name</div>
    <div>Password</div>
    <div>Created at</div>
    <div>Modifications</div>
    <div className="text-center">Actions</div>
  </div>
);

// Renders action buttons for each user row
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

// Renders a single user row
const UserRow = ({ user, onModify, onDelete, formatDate, isSelected, onSelect }) => (
  <div className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1.5fr] p-5 hover:bg-gray-50 border-b items-center transition-colors duration-150">
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(user)}
        className="w-4 h-4 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 cursor-pointer"
      />
    </div>
    <div className="flex items-center space-x-3">
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium shadow-sm">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium text-gray-700">{user.name}</span>
    </div>
    <div className="font-mono text-gray-600">{user.password}</div>
    <div className="text-gray-600">{formatDate(user.created_at)}</div>
    <div className="text-gray-600">{user.modifications || 0}</div>
    <UserActions user={user} onModify={onModify} onDelete={onDelete} />
  </div>
);

// Renders pagination controls
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

// Renders the main table content
const TableContent = ({ currentUsers, onModify, onDelete, formatDate, selectedUsers, onSelectUser, onSelectAll }) => {
  const allSelected = currentUsers.length > 0 && currentUsers.every(user => selectedUsers.includes(user.name));
  
  return (
    <>
      <TableHeader 
        onSelectAll={() => onSelectAll(currentUsers)}
        allSelected={allSelected}
        hasUsers={currentUsers.length > 0}
      />
      {currentUsers.map((user) => (
        <UserRow
          key={user.name}
          user={user}
          onModify={onModify}
          onDelete={onDelete}
          formatDate={formatDate}
          isSelected={selectedUsers.includes(user.name)}
          onSelect={onSelectUser}
        />
      ))}
      {currentUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50">
          No users found
        </div>
      )}
    </>
  );
};

// Main UserList component
function UserList() {
  // State management hooks
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modifyUser, setModifyUser] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('manufacturing');
  const pageSize = 10;
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  // Fetches organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetches users when selected organization changes
  useEffect(() => {
    if (selectedOrg) {
      fetchUsers();
    }
  }, [selectedOrg]);

  // Reset selected users when organization changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [selectedOrg]);

  // Filter users based on search text
  const getFilteredUsers = () => {
    if (!searchText.trim()) return users;
    
    const searchLower = searchText.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.password.toLowerCase().includes(searchLower) ||
      (user.created_at && user.created_at.toLowerCase().includes(searchLower))
    );
  };

  // Pagination calculations with filtered users
  const filteredUsers = getFilteredUsers();
  const indexOfLastUser = currentPage * pageSize;
  const indexOfFirstUser = indexOfLastUser - pageSize;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Handle search text change
  const handleSearchChange = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Fetches organizations on component mount
  const fetchOrganizations = async () => {
    try {
      const orgs = await API.getOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg('manufacturing');
      }
    } catch (error) {
      message.error('Failed to fetch organizations');
    }
  };

  // Fetches users for selected organization
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getAllUsers(selectedOrg);
      setUsers(data || []);
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formats date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handles single user deletion
  const handleDelete = async (name) => {
    try {
      setLoading(true);
      await API.deleteUser(name, selectedOrg);
      message.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles deletion of all users in selected organization
  const handleDeleteAllUsers = async (organization) => {
    const confirmation = prompt(`Type "Deleting all users from ${organization}" to confirm:`);
    if (confirmation === `Deleting all users from ${organization}`) {
      try {
        setLoading(true);
        await API.deleteAllUsers(organization);
        message.success(`All users from ${organization} deleted successfully`);
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

  // Handles organization change
  const handleOrgChange = (org) => {
    setSelectedOrg(org);
    setCurrentPage(1);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const confirmation = prompt(
      `Type "Deleting ${selectedUsers.length} users from ${selectedOrg}" to confirm:`
    );
    if (confirmation === `Deleting ${selectedUsers.length} users from ${selectedOrg}`) {
      try {
        setLoading(true);
        await Promise.all(selectedUsers.map(name => API.deleteUser(name, selectedOrg)));
        message.success(`Successfully deleted ${selectedUsers.length} users`);
        setSelectedUsers([]);
        await fetchUsers();
      } catch (error) {
        message.error('Error deleting users');
      } finally {
        setLoading(false);
      }
    } else {
      message.info('Deletion cancelled');
    }
  };

  // Handle single user selection
  const handleSelectUser = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.includes(user.name);
      if (isSelected) {
        return prev.filter(name => name !== user.name);
      } else {
        return [...prev, user.name];
      }
    });
  };

  // Handle select all users
  const handleSelectAll = (users) => {
    setSelectedUsers(prev => {
      const allSelected = users.every(user => prev.includes(user.name));
      if (allSelected) {
        return prev.filter(name => !users.find(u => u.name === name));
      } else {
        const newSelected = users.map(u => u.name);
        return [...new Set([...prev, ...newSelected])];
      }
    });
  };

  // Conditional rendering based on state
  if (showStats) return <EmbeddingStats onBack={() => setShowStats(false)} />;
  if (error) return <div className="w-full p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  if (showCreateForm) return <CreateUser onBack={() => setShowCreateForm(false)} />;
  if (modifyUser) return <ModifyUser user={modifyUser} onBack={() => setModifyUser(null)} />;

  // Main render
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <Header
          onStatsClick={() => setShowStats(true)}
          onSearchChange={handleSearchChange}
          onCreateUser={() => setShowCreateForm(true)}
          onDeleteAllUsers={handleDeleteAllUsers}
          organizations={organizations}
          selectedOrg={selectedOrg}
          onOrgChange={handleOrgChange}
          selectedUsers={selectedUsers}
          onBulkDelete={handleBulkDelete}
        />
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <TableContent
              currentUsers={currentUsers}
              onModify={setModifyUser}
              onDelete={handleDelete}
              formatDate={formatDate}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
            />
            {filteredUsers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalUsers={filteredUsers.length}
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