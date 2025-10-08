require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const rulesRoutes = require('./routes/rules');
const aiRoutes = require('./routes/ai');
const reportsRoutes = require('./routes/reports');
const historialRoutes = require('./routes/historial');
const simulationRoutes = require('./routes/simulation');

// Import database connection
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Banorte Business Rules API is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/simulation', simulationRoutes);

// Health check route with database test
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK',
      message: 'Server and database are healthy',
      database_time: result.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});