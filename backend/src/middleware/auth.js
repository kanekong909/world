import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: 'No autorizado' })

    const token = header.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' })
    }
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}