// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

// Authentication Services
export const authService = {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },
};

// Business Rules Services
export const rulesService = {
  // Generate business rule with AI (supports text prompt and file upload)
  async generateRule(data) {
    try {
      const formData = new FormData();
      
      // Add text data
      if (data.usuario_id) formData.append('usuario_id', data.usuario_id);
      if (data.nombre) formData.append('nombre', data.nombre);
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      if (data.prompt_texto) formData.append('prompt_texto', data.prompt_texto);
      
      // Add file if provided
      if (data.archivo) {
        formData.append('archivo', data.archivo);
      }

      const response = await fetch(`${API_BASE_URL}/rules/generate`, {
        method: 'POST',
        body: formData, // Don't set Content-Type, let browser handle it for FormData
      });
      
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Get user's business rules
  async getUserRules(usuarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/user/${usuarioId}`, {
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

  // Get recent movements for dashboard
  async getUserMovements(usuarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/movements/${usuarioId}`, {
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

  // Refine existing rule with AI
  async refineRule(ruleId, feedback) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Update rule status
  async updateRuleStatus(ruleId, estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Get all business rules for management
  async getAllRules() {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/list`, {
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

  // Update business rule
  async updateRule(ruleId, ruleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },
};

// AI Services
export const aiService = {
  // Continue conversation with Gemini
  async continueConversation(message, conversationHistory = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/continue-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          conversationHistory 
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Test Gemini AI connection
  async testGemini(prompt) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/test-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      return await handleResponse(response);
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Get Gemini AI info
  async getGeminiInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/gemini-info`, {
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
};

// Health Check Service
export const healthService = {
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
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
};

// Export all services
export default {
  auth: authService,
  rules: rulesService,
  ai: aiService,
  health: healthService,
};