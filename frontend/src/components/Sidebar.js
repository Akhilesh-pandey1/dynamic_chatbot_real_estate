import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  UserOutlined,
  MessageOutlined,
  MenuOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const iconStyle = { fontSize: '28px' };
  const menuIconStyle = { fontSize: '24px' };

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const menuItems = [
    { 
      key: '1', 
      icon: <UserOutlined style={menuIconStyle} className="text-blue-500" />, 
      label: 'User List', 
      link: '/users' 
    },
    { 
      key: '2', 
      icon: <MessageOutlined style={menuIconStyle} className="text-purple-500" />, 
      label: 'Chatbot Admin', 
      link: '/chatbot-admin' 
    },
    { 
      key: '3', 
      icon: <FileTextOutlined style={menuIconStyle} className="text-green-500" />, 
      label: 'Static Answers', 
      link: '/static-answers' 
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 overflow-hidden"
      width={280}
      collapsedWidth={80}
      trigger={null}
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className="logo p-4 flex justify-center items-center h-16 bg-blue-50">
        {collapsed ? (
          <MenuOutlined style={{ ...iconStyle, fontSize: '32px' }} className="text-blue-600" />
        ) : (
          <h2 className="text-blue-600 text-2xl font-bold">Admin Panel</h2>
        )}
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        className="border-r-0 text-lg"
      >
        {menuItems.map(item => (
          <Menu.Item 
            key={item.key} 
            icon={item.icon}
            className={`h-16 ${collapsed ? 'flex justify-center' : ''}`}
          >
            <Link to={item.link} className="inline-flex items-center">
              <span className="ml-3">{!collapsed && item.label}</span>
            </Link>
          </Menu.Item>
        ))}
      </Menu>

      <style jsx>{`
        .ant-menu-item {
          display: flex !important;
          align-items: center !important;
        }
        
        .ant-menu-item .anticon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .ant-menu-item-icon {
          min-width: 24px !important;
        }
      `}</style>
    </Sider>
  );
}

export default Sidebar;
