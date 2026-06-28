import pool from '../db.js'

export const getFavorites = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.code, c.name, c.flag_url, c.region 
       FROM favorites f
       JOIN countries c ON c.code = f.country_code
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const toggleFavorite = async (req, res) => {
  const { code } = req.params
  try {
    const exists = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND country_code = $2',
      [req.user.id, code.toUpperCase()]
    )

    if (exists.rows.length > 0) {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND country_code = $2',
        [req.user.id, code.toUpperCase()]
      )
      res.json({ favorited: false })
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, country_code) VALUES ($1, $2)',
        [req.user.id, code.toUpperCase()]
      )
      res.json({ favorited: true })
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const checkFavorite = async (req, res) => {
  const { code } = req.params
  try {
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND country_code = $2',
      [req.user.id, code.toUpperCase()]
    )
    res.json({ favorited: result.rows.length > 0 })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}