const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

console.log('🔍 Testing Supabase Database Connection...');
console.log('==================================');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('📡 Connecting to Supabase...');
    const client = await pool.connect();
    
    console.log('✅ Connected successfully!');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    
    // Test basic query
    console.log('\n🔍 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Server time: ${result.rows[0].current_time}`);
    
    // Test tables exist
    console.log('\n📊 Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuario', 'reglanegocio', 'simulacion_reglas')
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Test data counts
    console.log('\n📈 Data counts:');
    const userCount = await client.query('SELECT COUNT(*) as count FROM usuario');
    const ruleCount = await client.query('SELECT COUNT(*) as count FROM reglanegocio');
    const simCount = await client.query('SELECT COUNT(*) as count FROM simulacion_reglas');
    
    console.log(`  👥 usuarios: ${userCount.rows[0].count}`);
    console.log(`  📋 reglas: ${ruleCount.rows[0].count}`);
    console.log(`  🔬 simulaciones: ${simCount.rows[0].count}`);
    
    // Test sample data
    console.log('\n👤 Sample users:');
    const users = await client.query('SELECT id, nombre, correo FROM usuario LIMIT 5');
    users.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.nombre} (${user.correo})`);
    });
    
    client.release();
    console.log('\n🎉 All tests passed! Backend can connect to Supabase successfully.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();