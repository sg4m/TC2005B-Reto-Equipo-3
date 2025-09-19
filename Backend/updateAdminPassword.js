require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/database');

async function updateAdminPassword() {
  try {
    // Hash the password 'admin' with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);
    
    console.log('Original password: admin');
    console.log('Hashed password:', hashedPassword);
    
    // Update the admin user with the hashed password
    const result = await db.query(
      'UPDATE Usuario SET contrasenia = $1 WHERE usuario = $2 RETURNING *',
      [hashedPassword, 'admin']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('Updated user:', {
        id_usuario: result.rows[0].id_usuario,
        usuario: result.rows[0].usuario,
        correo: result.rows[0].correo,
        pais_region: result.rows[0].pais_region
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();