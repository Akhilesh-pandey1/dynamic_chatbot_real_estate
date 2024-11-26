import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = {
  getSessionId: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_session_id`, { withCredentials: true });
      localStorage.setItem('session_id', response.data.session_id);
      return response.data.session_id;
    } catch (error) {
      console.error('Error getting session ID:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('API Response:', response.data);
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users:', error.response || error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/create-user`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error.response || error);
      throw error;
    }
  },

  deleteUser: async (name) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/delete-user/${name}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error.response || error);
      throw error;
    }
  },

  modifyUser: async (name, text) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/modify-user-embeddings/${name}`,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error modifying user:', error.response || error);
      throw error;
    }
  },

  chatWithUser: async (name, chatHistory) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${name}`,
        { chat_history: chatHistory },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in chat:', error.response || error);
      throw error;
    }
  },

  getUserNames: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/names`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data.names;
    } catch (error) {
      console.error('Error fetching user names:', error.response || error);
      throw error;
    }
  },

  getEmbeddingStats: async () => {
    try {
      console.log("Fetching embedding stats...");
      const response = await axios.get(`${API_BASE_URL}/api/embedding-stats`, {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      console.log("Embedding stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching embedding stats:', error.response || error);
      throw error;
    }
  },
};

export default API;
