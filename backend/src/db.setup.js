import pool from './db.js'

const setup = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code VARCHAR(3) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        capital VARCHAR(100),
        population BIGINT,
        area BIGINT,
        region VARCHAR(100),
        subregion VARCHAR(100),
        languages TEXT,
        currency VARCHAR(100),
        flag_url TEXT,
        description TEXT,
        world_cup_info TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✓ Tabla countries creada')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✓ Tabla users creada')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        country_code VARCHAR(3) REFERENCES countries(code) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, country_code)
      )
    `)
    console.log('✓ Tabla favorites creada')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        country_code VARCHAR(3) REFERENCES countries(code) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✓ Tabla comments creada')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        country_code VARCHAR(3) REFERENCES countries(code) ON DELETE CASCADE,
        value INTEGER CHECK (value IN (1, -1)),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, country_code)
      )
    `)
    console.log('✓ Tabla votes creada')

    console.log('\n✅ Base de datos lista')
    process.exit(0)
  } catch (err) {
    console.error('Error creando tablas:', err)
    process.exit(1)
  }
}

setup()