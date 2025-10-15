const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');
const geminiService = require('../services/geminiService');
const router = express.Router();

// Configure multer for simulation file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/simulation/'); // Create this folder for simulation files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'simulation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation for simulation
const fileFilter = (req, file, cb) => {
  // Accept CSV, JSON, and TXT files
  const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
  const allowedExtensions = ['.csv', '.json', '.txt'];
  
  const hasValidType = allowedTypes.includes(file.mimetype);
  const hasValidExtension = allowedExtensions.some(ext => 
    file.originalname.toLowerCase().endsWith(ext)
  );
  
  if (hasValidType || hasValidExtension) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos CSV, JSON o TXT'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Simulate rule with text input
router.post('/text', async (req, res) => {
  try {
    const { rule_id, test_data } = req.body;
    
    if (!rule_id || !test_data) {
      return res.status(400).json({ 
        error: 'rule_id y test_data son requeridos' 
      });
    }

    // Get the business rule from database
    const ruleResult = await db.query(
      'SELECT * FROM reglanegocio WHERE id = $1',
      [rule_id]
    );

    if (ruleResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla de negocio no encontrada' 
      });
    }

    const rule = ruleResult.rows[0];

    // Normalize test_data: allow either plain text or JSON input
    let parsedTestData = test_data;
    if (typeof test_data === 'string') {
      const trimmed = test_data.trim();
      // Heuristic: if it looks like JSON (starts with { or [), try parse
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedTestData = JSON.parse(trimmed);
        } catch (e) {
          // Not valid JSON, keep as plain text
          parsedTestData = test_data;
        }
      }
    }

    // Prepare simulation context for Gemini AI
    const simulationContext = {
      rule: {
        id: rule.id,
        description: rule.resumen || rule.input_usuario,
        status: rule.status,
        details: rule.regla_estandarizada
      },
      testData: parsedTestData,
      inputType: 'text'
    };

    // Call Gemini AI for simulation analysis
    const aiResponse = await geminiService.simulateBusinessRule(simulationContext);

    // Store simulation result in database
    const simulationResult = await db.query(
      'INSERT INTO simulacion_reglas (regla_id, tipo_entrada, datos_entrada, resultado_ia, fecha_simulacion) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [
        rule_id,
        'text',
        // Store as JSON text if parsedTestData is an object/array, otherwise store raw string
        typeof parsedTestData === 'string' ? parsedTestData : JSON.stringify(parsedTestData),
        JSON.stringify(aiResponse)
      ]
    );

    res.status(201).json({
      message: 'Simulación completada exitosamente',
      simulation_id: simulationResult.rows[0].id,
      rule: {
        id: rule.id,
        description: rule.resumen
      },
      analysis: aiResponse.analysis || 'Análisis completado',
      results: aiResponse.results || {},
      recommendations: aiResponse.recommendations || 'No hay recomendaciones adicionales'
    });

  } catch (error) {
    console.error('Error in text simulation:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
});

