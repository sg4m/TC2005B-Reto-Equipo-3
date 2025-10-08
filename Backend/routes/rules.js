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
    let userInput = '';

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

        // Store user input (combination of text prompt and file info)
        userInput = prompt_texto ? 
          `${prompt_texto} (Archivo: ${req.file.originalname})` : 
          `Análisis de datos del archivo: ${req.file.originalname}`;

        // Generate business rules from CSV data
        aiResponse = await geminiService.generateBusinessRulesFromData(csvData, prompt_texto || '');
        
      } else {
        // Store user input (text prompt only)
        userInput = prompt_texto;
        
        // Generate business rules from text prompt only
        aiResponse = await geminiService.generateBusinessRulesFromPrompt(prompt_texto);
      }

      // Generate AI summary from the complete business rules
      const aiSummary = await geminiService.generateSummaryFromRules(aiResponse);

      // Insert into database with new structure:
      // - input_usuario: original user input
      // - resumen: AI-generated summary  
      // - regla_estandarizada: complete JSON structure
      const result = await db.query(
        'INSERT INTO reglanegocio (usuario_id, status, input_usuario, resumen, archivo_original, regla_estandarizada) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          usuario_id,
          'Activa',
          userInput,                    // User's original input
          aiSummary,                    // AI-generated summary
          archivoPath,                  // File path if applicable
          JSON.stringify(aiResponse)    // Complete JSON structure
        ]
      );

      // Update AI response rule IDs to match database ID
      if (aiResponse && aiResponse.rules) {
        const dbId = result.rows[0].id;
        aiResponse.rules = aiResponse.rules.map((rule, index) => ({
          ...rule,
          id: `rule_${dbId}_${index + 1}`
        }));

        // Update the database with the corrected rule IDs
        await db.query(
          'UPDATE reglanegocio SET regla_estandarizada = $1 WHERE id = $2',
          [JSON.stringify(aiResponse), dbId]
        );
      }

      res.status(201).json({
        message: 'Regla de negocio generada exitosamente con Gemini AI',
        regla: {
          ...result.rows[0],
          regla_estandarizada: aiResponse // Return parsed JSON instead of string
        },
        ai_response: aiResponse
      });

    } catch (aiError) {
      console.error('Error with AI generation:', aiError);
      
      // Store user input even if AI fails
      userInput = req.file ? 
        `${prompt_texto || ''} (Archivo: ${req.file.originalname})`.trim() : 
        (prompt_texto || 'Solicitud de regla de negocio');
      
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
        }],
        summary: "Error en la generación de reglas de negocio"
      };

      const result = await db.query(
        'INSERT INTO reglanegocio (usuario_id, status, input_usuario, resumen, archivo_original, regla_estandarizada) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          usuario_id,
          'Inactiva',
          userInput,                               // User's original input
          'Error en generación de regla de IA',    // Error message as summary
          archivoPath,                             // File path if applicable
          JSON.stringify(errorResponse)            // Error response as JSON
        ]
      );

      // Update error rule ID to match database ID
      const dbId = result.rows[0].id;
      errorResponse.rules[0].id = `rule_${dbId}_error`;
      
      await db.query(
        'UPDATE reglanegocio SET regla_estandarizada = $1 WHERE id = $2',
        [JSON.stringify(errorResponse), dbId]
      );

      res.status(201).json({
        message: 'Regla guardada, pero hubo un error con la generación de IA',
        regla: {
          ...result.rows[0],
          regla_estandarizada: errorResponse
        },
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
      'SELECT * FROM reglanegocio WHERE usuario_id = $1 ORDER BY fecha_creacion DESC',
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
      'SELECT id, resumen, fecha_creacion, status FROM reglanegocio WHERE usuario_id = $1 ORDER BY fecha_creacion DESC LIMIT 5',
      [id_usuario]
    );

    // Format for dashboard display
    const movements = result.rows.map(row => ({
      id: row.id,
      description: `Se creó la Regla ${row.id} el día ${new Date(row.fecha_creacion).toLocaleDateString('es-ES')} a las ${new Date(row.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
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
      'SELECT * FROM reglanegocio WHERE id = $1',
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
      'UPDATE reglanegocio SET regla_estandarizada = $1 WHERE id = $2 RETURNING *',
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
      'UPDATE reglanegocio SET status = $1 WHERE id = $2 RETURNING *',
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

// Get all rules for the Reglas management page
router.get('/list', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        status,
        fecha_creacion,
        input_usuario,
        resumen,
        archivo_original,
        regla_estandarizada
      FROM reglanegocio
      ORDER BY fecha_creacion DESC
    `;
    
    const result = await db.query(query);
    
    // Format data for frontend consumption
    const rulesData = result.rows.map(row => {
      const metadata = row.regla_estandarizada?.metadata || {};
      
      return {
        id_regla: row.id,
        usuario: metadata.usuario || 'Usuario Sistema',
        email: metadata.email || 'sistema@banorte.com',
        empresa: metadata.empresa || 'Banorte',
        fecha_creacion: row.fecha_creacion,
        status: row.status || 'N/A',
        descripcion: row.resumen || row.input_usuario || 'Sin descripción',
        // Format ID for display
        id_display: `REG-${String(row.id).padStart(4, '0')}`,
        // Include additional metadata fields if they exist
        monto_minimo: metadata.monto_minimo,
        monto_maximo: metadata.monto_maximo,
        region: metadata.region,
        tipo_transaccion: metadata.tipo_transaccion
      };
    });

    res.json(rulesData);
  } catch (error) {
    console.error('Error fetching rules list:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Update business rule data
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      usuario,
      email,
      empresa,
      status,
      descripcion,
      monto_minimo,
      monto_maximo,
      region,
      tipo_transaccion
    } = req.body;

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    // Map frontend fields to database fields
    if (status !== undefined) {
      updateFields.push(`status = $${valueIndex++}`);
      values.push(status);
    }
    
    if (descripcion !== undefined) {
      updateFields.push(`resumen = $${valueIndex++}`);
      values.push(descripcion);
    }

    // Additional fields - these might need to be added to the database schema
    // For now, we'll update the existing JSON structure in regla_estandarizada
    if (usuario !== undefined || email !== undefined || empresa !== undefined ||
        monto_minimo !== undefined || monto_maximo !== undefined ||
        region !== undefined || tipo_transaccion !== undefined) {
      
      // Get current rule data
      const currentRule = await db.query(
        'SELECT regla_estandarizada FROM reglanegocio WHERE id = $1',
        [id]
      );

      if (currentRule.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Regla no encontrada' 
        });
      }

      // Update the JSON structure with additional metadata
      let ruleData = currentRule.rows[0].regla_estandarizada || {};
      
      // Add metadata section if it doesn't exist
      if (!ruleData.metadata) {
        ruleData.metadata = {};
      }

      // Update metadata fields
      if (usuario !== undefined) ruleData.metadata.usuario = usuario;
      if (email !== undefined) ruleData.metadata.email = email;
      if (empresa !== undefined) ruleData.metadata.empresa = empresa;
      if (monto_minimo !== undefined) ruleData.metadata.monto_minimo = monto_minimo;
      if (monto_maximo !== undefined) ruleData.metadata.monto_maximo = monto_maximo;
      if (region !== undefined) ruleData.metadata.region = region;
      if (tipo_transaccion !== undefined) ruleData.metadata.tipo_transaccion = tipo_transaccion;

      updateFields.push(`regla_estandarizada = $${valueIndex++}`);
      values.push(JSON.stringify(ruleData));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No hay campos para actualizar' 
      });
    }

    // Add the ID parameter at the end
    values.push(id);
    const idIndex = valueIndex;

    const query = `
      UPDATE reglanegocio 
      SET ${updateFields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $${idIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla no encontrada' 
      });
    }

    // Format the response similar to the list endpoint
    const updatedRule = result.rows[0];
    const formattedRule = {
      id_regla: updatedRule.id,
      usuario: updatedRule.regla_estandarizada?.metadata?.usuario || 'Usuario Sistema',
      email: updatedRule.regla_estandarizada?.metadata?.email || 'sistema@banorte.com',
      empresa: updatedRule.regla_estandarizada?.metadata?.empresa || 'Banorte',
      fecha_creacion: updatedRule.fecha_creacion,
      status: updatedRule.status || 'N/A',
      descripcion: updatedRule.resumen || updatedRule.input_usuario || 'Sin descripción',
      id_display: `REG-${String(updatedRule.id).padStart(4, '0')}`,
      // Include additional metadata fields if they exist
      monto_minimo: updatedRule.regla_estandarizada?.metadata?.monto_minimo,
      monto_maximo: updatedRule.regla_estandarizada?.metadata?.monto_maximo,
      region: updatedRule.regla_estandarizada?.metadata?.region,
      tipo_transaccion: updatedRule.regla_estandarizada?.metadata?.tipo_transaccion
    };

    res.json({
      message: 'Regla actualizada exitosamente',
      regla: formattedRule
    });

  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Delete business rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the rule exists
    const existingRule = await db.query(
      'SELECT * FROM reglanegocio WHERE id = $1',
      [id]
    );

    if (existingRule.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla no encontrada' 
      });
    }

    const rule = existingRule.rows[0];

    // Delete any associated file if it exists
    if (rule.archivo_original) {
      try {
        const fs = require('fs');
        if (fs.existsSync(rule.archivo_original)) {
          fs.unlinkSync(rule.archivo_original);
          console.log(`Deleted file: ${rule.archivo_original}`);
        }
      } catch (fileError) {
        console.error('Error deleting associated file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the rule from the database
    const result = await db.query(
      'DELETE FROM reglanegocio WHERE id = $1 RETURNING *',
      [id]
    );

    // Format the deleted rule info for response
    const deletedRule = result.rows[0];
    const formattedRule = {
      id_regla: deletedRule.id,
      id_display: `REG-${String(deletedRule.id).padStart(4, '0')}`,
      usuario: deletedRule.regla_estandarizada?.metadata?.usuario || 'Usuario Sistema',
      empresa: deletedRule.regla_estandarizada?.metadata?.empresa || 'Banorte',
      descripcion: deletedRule.resumen || deletedRule.input_usuario || 'Sin descripción'
    };

    res.json({
      message: 'Regla eliminada exitosamente',
      regla_eliminada: formattedRule
    });

  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

module.exports = router;