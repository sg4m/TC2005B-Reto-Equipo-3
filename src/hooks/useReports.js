import { useState, useEffect, useCallback } from 'react';
import reportsService from '../services/reportsService';

export const useReports = () => {
  const [reportsData, setReportsData] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reports data from mock service (frontend only)
  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser?.id || null;
      const data = await reportsService.getReportsData(userId);
      setReportsData(data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Error al cargar datos de reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Export reports data as PDF
  const exportToPDF = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await reportsService.exportToPDF();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-reglas-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Error al exportar PDF');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Export reports data as CSV
  const exportToCSV = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await reportsService.exportToCSV();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-reglas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError('Error al exportar CSV');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Load data on mount
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
    reportsData,
    loading,
    error,
    refreshData,
    exportToPDF,
    exportToCSV
  };
};