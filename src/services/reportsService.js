import api from './api';

class ReportsService {
  // Get comprehensive reports data
  async getReportsData() {
    try {
      const response = await api.get('/reports/data');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      throw new Error('Error al obtener datos de reportes');
    }
  }

  // Get rules statistics
  async getRulesStats() {
    try {
      const response = await api.get('/reports/rules-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching rules statistics:', error);
      throw new Error('Error al obtener estadísticas de reglas');
    }
  }

  // Get users statistics
  async getUsersStats() {
    try {
      const response = await api.get('/reports/users-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching users statistics:', error);
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  // Export data as PDF
  async exportToPDF() {
    try {
      const response = await api.get('/reports/export/pdf', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Error al exportar PDF');
    }
  }

  // Export data as CSV
  async exportToCSV() {
    try {
      const response = await api.get('/reports/export/csv', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Error al exportar CSV');
    }
  }

  // Get filtered reports data
  async getFilteredReports(filters = {}) {
    try {
      const response = await api.post('/reports/filtered', filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
      throw new Error('Error al obtener reportes filtrados');
    }
  }
}

export default new ReportsService();