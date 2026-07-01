import pool from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashed]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' })
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getMyComments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, c.country_code, co.name as country_name
       FROM comments c
       LEFT JOIN countries co ON co.code = c.country_code
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const updateAvatar = async (req, res) => {
  try {
    const image_url = req.file?.path
    if (!image_url) return res.status(400).json({ error: 'No se subió imagen' })

    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, role, avatar_url',
      [image_url, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}