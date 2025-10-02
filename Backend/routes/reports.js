const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get comprehensive reports data
router.get('/data', async (req, res) => {
  try {
    // Get rules statistics
    const activeRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglas_negocio 
      WHERE estado = 'activo'
    `;
    
    const inactiveRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglas_negocio 
      WHERE estado = 'inactivo'
    `;
    
    const simulationRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglas_negocio 
      WHERE estado = 'simulacion'
    `;
    
    // Get users statistics
    const totalUsersQuery = `
      SELECT COUNT(*) as count 
      FROM usuarios
    `;
    
    const activeUsersQuery = `
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE ultimo_acceso > NOW() - INTERVAL '30 days'
    `;
    
    // Get most and least used rules
    const mostUsedRuleQuery = `
      SELECT id_regla, COUNT(*) as usage_count 
      FROM historial_reglas 
      GROUP BY id_regla 
      ORDER BY usage_count DESC 
      LIMIT 1
    `;
    
    const leastUsedRuleQuery = `
      SELECT id_regla, COUNT(*) as usage_count 
      FROM historial_reglas 
      GROUP BY id_regla 
      ORDER BY usage_count ASC 
      LIMIT 1
    `;
    
    // Get recent rule activity
    const lastCreatedRuleQuery = `
      SELECT * FROM reglas_negocio 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `;
    
    const lastModifiedRuleQuery = `
      SELECT * FROM reglas_negocio 
      ORDER BY fecha_modificacion DESC 
      LIMIT 1
    `;
    
    // Get most successful rule (highest success rate)
    const mostSuccessfulRuleQuery = `
      SELECT r.*, 
             COUNT(h.id) as total_executions,
             COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions,
             (COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) * 100.0 / COUNT(h.id)) as success_rate
      FROM reglas_negocio r
      LEFT JOIN historial_reglas h ON r.id_regla = h.id_regla
      GROUP BY r.id_regla
      HAVING COUNT(h.id) > 0
      ORDER BY success_rate DESC, total_executions DESC
      LIMIT 1
    `;

    // Execute all queries
    const [
      activeRulesResult,
      inactiveRulesResult, 
      simulationRulesResult,
      totalUsersResult,
      activeUsersResult,
      mostUsedRuleResult,
      leastUsedRuleResult,
      lastCreatedRuleResult,
      lastModifiedRuleResult,
      mostSuccessfulRuleResult
    ] = await Promise.all([
      db.query(activeRulesQuery),
      db.query(inactiveRulesQuery),
      db.query(simulationRulesQuery),
      db.query(totalUsersQuery),
      db.query(activeUsersQuery),
      db.query(mostUsedRuleQuery),
      db.query(leastUsedRuleQuery),
      db.query(lastCreatedRuleQuery),
      db.query(lastModifiedRuleQuery),
      db.query(mostSuccessfulRuleQuery)
    ]);

    const reportsData = {
      activeRules: parseInt(activeRulesResult.rows[0]?.count || 0),
      inactiveRules: parseInt(inactiveRulesResult.rows[0]?.count || 0),
      simulationRules: parseInt(simulationRulesResult.rows[0]?.count || 0),
      totalUsers: parseInt(totalUsersResult.rows[0]?.count || 0),
      activeUsers: parseInt(activeUsersResult.rows[0]?.count || 0),
      mostUsedRuleId: mostUsedRuleResult.rows[0]?.id_regla || 'N/A',
      leastUsedRuleId: leastUsedRuleResult.rows[0]?.id_regla || 'N/A',
      lastCreatedRule: lastCreatedRuleResult.rows[0] || null,
      lastModifiedRule: lastModifiedRuleResult.rows[0] || null,
      mostSuccessfulRule: mostSuccessfulRuleResult.rows[0] || null
    };

    res.json(reportsData);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Get rules statistics only
router.get('/rules-stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        estado,
        COUNT(*) as count
      FROM reglas_negocio 
      GROUP BY estado
    `;
    
    const result = await db.query(query);
    
    const stats = {};
    result.rows.forEach(row => {
      stats[row.estado] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching rules statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Get users statistics only
router.get('/users-stats', async (req, res) => {
  try {
    const totalUsersQuery = `SELECT COUNT(*) as count FROM usuarios`;
    const activeUsersQuery = `
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE ultimo_acceso > NOW() - INTERVAL '30 days'
    `;
    
    const [totalResult, activeResult] = await Promise.all([
      db.query(totalUsersQuery),
      db.query(activeUsersQuery)
    ]);

    const stats = {
      totalUsers: parseInt(totalResult.rows[0]?.count || 0),
      activeUsers: parseInt(activeResult.rows[0]?.count || 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching users statistics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Export reports data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    // Get comprehensive data for CSV export
    const rulesQuery = `
      SELECT 
        r.id_regla,
        r.nombre,
        r.descripcion,
        r.estado,
        r.fecha_creacion,
        r.fecha_modificacion,
        COUNT(h.id) as total_executions,
        COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions
      FROM reglas_negocio r
      LEFT JOIN historial_reglas h ON r.id_regla = h.id_regla
      GROUP BY r.id_regla, r.nombre, r.descripcion, r.estado, r.fecha_creacion, r.fecha_modificacion
      ORDER BY r.fecha_creacion DESC
    `;
    
    const result = await db.query(rulesQuery);
    
    // Create CSV content
    const csvHeader = 'ID Regla,Nombre,Descripcion,Estado,Fecha Creacion,Fecha Modificacion,Total Ejecuciones,Ejecuciones Exitosas,Tasa de Exito\n';
    const csvContent = result.rows.map(row => {
      const successRate = row.total_executions > 0 
        ? ((row.successful_executions / row.total_executions) * 100).toFixed(2) + '%'
        : '0%';
      
      return [
        row.id_regla,
        `"${row.nombre || ''}"`,
        `"${row.descripcion || ''}"`,
        row.estado,
        row.fecha_creacion ? new Date(row.fecha_creacion).toISOString().split('T')[0] : '',
        row.fecha_modificacion ? new Date(row.fecha_modificacion).toISOString().split('T')[0] : '',
        row.total_executions || 0,
        row.successful_executions || 0,
        successRate
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvContent;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-reglas-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Export reports data as PDF (simplified - returns JSON for now, can be enhanced with PDF library)
router.get('/export/pdf', async (req, res) => {
  try {
    // For now, we'll return the data as JSON
    // In a real implementation, you'd use a PDF library like puppeteer or pdfkit
    const dataQuery = `
      SELECT 
        r.id_regla,
        r.nombre,
        r.descripcion,
        r.estado,
        r.fecha_creacion,
        r.fecha_modificacion,
        COUNT(h.id) as total_executions,
        COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions
      FROM reglas_negocio r
      LEFT JOIN historial_reglas h ON r.id_regla = h.id_regla
      GROUP BY r.id_regla, r.nombre, r.descripcion, r.estado, r.fecha_creacion, r.fecha_modificacion
      ORDER BY r.fecha_creacion DESC
    `;
    
    const result = await db.query(dataQuery);
    
    // Create a simple text-based report for PDF
    const reportContent = {
      title: 'Reporte de Reglas de Negocio',
      generatedAt: new Date().toISOString(),
      data: result.rows.map(row => ({
        ...row,
        success_rate: row.total_executions > 0 
          ? ((row.successful_executions / row.total_executions) * 100).toFixed(2) + '%'
          : '0%'
      }))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-reglas-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(reportContent);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Get filtered reports data
router.post('/filtered', async (req, res) => {
  try {
    const { estado, fecha_inicio, fecha_fin, usuario_id } = req.body;
    
    let query = `
      SELECT 
        r.id_regla,
        r.nombre,
        r.descripcion,
        r.estado,
        r.fecha_creacion,
        r.fecha_modificacion,
        r.creado_por,
        COUNT(h.id) as total_executions,
        COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions
      FROM reglas_negocio r
      LEFT JOIN historial_reglas h ON r.id_regla = h.id_regla
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (estado) {
      query += ` AND r.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }
    
    if (fecha_inicio) {
      query += ` AND r.fecha_creacion >= $${paramIndex}`;
      params.push(fecha_inicio);
      paramIndex++;
    }
    
    if (fecha_fin) {
      query += ` AND r.fecha_creacion <= $${paramIndex}`;
      params.push(fecha_fin);
      paramIndex++;
    }
    
    if (usuario_id) {
      query += ` AND r.creado_por = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }
    
    query += `
      GROUP BY r.id_regla, r.nombre, r.descripcion, r.estado, r.fecha_creacion, r.fecha_modificacion, r.creado_por
      ORDER BY r.fecha_creacion DESC
    `;
    
    const result = await db.query(query, params);
    
    const filteredData = result.rows.map(row => ({
      ...row,
      success_rate: row.total_executions > 0 
        ? ((row.successful_executions / row.total_executions) * 100).toFixed(2)
        : 0
    }));

    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching filtered reports:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

module.exports = router;