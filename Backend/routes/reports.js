const express = require('express');
const router = express.Router();
const db = require('../config/database');
const PDFDocument = require('pdfkit');

// Get comprehensive reports data
router.get('/data', async (req, res) => {
  try {
    // Get rules statistics
    const activeRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglanegocio 
      WHERE status = 'Activa'
    `;
    
    const inactiveRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglanegocio 
      WHERE status = 'Inactiva'
    `;
    
    const simulationRulesQuery = `
      SELECT COUNT(*) as count 
      FROM reglanegocio 
      WHERE status = 'Simulacion'
    `;
    
    // Get users statistics
    const totalUsersQuery = `
      SELECT COUNT(*) as count 
      FROM usuario
    `;
    
    const activeUsersQuery = `
      SELECT COUNT(*) as count 
      FROM usuario 
      WHERE fecha_registro > NOW() - INTERVAL '30 days'
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
      SELECT * FROM reglanegocio 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `;
    
    const lastModifiedRuleQuery = `
      SELECT * FROM reglanegocio 
      ORDER BY fecha_modificacion DESC 
      LIMIT 1
    `;
    
    // Get most successful rule (highest success rate)
    const mostSuccessfulRuleQuery = `
      SELECT r.*, 
             COUNT(h.id) as total_executions,
             COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions,
             (COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) * 100.0 / COUNT(h.id)) as success_rate
      FROM reglanegocio r
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
        status,
        COUNT(*) as count
      FROM reglanegocio 
      GROUP BY status
    `;
    
    const result = await db.query(query);
    
    const stats = {};
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
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
    const totalUsersQuery = `SELECT COUNT(*) as count FROM usuario`;
    // Since we don't have ultimo_acceso column, we'll just use total users for now
    // In a real scenario, you would add a last_login or ultimo_acceso column to track this
    
    const totalResult = await db.query(totalUsersQuery);
    const totalUsers = parseInt(totalResult.rows[0]?.count || 0);
    
    // For now, assume all users are active since we don't have last access data
    // You can modify this once you add a last_login column to the usuario table
    const activeUsers = totalUsers;

    const stats = {
      totalUsers: totalUsers,
      activeUsers: activeUsers
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
    // Get comprehensive data for CSV export (using only existing columns)
    const rulesQuery = `
      SELECT 
        id_regla,
        status,
        fecha_creacion,
        input_usuario,
        resumen,
        archivo_original,
        regla_estandarizada
      FROM reglanegocio
      ORDER BY fecha_creacion DESC
    `;
    
    const result = await db.query(rulesQuery);
    
    // Create CSV content
    const csvHeader = 'ID Regla,Estado,Fecha Creacion,Input Usuario,Resumen,Archivo Original,Regla Estandarizada\n';
    const csvContent = result.rows.map(row => {
      const reglaEstandarizada = row.regla_estandarizada ? String(row.regla_estandarizada).substring(0, 100) : '';
      return [
        row.id_regla || '',
        row.status || '',
        row.fecha_creacion ? new Date(row.fecha_creacion).toISOString().split('T')[0] : '',
        `"${(row.input_usuario || '').replace(/"/g, '""')}"`,
        `"${(row.resumen || '').replace(/"/g, '""')}"`,
        `"${(row.archivo_original || '').replace(/"/g, '""')}"`,
        `"${reglaEstandarizada.replace(/"/g, '""')}..."`
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

// Export reports data as PDF using PDFKit
router.get('/export/pdf', async (req, res) => {
  try {
    const dataQuery = `
      SELECT 
        id_regla,
        status,
        fecha_creacion,
        input_usuario,
        resumen,
        regla_estandarizada
      FROM reglanegocio
      ORDER BY fecha_creacion DESC
    `;
    
    const result = await db.query(dataQuery);
    
    // Set response headers before creating the document
    const filename = `reporte-reglas-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Create PDF document with buffer option for proper streaming
    const doc = new PDFDocument({ 
      margin: 50,
      bufferPages: true,
      autoFirstPage: true
    });
    
    // Create a buffer to collect PDF data
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Length', pdfData.length);
      res.end(pdfData);
    });
    
    // Add title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('REPORTE DE REGLAS DE NEGOCIO', 50, 50, { align: 'center', width: 495 });
    
    // Add generation date
    const currentDate = new Date().toLocaleDateString('es-MX');
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Generado el: ${currentDate}`, 50, 90, { align: 'center', width: 495 })
       .moveDown(2);
    
    // Add separator line
    const yPos = doc.y;
    doc.moveTo(50, yPos)
       .lineTo(545, yPos)
       .stroke()
       .moveDown(2);
    
    if (result.rows.length > 0) {
      result.rows.forEach((rule, index) => {
        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }
        
        // Rule header with better spacing
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`${index + 1}. Regla ID: ${rule.id_regla}`, 50, doc.y, { continued: false })
           .moveDown(0.3);
        
        // Rule details with consistent formatting
        doc.fontSize(10)
           .font('Helvetica');
        
        const startY = doc.y;
        doc.text(`Estado: ${rule.status || 'N/A'}`, 70, startY);
        
        const fechaCreacion = rule.fecha_creacion 
          ? new Date(rule.fecha_creacion).toLocaleDateString('es-MX') 
          : 'N/A';
        doc.text(`Creado: ${fechaCreacion}`, 70, startY + 15);
        
        let currentY = startY + 30;
        
        if (rule.input_usuario) {
          const inputText = String(rule.input_usuario).length > 300 
            ? String(rule.input_usuario).substring(0, 300) + '...'
            : String(rule.input_usuario);
          doc.text(`Input del Usuario: ${inputText}`, 70, currentY, { 
            width: 450,
            continued: false 
          });
          currentY = doc.y + 5;
        }
        
        if (rule.resumen) {
          const resumenText = String(rule.resumen).length > 300 
            ? String(rule.resumen).substring(0, 300) + '...'
            : String(rule.resumen);
          doc.text(`Resumen AI: ${resumenText}`, 70, currentY, { 
            width: 450,
            continued: false 
          });
        }
        
        doc.moveDown(1.5);
      });
    } else {
      doc.fontSize(12)
         .font('Helvetica')
         .text('No hay reglas disponibles en la base de datos.', 50, doc.y, { 
           align: 'center', 
           width: 495 
         });
    }
    
    // Add footer on each page
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .font('Helvetica')
         .text(`Reporte generado automáticamente - ${new Date().toLocaleString('es-MX')} - Página ${i + 1}`, 
               50, 
               doc.page.height - 30, 
               { align: 'center', width: 495 });
    }
    
    // Finalize the PDF - this triggers the 'end' event
    doc.end();
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
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
        r.status,
        r.fecha_creacion,
        r.fecha_modificacion,
        r.creado_por,
        COUNT(h.id) as total_executions,
        COUNT(CASE WHEN h.resultado = 'exitoso' THEN 1 END) as successful_executions
      FROM reglanegocio r
      LEFT JOIN historial_reglas h ON r.id_regla = h.id_regla
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (estado) {
      query += ` AND r.status = $${paramIndex}`;
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
      GROUP BY r.id_regla, r.nombre, r.descripcion, r.status, r.fecha_creacion, r.fecha_modificacion, r.creado_por
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