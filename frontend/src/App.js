import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserList from './components/UserList';
import ChatbotAdmin from './components/ChatbotAdmin';
import StaticAnswers from './components/StaticAnswers';

const { Content } = Layout;

function App() {
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('session_id')) {
          localStorage.removeItem(key);
        }
      });
    };

    handleBeforeUnload();

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Router>
      <Layout className="h-screen overflow-hidden">
        <Navbar />
        <Layout>
          <Sidebar />
          <Layout 
            className="ml-20 transition-all duration-300 ease-in-out"
            style={{ marginTop: '64px', height: 'calc(100vh - 64px)' }}
          >
            <Content className="h-full overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/users" replace />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/chatbot-admin" element={<ChatbotAdmin />} />
                <Route path="/static-answers" element={<StaticAnswers />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
