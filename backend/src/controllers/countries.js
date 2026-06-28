import pool from '../db.js'

export const getCountry = async (req, res) => {
  const { code } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM countries WHERE code = $1',
      [code.toUpperCase()]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'País no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const getAllCountries = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT code, name, flag_url, region FROM countries ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const createCountry = async (req, res) => {
  const {
    code, name, capital, population, area,
    region, subregion, languages, currency,
    flag_url, description, world_cup_info
  } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO countries 
        (code, name, capital, population, area, region, subregion, languages, currency, flag_url, description, world_cup_info)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [code, name, capital, population, area, region, subregion, languages, currency, flag_url, description, world_cup_info]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Este país ya existe' })
    }
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const updateCountry = async (req, res) => {
  const { code } = req.params
  const {
    name, capital, population, area,
    region, subregion, languages, currency,
    flag_url, description, world_cup_info
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE countries SET
        name=$1, capital=$2, population=$3, area=$4,
        region=$5, subregion=$6, languages=$7, currency=$8,
        flag_url=$9, description=$10, world_cup_info=$11,
        updated_at=NOW()
       WHERE code=$12 RETURNING *`,
      [name, capital, population, area, region, subregion, languages, currency, flag_url, description, world_cup_info, code.toUpperCase()]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'País no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteCountry = async (req, res) => {
  const { code } = req.params
  try {
    await pool.query('DELETE FROM countries WHERE code = $1', [code.toUpperCase()])
    res.json({ message: 'País eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

// FOTOS
export const getCountryPhotos = async (req, res) => {
  const { code } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM country_photos WHERE country_code = $1 ORDER BY created_at ASC',
      [code.toUpperCase()]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const addCountryPhoto = async (req, res) => {
  const { code } = req.params
  const { url, caption } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO country_photos (country_code, url, caption) VALUES ($1, $2, $3) RETURNING *',
      [code.toUpperCase(), url, caption]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteCountryPhoto = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM country_photos WHERE id = $1', [id])
    res.json({ message: 'Foto eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}