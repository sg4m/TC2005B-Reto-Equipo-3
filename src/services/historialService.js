// ==========================================
// HISTORIAL SERVICE - BACKEND CONNECTED VERSION
// ==========================================
// This service handles all historial-related API calls

// API Base Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/historial`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }
  return await response.json();
};

// Helper function to handle network errors
const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
  }
  throw error;
};

class HistorialService {
  // Get all historial data
  async getHistorialData() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching historial data:', error);
      handleNetworkError(error);
    }
  }

  // Get filtered historial data
  async getFilteredHistorial(searchTerm = '', filterBy = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/filtered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm,
          filterBy
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching filtered historial data:', error);
      handleNetworkError(error);
    }
  }

  // Get historial statistics
  async getHistorialStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching historial stats:', error);
      handleNetworkError(error);
    }
  }
}

export default new HistorialService();