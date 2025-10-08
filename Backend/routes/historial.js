const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all historial data for the Historial page
router.get('/', async (req, res) => {
  try {
    // Support optional user filter: /api/historial?user_id=123
    const { user_id } = req.query;
    let query = `
      SELECT 
        id,
        status,
        fecha_creacion,
        input_usuario,
        resumen
      FROM reglanegocio
    `;
    const params = [];
    if (user_id) {
      query += ` WHERE usuario_id = $1 `;
      params.push(user_id);
    }
    query += ` ORDER BY fecha_creacion DESC `;

    const result = await db.query(query, params);
    
    // Format data for frontend consumption
    const historialData = result.rows.map(row => ({
      id: `REG-${String(row.id).padStart(4, '0')}`,
      id_regla: row.id,
      status: row.status || 'N/A',
      createdAt: row.fecha_creacion,
      summary: row.resumen || row.input_usuario || 'Sin descripción disponible'
    }));

    res.json(historialData);
  } catch (error) {
    console.error('Error fetching historial data:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Get filtered historial data
router.post('/filtered', async (req, res) => {
  try {
    const { searchTerm, filterBy, user_id } = req.body;
    
    let query = `
      SELECT 
        id,
        status,
        fecha_creacion,
        input_usuario,
        resumen
      FROM reglanegocio
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    // If user_id provided, restrict to that user's records
    if (user_id) {
      query += ` AND usuario_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    
    // Apply search filters
    if (searchTerm && searchTerm.trim() !== '') {
      const searchValue = `%${searchTerm.toLowerCase()}%`;
      
      switch (filterBy) {
        case 'id':
          query += ` AND LOWER(CAST(id AS TEXT)) LIKE $${paramIndex}`;
          params.push(searchValue);
          paramIndex++;
          break;
        case 'time':
          query += ` AND LOWER(TO_CHAR(fecha_creacion, 'YYYY-MM-DD HH24:MI')) LIKE $${paramIndex}`;
          params.push(searchValue);
          paramIndex++;
          break;
        case 'summary':
          query += ` AND (LOWER(resumen) LIKE $${paramIndex} OR LOWER(input_usuario) LIKE $${paramIndex + 1})`;
          params.push(searchValue, searchValue);
          paramIndex += 2;
          break;
        case 'all':
        default:
          query += ` AND (
            LOWER(CAST(id AS TEXT)) LIKE $${paramIndex} OR
            LOWER(TO_CHAR(fecha_creacion, 'YYYY-MM-DD HH24:MI')) LIKE $${paramIndex + 1} OR
            LOWER(resumen) LIKE $${paramIndex + 2} OR
            LOWER(input_usuario) LIKE $${paramIndex + 3}
          )`;
          params.push(searchValue, searchValue, searchValue, searchValue);
          paramIndex += 4;
          break;
      }
    }
    
    query += ' ORDER BY fecha_creacion DESC';
    
    const result = await db.query(query, params);
    
    // Format data for frontend consumption
    const historialData = result.rows.map(row => ({
      id: `REG-${String(row.id).padStart(4, '0')}`,
      id_regla: row.id,
      status: row.status || 'N/A',
      createdAt: row.fecha_creacion,
      summary: row.resumen || row.input_usuario || 'Sin descripción disponible'
    }));

    res.json(historialData);
  } catch (error) {
    console.error('Error fetching filtered historial data:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Get historial statistics
router.get('/stats', async (req, res) => {
  try {
    // Support optional user filter via query param: /stats?user_id=123
    const { user_id } = req.query;
    let statsQuery = `
      SELECT 
        COUNT(*) as total_rules,
        COUNT(CASE WHEN status = 'Activa' THEN 1 END) as active_rules,
        COUNT(CASE WHEN status = 'Inactiva' THEN 1 END) as inactive_rules,
        COUNT(CASE WHEN status = 'Simulacion' THEN 1 END) as simulation_rules,
        COUNT(CASE WHEN fecha_creacion > NOW() - INTERVAL '7 days' THEN 1 END) as recent_rules
      FROM reglanegocio
    `;

    const params = [];
    if (user_id) {
      statsQuery = statsQuery.replace(/FROM reglanegocio/, 'FROM reglanegocio WHERE usuario_id = $1');
      params.push(user_id);
    }

    const result = await db.query(statsQuery, params);
    const stats = result.rows[0];

    res.json({
      totalRules: parseInt(stats.total_rules || 0),
      activeRules: parseInt(stats.active_rules || 0),
      inactiveRules: parseInt(stats.inactive_rules || 0),
      simulationRules: parseInt(stats.simulation_rules || 0),
      recentRules: parseInt(stats.recent_rules || 0)
    });
  } catch (error) {
    console.error('Error fetching historial stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

module.exports = router;