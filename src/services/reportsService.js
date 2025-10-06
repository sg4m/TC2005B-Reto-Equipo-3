// ==========================================
// REPORTS SERVICE - FRONTEND ONLY VERSION
// ==========================================
// This service uses mock data instead of backend API calls
// to allow frontend development without backend dependencies

// Mock data for reports - Frontend only
const mockReportsData = {
  activeRules: 45,
  inactiveRules: 12,
  simulationRules: 8,
  totalUsers: 127,
  activeUsers: 89,
  mostUsedRuleId: 'RULE-001',
  leastUsedRuleId: 'RULE-023',
  lastCreatedRule: {
    id_regla: 'RULE-045',
    nombre: 'Validación de Transferencias Internacionales',
    descripcion: 'Regla para validar límites en transferencias internacionales',
    estado: 'activo',
    fecha_creacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  lastModifiedRule: {
    id_regla: 'RULE-032',
    nombre: 'Control de Retiros ATM',
    descripcion: 'Regla actualizada para control de retiros en cajeros automáticos',
    estado: 'activo',
    fecha_modificacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  mostSuccessfulRule: {
    id_regla: 'RULE-015',
    nombre: 'Detección de Fraude en Línea',
    descripcion: 'Sistema de detección automatizada de transacciones fraudulentas',
    success_rate: 94.5,
    total_executions: 1250,
    successful_executions: 1181
  }
};

const mockRulesStats = {
  activo: 45,
  inactivo: 12,
  simulacion: 8,
  pendiente: 3
};

const mockUsersStats = {
  totalUsers: 127,
  activeUsers: 89
};

class ReportsService {
  // Get comprehensive reports data - Mock version
  async getReportsData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return empty data for now - ready for backend integration
    return {};
  }

  // Get rules statistics - Mock version
  async getRulesStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return empty data for now - ready for backend integration
    return {};
  }

  // Get users statistics - Mock version
  async getUsersStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return empty data for now - ready for backend integration
    return {};
  }

  // Export data as PDF - Mock version
  async exportToPDF() {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    
    // Create mock PDF content
    const mockPdfContent = `Reporte de Reglas de Negocio - ${new Date().toLocaleDateString()}
    
Estadísticas:
- Reglas Activas: ${mockReportsData.activeRules}
- Reglas Inactivas: ${mockReportsData.inactiveRules}
- Reglas en Simulación: ${mockReportsData.simulationRules}
- Total de Usuarios: ${mockReportsData.totalUsers}
- Usuarios Activos: ${mockReportsData.activeUsers}

Última Regla Creada: ${mockReportsData.lastCreatedRule.nombre}
Regla Más Exitosa: ${mockReportsData.mostSuccessfulRule.nombre} (${mockReportsData.mostSuccessfulRule.success_rate}% éxito)`;

    // Create a mock blob
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    return blob;
  }

  // Export data as CSV - Mock version
  async exportToCSV() {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing time
    
    // Create mock CSV content
    const csvContent = `ID,Nombre,Descripcion,Estado,Fecha Creacion,Ejecuciones,Tasa de Exito
RULE-001,Validación de Saldos,Control de saldos mínimos,activo,2025-01-15,1250,95.2%
RULE-002,Límites de Transferencia,Control de límites diarios,activo,2025-01-20,890,92.8%
RULE-003,Detección de Fraude,Sistema antifraude,activo,2025-02-01,2100,94.5%
RULE-004,Validación KYC,Know Your Customer,inactivo,2025-02-05,450,88.9%
RULE-005,Control ATM,Límites de retiro,simulacion,2025-02-10,120,91.7%`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    return blob;
  }

  // Get filtered reports data - Mock version
  async getFilteredReports(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock filtered data based on filters
    const mockFilteredData = [
      {
        id_regla: 'RULE-001',
        nombre: 'Validación de Saldos',
        descripcion: 'Control automatizado de saldos mínimos en cuentas',
        estado: 'activo',
        fecha_creacion: '2025-01-15',
        total_executions: 1250,
        successful_executions: 1190,
        success_rate: 95.2
      },
      {
        id_regla: 'RULE-002',
        nombre: 'Límites de Transferencia',
        descripcion: 'Control de límites diarios y mensuales en transferencias',
        estado: 'activo',
        fecha_creacion: '2025-01-20',
        total_executions: 890,
        successful_executions: 826,
        success_rate: 92.8
      },
      {
        id_regla: 'RULE-003',
        nombre: 'Detección de Fraude en Línea',
        descripcion: 'Sistema de detección automatizada de transacciones fraudulentas',
        estado: 'activo',
        fecha_creacion: '2025-02-01',
        total_executions: 2100,
        successful_executions: 1984,
        success_rate: 94.5
      }
    ];
    
    // Apply basic filtering (for demo purposes)
    let filteredData = mockFilteredData;
    
    if (filters.estado) {
      filteredData = filteredData.filter(item => item.estado === filters.estado);
    }
    
    return filteredData;
  }
}

export default new ReportsService();