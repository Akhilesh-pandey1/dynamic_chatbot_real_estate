import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = {
  handleError: (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    alert(errorMessage);
    throw new Error(errorMessage);
  },

  getSessionId: async () => {
    try {
      console.log("API URL:", API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/get_session_id`, { withCredentials: true });
      localStorage.setItem('session_id', response.data.session_id);
      return response.data.session_id;
    } catch (error) {
      console.error('Error getting session ID:', error);
      throw error;
    }
  },

  getAllUsers: async (organization) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        params: { organization },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data.users;
    } catch (error) {
      API.handleError(error);
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
      
      if (response.status === 201) {
        return response.data;
      } else {
        throw new Error(response.data?.error || 'Failed to create user');
      }
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        console.error('Error details:', error);
        throw new Error('Failed to create user. Please try again.');
      }
    }
  },

  deleteUser: async (name, organization) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/delete-user/${name}`,
        {
          params: { organization },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting user');
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
      alert(error.response?.data?.error || 'Error modifying user');
      throw error;
    }
  },

  chatWithUser: async (name, chatHistory, organization) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/${name}`, {
        chat_history: chatHistory,
        organization: organization
      });
      return response.data;
    } catch (error) {
      throw API.handleError(error);
    }
  },

  getUserNames: async (organization) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/names`, {
        params: { organization },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data.names;
    } catch (error) {
      console.error('Error fetching user names:', error.response || error);
      alert('Error fetching user names');
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
      alert('Error fetching embedding stats');
      throw error;
    }
  },

  getStaticQuestions: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/static-questions/${username}`);
    return response.data;
  },

  deleteAllUsers: async (organization) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/delete-all-users`, {
        params: { organization },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting all users:', error.response || error);
      alert('Error deleting all users');
      throw error;
    }
  },

  getOrganizations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/organizations`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.organizations;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },
};

export default API;
