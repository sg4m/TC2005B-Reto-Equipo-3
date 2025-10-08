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
      'SELECT * FROM usuario WHERE correo = $1 OR nombre = $2',
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
      'INSERT INTO usuario (correo, nombre, contraseña, pais_region) VALUES ($1, $2, $3, $4) RETURNING id, correo, nombre, pais_region, fecha_creacion',
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
    // Debugging: log raw body to detect missing fields or parsing issues
    console.log('Login attempt (received body):', req.body);
    console.log('Parsed fields:', { usuario, contrasenia: contrasenia ? '***' : contrasenia });

    // Validate required fields
    if (!usuario || !contrasenia) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // Find user by username or email
    const result = await db.query(
      'SELECT * FROM usuario WHERE nombre = $1 OR correo = $1',
      [usuario]
    );
    console.log('User search result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      console.log('User not found in database');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(contrasenia, user.contraseña);
    console.log('Password verification:', isValidPassword ? 'Valid' : 'Invalid');

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Remove password from response
    const { contraseña: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Forgot password - Reset to "password123" (simplified version)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  try {
    // Check if user exists with this email
    const userResult = await db.query(
      'SELECT id, nombre FROM usuario WHERE correo = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró una cuenta con ese correo electrónico' 
      });
    }

    const user = userResult.rows[0];
    
    // Hash the temporary password "password123"
    const tempPassword = 'password123';
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    // Update user's password in database
    await db.query(
      'UPDATE usuario SET contraseña = $1 WHERE id = $2',
      [hashedTempPassword, user.id]
    );
    
    console.log(`Password reset for user: ${user.nombre} (${email})`);
    
    res.status(200).json({ 
      message: 'Contraseña restablecida exitosamente',
      tempPassword: tempPassword
    });
    
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Change password for logged-in user
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'ID de usuario, contraseña actual y nueva contraseña son requeridos' 
    });
  }

  // Basic password validation
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      error: 'La nueva contraseña debe tener al menos 8 caracteres' 
    });
  }

  try {
    // Get user from database
    const userResult = await db.query(
      'SELECT id, nombre, contraseña FROM usuario WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    const user = userResult.rows[0];
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.contraseña);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'La contraseña actual es incorrecta' 
      });
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password in database
    const updateResult = await db.query(
      'UPDATE usuario SET contraseña = $1 WHERE id = $2 RETURNING id',
      [hashedNewPassword, userId]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ 
        error: 'No se pudo actualizar la contraseña' 
      });
    }
    
    console.log(`Password changed for user: ${user.nombre} (ID: ${userId})`);
    
    res.status(200).json({ 
      message: 'Contraseña cambiada exitosamente',
      success: true
    });
    
  } catch (error) {
    console.error('Error in change password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;