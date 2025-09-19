const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { correo, usuario, contrasenia, pais_region } = req.body;

    // Validate required fields
    if (!correo || !usuario || !contrasenia || !pais_region) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM Usuario WHERE correo = $1 OR usuario = $2',
      [correo, usuario]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'El usuario o correo ya existe' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

    // Insert new user
    const result = await db.query(
      'INSERT INTO Usuario (correo, usuario, contrasenia, pais_region) VALUES ($1, $2, $3, $4) RETURNING id_usuario, correo, usuario, pais_region, fecha_registro',
      [correo, usuario, hashedPassword, pais_region]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { usuario, contrasenia } = req.body;
    console.log('🔐 Login attempt:', { usuario, contrasenia: '***' });

    // Validate required fields
    if (!usuario || !contrasenia) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // Find user by username or email
    const result = await db.query(
      'SELECT * FROM Usuario WHERE usuario = $1 OR correo = $1',
      [usuario]
    );
    console.log('👤 User search result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(contrasenia, user.contrasenia);
    console.log('🔑 Password verification:', isValidPassword ? 'Valid' : 'Invalid');

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Remove password from response
    const { contrasenia: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;