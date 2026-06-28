import pool from '../db.js'

export const getComments = async (req, res) => {
  const { code } = req.params
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.name as user_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.country_code = $1
       ORDER BY c.created_at DESC`,
      [code.toUpperCase()]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const addComment = async (req, res) => {
  const { code } = req.params
  const { content } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, country_code, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [req.user.id, code.toUpperCase(), content]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getVotes = async (req, res) => {
  const { code } = req.params
  try {
    const total = await pool.query(
      'SELECT COALESCE(SUM(value), 0) as total FROM votes WHERE country_code = $1',
      [code.toUpperCase()]
    )
    res.json({ total: parseInt(total.rows[0].total) })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const vote = async (req, res) => {
  const { code } = req.params
  const { value } = req.body

  if (![1, -1].includes(value)) {
    return res.status(400).json({ error: 'Voto inválido' })
  }

  try {
    const exists = await pool.query(
      'SELECT id, value FROM votes WHERE user_id = $1 AND country_code = $2',
      [req.user.id, code.toUpperCase()]
    )

    if (exists.rows.length > 0) {
      if (exists.rows[0].value === value) {
        await pool.query(
          'DELETE FROM votes WHERE user_id = $1 AND country_code = $2',
          [req.user.id, code.toUpperCase()]
        )
        return res.json({ action: 'removed' })
      }
      await pool.query(
        'UPDATE votes SET value = $1 WHERE user_id = $2 AND country_code = $3',
        [value, req.user.id, code.toUpperCase()]
      )
      return res.json({ action: 'updated' })
    }

    await pool.query(
      'INSERT INTO votes (user_id, country_code, value) VALUES ($1, $2, $3)',
      [req.user.id, code.toUpperCase(), value]
    )
    res.json({ action: 'added' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}