// Simulate rule with file upload
router.post('/file', upload.single('test_file'), async (req, res) => {
  try {
    const { rule_id } = req.body;
    
    if (!rule_id || !req.file) {
      return res.status(400).json({ 
        error: 'rule_id y archivo son requeridos' 
      });
    }

    // Get the business rule from database
    const ruleResult = await db.query(
      'SELECT * FROM reglanegocio WHERE id = $1',
      [rule_id]
    );

    if (ruleResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla de negocio no encontrada' 
      });
    }

    const rule = ruleResult.rows[0];

    // Process uploaded file based on type
    let fileData;
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    try {
      if (fileExtension === '.json') {
        // Parse JSON file
        const jsonContent = fs.readFileSync(filePath, 'utf8');
        fileData = JSON.parse(jsonContent);
      } else if (fileExtension === '.csv') {
        // Parse CSV file
        fileData = [];
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => fileData.push(data))
            .on('end', resolve)
            .on('error', reject);
        });
      } else {
        // Plain text file
        fileData = fs.readFileSync(filePath, 'utf8');
      }
    } catch (fileError) {
      return res.status(400).json({
        error: 'Error al procesar el archivo: ' + fileError.message
      });
    } finally {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Prepare simulation context for Gemini AI
    const simulationContext = {
      rule: {
        id: rule.id,
        description: rule.resumen || rule.input_usuario,
        status: rule.status,
        details: rule.regla_estandarizada
      },
      testData: fileData,
      inputType: 'file',
      fileName: req.file.originalname,
      fileType: fileExtension
    };

    // Call Gemini AI for simulation analysis
    const aiResponse = await geminiService.simulateBusinessRule(simulationContext);

    // Store simulation result in database
    const simulationResult = await db.query(
      'INSERT INTO simulacion_reglas (regla_id, tipo_entrada, datos_entrada, archivo_original, resultado_ia, fecha_simulacion) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [
        rule_id,
        'file',
        JSON.stringify(fileData),
        req.file.originalname,
        JSON.stringify(aiResponse)
      ]
    );

    res.status(201).json({
      message: 'Simulación con archivo completada exitosamente',
      simulation_id: simulationResult.rows[0].id,
      rule: {
        id: rule.id,
        description: rule.resumen
      },
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: fileExtension
      },
      analysis: aiResponse.analysis || 'Análisis completado',
      results: aiResponse.results || {},
      recommendations: aiResponse.recommendations || 'No hay recomendaciones adicionales'
    });

  } catch (error) {
    console.error('Error in file simulation:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
});

// Get simulation history for a rule
router.get('/history/:rule_id', async (req, res) => {
  try {
    const { rule_id } = req.params;

    const result = await db.query(
      'SELECT id, tipo_entrada, archivo_original, fecha_simulacion, resultado_ia FROM simulacion_reglas WHERE regla_id = $1 ORDER BY fecha_simulacion DESC LIMIT 20',
      [rule_id]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      type: row.tipo_entrada,
      file_name: row.archivo_original,
      date: row.fecha_simulacion,
      summary: row.resultado_ia?.analysis ? 
        row.resultado_ia.analysis.substring(0, 100) + '...' : 
        'Simulación completada'
    }));

    res.json({
      message: 'Historial obtenido exitosamente',
      rule_id: rule_id,
      simulations: history
    });

  } catch (error) {
    console.error('Error getting simulation history:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

// Get simulation details
router.get('/details/:simulation_id', async (req, res) => {
  try {
    const { simulation_id } = req.params;

    const result = await db.query(
      'SELECT * FROM simulacion_reglas WHERE id = $1',
      [simulation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Simulación no encontrada' 
      });
    }

    const simulation = result.rows[0];

    res.json({
      message: 'Detalles obtenidos exitosamente',
      simulation: {
        id: simulation.id,
        rule_id: simulation.regla_id,
        input_type: simulation.tipo_entrada,
        input_data: simulation.datos_entrada,
        file_name: simulation.archivo_original,
        date: simulation.fecha_simulacion,
        results: simulation.resultado_ia
      }
    });

  } catch (error) {
    console.error('Error getting simulation details:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

// Save simulation result (used when frontend obtains AI response separately)
router.post('/save', async (req, res) => {
  try {
    const { rule_id, input_type, input_data, file_name, ai_response } = req.body;

    if (!rule_id || !input_type || ai_response === undefined) {
      return res.status(400).json({ error: 'rule_id, input_type y ai_response son requeridos' });
    }

    const result = await db.query(
      'INSERT INTO simulacion_reglas (regla_id, tipo_entrada, datos_entrada, archivo_original, resultado_ia, fecha_simulacion) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [
        rule_id,
        input_type,
        input_data ? (typeof input_data === 'string' ? input_data : JSON.stringify(input_data)) : null,
        file_name || null,
        JSON.stringify(ai_response)
      ]
    );

    res.status(201).json({
      message: 'Simulación guardada exitosamente',
      simulation_id: result.rows[0].id,
      simulation: result.rows[0]
    });
  } catch (error) {
    console.error('[save simulation] Error:', error);
    res.status(500).json({ error: 'Error interno al guardar la simulación: ' + error.message });
  }
});

module.exports = router;