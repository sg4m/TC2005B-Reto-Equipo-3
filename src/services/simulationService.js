// Simulation Service - Dedicated service for rule simulation with Gemini AI
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Simulation Service
export const simulationService = {
  // Simulate rule with text input
  async simulateWithText(ruleId, textInput) {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule_id: ruleId,
          test_data: textInput
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Simulate rule with file upload
  async simulateWithFile(ruleId, file) {
    try {
      const formData = new FormData();
      formData.append('rule_id', ruleId);
      formData.append('test_file', file);

      const response = await fetch(`${API_BASE_URL}/simulation/file`, {
        method: 'POST',
        body: formData, // Don't set Content-Type, let browser handle it for FormData
      });
      
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Get simulation history
  async getSimulationHistory(ruleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/history/${ruleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Get simulation results details
  async getSimulationDetails(simulationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/details/${simulationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  }
};

export default simulationService;