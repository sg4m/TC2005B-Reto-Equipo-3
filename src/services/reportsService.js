// ==========================================
// REPORTS SERVICE - BACKEND CONNECTED VERSION
// ==========================================
// This service connects to the backend API endpoints

// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

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

class ReportsService {
  // Get comprehensive reports data from backend
  async getReportsData() {
    try {
      // Fetch data from working endpoints only
      const [rulesStats, usersStats, simulationStats, dashboard] = await Promise.all([
        this.getRulesStats().catch(err => {
          console.warn('Rules stats failed:', err);
          return {};
        }),
        this.getUsersStats().catch(err => {
          console.warn('Users stats failed:', err);
          return {};
        }),
        this.getSimulationStats().catch(err => {
          console.warn('Simulation stats failed:', err);
          return {};
        }),
        this.getDashboardData().catch(err => {
          console.warn('Dashboard data failed:', err);
          return {};
        })
      ]);

      // Combine all data into a single object with fallbacks
      return {
        // Rules statistics - map the correct field names from backend
        activeRules: rulesStats.Activa || 0,
        inactiveRules: rulesStats.Inactiva || 0,
        simulationRules: simulationStats.rulesWithSimulations || 0, // Use actual simulation count from DB
        
        // Users statistics
        totalUsers: usersStats.totalUsers || 0,
        activeUsers: usersStats.activeUsers || 0,
        
        // Simulation detailed statistics
        totalSimulations: simulationStats.totalSimulations || 0,
        textSimulations: simulationStats.textSimulations || 0,
        fileSimulations: simulationStats.fileSimulations || 0,
        
        // Recent activity data
        recentActivity: dashboard.recentActivity || null,
        
        // Most successful rule
        mostSuccessfulRule: dashboard.mostSuccessfulRule || null,
        
        // Usage statistics (placeholder for now)
        mostUsedRuleId: dashboard.mostUsedRuleId || '--',
        leastUsedRuleId: dashboard.leastUsedRuleId || '--'
      };
    } catch (error) {
      console.error('Error fetching reports data:', error);
      handleNetworkError(error);
    }
  }

  // Get rules statistics from backend
  async getRulesStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/rules-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching rules stats:', error);
      handleNetworkError(error);
    }
  }

  // Get users statistics from backend
  async getUsersStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/users-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching users stats:', error);
      handleNetworkError(error);
    }
  }

  // Get simulation statistics from backend
  async getSimulationStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/simulation-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching simulation stats:', error);
      handleNetworkError(error);
    }
  }

  // Get dashboard data (recent activity, most successful rule)
  async getDashboardData() {
    try {
      // For now, since we don't have historial_reglas table, we'll return basic placeholder data
      // This can be enhanced once the database schema includes execution history
      return {
        recentActivity: {
          lastCreated: {
            id: '--',
            createdDate: '--',
            details: 'Información no disponible (requiere tabla historial_reglas)'
          },
          lastModified: {
            id: '--',
            modifiedDate: '--',
            details: 'Información no disponible (requiere tabla historial_reglas)'
          }
        },
        
        mostSuccessfulRule: {
          id: '--',
          createdDate: '--',
          publishedDate: '--', 
          affectedUsers: '--',
          successRate: '--'
        },
        
        // These would be available if we had usage tracking
        mostUsedRuleId: '--',
        leastUsedRuleId: '--'
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return null instead of throwing error to allow partial data loading
      return {
        recentActivity: null,
        mostSuccessfulRule: null
      };
    }
  }

  // Export data as PDF from backend
  async exportToPDF() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      // The backend returns PDF binary data - use blob() to handle properly
      const blob = await response.blob();
      
      // Ensure the blob has the correct MIME type
      if (blob.type !== 'application/pdf') {
        // If the backend didn't set the correct type, create a new blob with the right type
        return new Blob([blob], { type: 'application/pdf' });
      }
      
      return blob;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      handleNetworkError(error);
    }
  }

  // Export data as CSV from backend  
  async exportToCSV() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export/csv`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      // The backend returns CSV formatted data as text
      const csvData = await response.text();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      return blob;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      handleNetworkError(error);
    }
  }

  // Helper method to format data for PDF-like display
  formatDataForPDF(data) {
    const currentDate = new Date().toLocaleDateString('es-MX');
    let content = `Reporte de Reglas de Negocio - ${currentDate}\n\n`;
    
    if (data && Array.isArray(data) && data.length > 0) {
      content += `Resumen de Reglas:\n`;
      content += `===================\n\n`;
      
      data.forEach((rule, index) => {
        content += `${index + 1}. ${rule.nombre || 'Sin nombre'}\n`;
        content += `   ID: ${rule.id_regla || 'N/A'}\n`;
        content += `   Descripción: ${rule.descripcion || 'Sin descripción'}\n`;
        content += `   Estado: ${rule.status || 'N/A'}\n`;
        content += `   Fecha de creación: ${rule.fecha_creacion ? new Date(rule.fecha_creacion).toLocaleDateString('es-MX') : 'N/A'}\n`;
        content += `   Total de ejecuciones: ${rule.total_executions || 0}\n`;
        content += `   Ejecuciones exitosas: ${rule.successful_executions || 0}\n`;
        content += `\n`;
      });
    } else {
      content += `No hay datos disponibles para mostrar.\n`;
    }
    
    return content;
  }

  // Get filtered reports data from backend
  async getFilteredReports(filters = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/filtered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
      handleNetworkError(error);
    }
  }

  // Get all rules with detailed information
  async getAllRulesDetails() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/rules-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching rules details:', error);
      handleNetworkError(error);
    }
  }
}

export default new ReportsService();