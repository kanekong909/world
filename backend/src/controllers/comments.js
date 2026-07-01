import pool from '../db.js'

export const getComments = async (req, res) => {
  const { code } = req.params
  try {
    const result = await pool.query(
      `SELECT 
        c.id, c.content, c.image_url, c.created_at, c.parent_id,
        u.id as user_id, u.name as user_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'emoji', r.emoji,
              'count', r.count,
              'user_ids', r.user_ids
            )
          ) FILTER (WHERE r.emoji IS NOT NULL),
          '[]'
        ) as reactions
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN (
         SELECT comment_id, emoji, COUNT(*) as count,
                array_agg(user_id) as user_ids
         FROM comment_reactions
         GROUP BY comment_id, emoji
       ) r ON r.comment_id = c.id
       WHERE c.country_code = $1 AND c.parent_id IS NULL
       GROUP BY c.id, u.id, u.name
       ORDER BY c.created_at DESC`,
      [code.toUpperCase()]
    )

    const comments = await Promise.all(result.rows.map(async (comment) => {
      const replies = await pool.query(
        `SELECT 
          c.id, c.content, c.image_url, c.created_at, c.parent_id,
          u.id as user_id, u.name as user_name,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'emoji', r.emoji,
                'count', r.count,
                'user_ids', r.user_ids
              )
            ) FILTER (WHERE r.emoji IS NOT NULL),
            '[]'
          ) as reactions
         FROM comments c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN (
           SELECT comment_id, emoji, COUNT(*) as count,
                  array_agg(user_id) as user_ids
           FROM comment_reactions
           GROUP BY comment_id, emoji
         ) r ON r.comment_id = c.id
         WHERE c.parent_id = $1
         GROUP BY c.id, u.id, u.name
         ORDER BY c.created_at ASC`,
        [comment.id]
      )
      return { ...comment, replies: replies.rows }
    }))

    res.json(comments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const addComment = async (req, res) => {
  const { code } = req.params
  const { content, parent_id } = req.body
  const image_url = req.file?.path || null

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, country_code, content, image_url, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, content, image_url, created_at, parent_id`,
      [req.user.id, code.toUpperCase(), content, image_url, parent_id || null]
    )

    const comment = result.rows[0]

    const userResult = await pool.query('SELECT id, name FROM users WHERE id = $1', [req.user.id])
    const fullComment = {
      ...comment,
      user_id: userResult.rows[0].id,
      user_name: userResult.rows[0].name,
      reactions: [],
      replies: []
    }

    req.io.to(`country_${code.toUpperCase()}`).emit('new_comment', fullComment)

    res.status(201).json(fullComment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const deleteComment = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT user_id, country_code FROM comments WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comentario no encontrado' })
    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const code = result.rows[0].country_code
    await pool.query('DELETE FROM comments WHERE id = $1', [id])
    req.io.to(`country_${code}`).emit('delete_comment', { id: parseInt(id) })
    res.json({ message: 'Comentario eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const toggleReaction = async (req, res) => {
  const { id } = req.params
  const { emoji } = req.body

  try {
    const exists = await pool.query(
      'SELECT id FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND emoji = $3',
      [id, req.user.id, emoji]
    )

    if (exists.rows.length > 0) {
      await pool.query('DELETE FROM comment_reactions WHERE id = $1', [exists.rows[0].id])
    } else {
      await pool.query(
        'INSERT INTO comment_reactions (comment_id, user_id, emoji) VALUES ($1, $2, $3)',
        [id, req.user.id, emoji]
      )
    }

    const reactions = await pool.query(
      `SELECT emoji, COUNT(*) as count, array_agg(user_id) as user_ids
       FROM comment_reactions WHERE comment_id = $1
       GROUP BY emoji`,
      [id]
    )

    const commentResult = await pool.query('SELECT country_code FROM comments WHERE id = $1', [id])
    const code = commentResult.rows[0]?.country_code

    const payload = { comment_id: parseInt(id), reactions: reactions.rows }
    req.io.to(`country_${code}`).emit('update_reactions', payload)

    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

export const editComment = async (req, res) => {
  const { id } = req.params
  const { content } = req.body
  try {
    const result = await pool.query(
      'SELECT user_id, country_code FROM comments WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comentario no encontrado' })
    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const updated = await pool.query(
      'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [content, id]
    )

    const code = result.rows[0].country_code
    req.io.to(`country_${code}`).emit('edit_comment', { id: parseInt(id), content })

    res.json(updated.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
}