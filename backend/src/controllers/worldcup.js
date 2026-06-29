import pool from '../db.js'

export const getGroups = async (req, res) => {
  try {
    const groups = await pool.query('SELECT * FROM wc_groups ORDER BY name ASC')
    const teams = await pool.query('SELECT * FROM wc_teams ORDER BY points DESC, (goals_for - goals_against) DESC')

    const result = groups.rows.map(g => ({
      ...g,
      teams: teams.rows.filter(t => t.group_id === g.id)
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getMatches = async (req, res) => {
  try {
    const { stage } = req.query
    let query = 'SELECT * FROM wc_matches'
    const params = []
    if (stage) {
      query += ' WHERE stage = $1'
      params.push(stage)
    }
    query += ' ORDER BY match_date ASC'
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const createGroup = async (req, res) => {
  const { name } = req.body
  try {
    const result = await pool.query('INSERT INTO wc_groups (name) VALUES ($1) RETURNING *', [name])
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const createTeam = async (req, res) => {
  const { group_id, country_code, country_name, flag_url } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO wc_teams (group_id, country_code, country_name, flag_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_id, country_code, country_name, flag_url]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const createMatch = async (req, res) => {
  const { group_id, stage, home_team, away_team, home_flag, away_flag, match_date, venue } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO wc_matches (group_id, stage, home_team, away_team, home_flag, away_flag, match_date, venue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [group_id, stage, home_team, away_team, home_flag, away_flag, match_date, venue]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const updateMatch = async (req, res) => {
  const { id } = req.params
  const { home_score, away_score, status } = req.body
  try {
    const result = await pool.query(
      'UPDATE wc_matches SET home_score=$1, away_score=$2, status=$3 WHERE id=$4 RETURNING *',
      [home_score, away_score, status, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteGroup = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM wc_groups WHERE id = $1', [id])
    res.json({ message: 'Grupo eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteMatch = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM wc_matches WHERE id = $1', [id])
    res.json({ message: 'Partido eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteTeam = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM wc_teams WHERE id = $1', [id])
    res.json({ message: 'Equipo eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

// Predicciones
export const getPredictions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.predicted_winner, p.predicted_winner_flag, p.predicted_winner_code,
              COUNT(*) as total, 
              MAX(u.name) as latest_user
       FROM wc_predictions p
       JOIN users u ON u.id = p.user_id
       GROUP BY p.predicted_winner, p.predicted_winner_flag, p.predicted_winner_code
       ORDER BY total DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getMyPrediction = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM wc_predictions WHERE user_id = $1',
      [req.user.id]
    )
    res.json(result.rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const savePrediction = async (req, res) => {
  const { predicted_winner, predicted_winner_flag, predicted_winner_code } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO wc_predictions (user_id, predicted_winner, predicted_winner_flag, predicted_winner_code)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         predicted_winner = $2,
         predicted_winner_flag = $3,
         predicted_winner_code = $4,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, predicted_winner, predicted_winner_flag, predicted_winner_code]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}