import { useState, useEffect, useCallback } from 'react';
import historialService from '../services/historialService';

export const useHistorial = () => {
  const [historialData, setHistorialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all historial data
  const fetchHistorialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser?.id || null;
      const data = await historialService.getHistorialData(userId);
      setHistorialData(data);
      setFilteredData(data);
    } catch (err) {
      console.error('Error fetching historial data:', err);
      setError('Error al cargar datos del historial');
      // Set empty arrays on error to prevent crashes
      setHistorialData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filtered historial data
  const fetchFilteredData = useCallback(async (searchTerm, filterBy) => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser?.id || null;
      const data = await historialService.getFilteredHistorial(searchTerm, filterBy, userId);
      setFilteredData(data);
    } catch (err) {
      console.error('Error fetching filtered historial data:', err);
      setError('Error al filtrar datos del historial');
      // On filter error, show original data
      setFilteredData(historialData);
    } finally {
      setLoading(false);
    }
  }, [historialData]);

  // Fetch historial statistics
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await historialService.getHistorialStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching historial stats:', err);
      // Don't show error for stats, just log it
      setStats({});
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(() => {
    fetchHistorialData();
    fetchStats();
  }, [fetchHistorialData, fetchStats]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Clear filters and show all data
  const clearFilters = useCallback(() => {
    setFilteredData(historialData);
  }, [historialData]);

  return {
    historialData,
    filteredData,
    stats,
    loading,
    error,
    fetchHistorialData,
    fetchFilteredData,
    refreshData,
    clearFilters
  };
};