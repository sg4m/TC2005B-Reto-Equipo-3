const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
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

// Generate business rule
router.post('/generate', upload.single('archivo'), async (req, res) => {
  try {
    const { id_usuario, resumen } = req.body;
    
    if (!id_usuario || !resumen) {
      return res.status(400).json({ 
        error: 'ID de usuario y resumen son requeridos' 
      });
    }

    // File path (if uploaded)
    const archivoOriginal = req.file ? req.file.path : null;

    // TODO: Here you'll integrate with AI service
    // For now, we'll create a mock response
    const mockAIResponse = {
      regla_id: Date.now(),
      condiciones: [
        {
          campo: "monto",
          operador: ">",
          valor: 10000
        }
      ],
      acciones: [
        {
          tipo: "alerta",
          mensaje: "Transacción de alto valor detectada"
        }
      ],
      generado_por: "AI_Mock",
      fecha_generacion: new Date().toISOString()
    };

    // Insert into database
    const result = await db.query(
      'INSERT INTO ReglaNegocio (id_usuario, status, resumen, archivo_original, regla_estandarizada) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_usuario, 'Activa', resumen, archivoOriginal, JSON.stringify(mockAIResponse)]
    );

    res.status(201).json({
      message: 'Regla de negocio generada exitosamente',
      regla: result.rows[0]
    });

  } catch (error) {
    console.error('Error generating rule:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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

// Update rule status
router.patch('/:id_regla/status', async (req, res) => {
  try {
    const { id_regla } = req.params;
    const { status } = req.body;

    if (!['Activa', 'Inactiva'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status debe ser "Activa" o "Inactiva"' 
      });
    }

    const result = await db.query(
      'UPDATE ReglaNegocio SET status = $1 WHERE id_regla = $2 RETURNING *',
      [status, id_regla]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Regla no encontrada' 
      });
    }

    res.json({
      message: 'Status actualizado exitosamente',
      regla: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating rule status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;