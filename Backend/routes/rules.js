const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');
const geminiService = require('../services/geminiService');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure to create this folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  // Only accept CSV files
  if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos CSV'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Generate business rule with Gemini AI
router.post('/generate', upload.single('archivo'), async (req, res) => {
  try {
    const { usuario_id, nombre, descripcion, prompt_texto } = req.body;
    
    if (!usuario_id || (!prompt_texto && !req.file)) {
      return res.status(400).json({ 
        error: 'Usuario ID y al menos un prompt de texto o archivo son requeridos' 
      });
    }

    let aiResponse;
    let archivoPath = null;

    try {
      if (req.file) {
        // Process CSV file
        archivoPath = req.file.path;
        const csvData = [];
        
        // Parse CSV file
        await new Promise((resolve, reject) => {
          fs.createReadStream(archivoPath)
            .pipe(csv())
            .on('data', (data) => csvData.push(data))
            .on('end', resolve)
            .on('error', reject);
        });

        // Generate business rules from CSV data
        aiResponse = await geminiService.generateBusinessRulesFromData(csvData, prompt_texto || '');
        
      } else {
        // Generate business rules from text prompt only
        aiResponse = await geminiService.generateBusinessRulesFromPrompt(prompt_texto);
      }

      // Insert into database with correct column names
      const result = await db.query(
        'INSERT INTO ReglaNegocio (id_usuario, status, resumen, archivo_original, regla_estandarizada) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          usuario_id,
          'Activa',
          descripcion || prompt_texto || 'Regla generada por IA',
          archivoPath,
          JSON.stringify(aiResponse)
        ]
      );

      // Update AI response rule IDs to match database ID
      if (aiResponse && aiResponse.rules) {
        const dbId = result.rows[0].id_regla;
        aiResponse.rules = aiResponse.rules.map((rule, index) => ({
          ...rule,
          id: `rule_${dbId}_${index + 1}`
        }));

        // Update the database with the corrected rule IDs
        await db.query(
          'UPDATE ReglaNegocio SET regla_estandarizada = $1 WHERE id_regla = $2',
          [JSON.stringify(aiResponse), dbId]
        );
      }

      res.status(201).json({
        message: 'Regla de negocio generada exitosamente con Gemini AI',
        regla: result.rows[0],
        ai_response: aiResponse
      });

    } catch (aiError) {
      console.error('Error with AI generation:', aiError);
      
      // If AI fails, still save the request but with error status
      const errorResponse = { 
        error: aiError.message,
        rules: [{
          id: `rule_error_${Date.now()}`,
          title: "Error en generación",
          description: "Hubo un error al generar la regla con IA",
          conditions: ["Error de conectividad"],
          actions: ["Reintentar generación"],
          priority: "high",
          category: "error"
        }]
      };

      const result = await db.query(
        'INSERT INTO ReglaNegocio (id_usuario, status, resumen, archivo_original, regla_estandarizada) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          usuario_id,
          'Inactiva',
          descripcion || prompt_texto || 'Regla con Error de IA',
          archivoPath,
          JSON.stringify(errorResponse)
        ]
      );

      // Update error rule ID to match database ID
      const dbId = result.rows[0].id_regla;
      errorResponse.rules[0].id = `rule_${dbId}_error`;
      
      await db.query(
        'UPDATE ReglaNegocio SET regla_estandarizada = $1 WHERE id_regla = $2',
        [JSON.stringify(errorResponse), dbId]
      );

      res.status(201).json({
        message: 'Regla guardada, pero hubo un error con la generación de IA',
        regla: result.rows[0],
        error: aiError.message
      });
    }

  } catch (error) {
    console.error('Error generating rule:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Get user's business rules
router.get('/user/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const result = await db.query(
      'SELECT * FROM ReglaNegocio WHERE id_usuario = $1 ORDER BY fecha_creacion DESC',
      [id_usuario]
    );

    res.json({
      message: 'Reglas obtenidas exitosamente',
      reglas: result.rows
    });

  } catch (error) {
    console.error('Error getting rules:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get recent movements for dashboard
router.get('/movements/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const result = await db.query(
      'SELECT id_regla, resumen, fecha_creacion, status FROM ReglaNegocio WHERE id_usuario = $1 ORDER BY fecha_creacion DESC LIMIT 5',
      [id_usuario]
    );

    // Format for dashboard display
    const movements = result.rows.map(row => ({
      id: row.id_regla,
      description: `Se creó la Regla ${row.id_regla} el día ${new Date(row.fecha_creacion).toLocaleDateString('es-ES')} a las ${new Date(row.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      status: row.status,
      fecha: row.fecha_creacion
    }));

    res.json({
      message: 'Movimientos obtenidos exitosamente',
      movements: movements
    });

  } catch (error) {
    console.error('Error getting movements:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Refine existing business rule with Gemini AI
router.post('/:id/refine', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ 
        error: 'Feedback es requerido para refinar la regla' 
      });
    }

    // Get existing rule
    const existingRule = await db.query(
      'SELECT * FROM ReglaNegocio WHERE id_regla = $1',
      [id]
    );

    if (existingRule.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla no encontrada' 
      });
    }

    const rule = existingRule.rows[0];
    const currentAIResponse = rule.regla_estandarizada;

    // Refine with Gemini AI
    const refinedResponse = await geminiService.refineBusinessRules(currentAIResponse, feedback);

    // Update rule in database
    const result = await db.query(
      'UPDATE ReglaNegocio SET regla_estandarizada = $1 WHERE id_regla = $2 RETURNING *',
      [JSON.stringify(refinedResponse), id]
    );

    res.json({
      message: 'Regla refinada exitosamente con Gemini AI',
      regla: result.rows[0],
      refined_response: refinedResponse
    });

  } catch (error) {
    console.error('Error refining rule:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Update rule status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Activa', 'Inactiva'].includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado debe ser "Activa" o "Inactiva"' 
      });
    }

    const result = await db.query(
      'UPDATE ReglaNegocio SET status = $1 WHERE id_regla = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla no encontrada' 
      });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      regla: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating rule status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;