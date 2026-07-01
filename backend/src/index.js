import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import countriesRouter from './routes/countries.js'
import authRouter from './routes/auth.js'
import favoritesRouter from './routes/favorites.js'
import interactionsRouter from './routes/interactions.js'
import worldcupRouter from './routes/worldcup.js'
import commentsRouter from './routes/comments.js'
import pool from './db.js'

dotenv.config()

const app = express()
// Header de seguridad
app.use(helmet())

// Rate limiting general - 100 requests por 15 minutos por IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos,
    max: 100, // Limite de 100 requests por IP
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.',
    standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
    legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limite de 10 requests por IP
    message: 'Demasiadas solicitudes de autenticación desde esta IP, por favor intente nuevamente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
})

const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Limite de 20 requests por IP
    message: 'Demasiadas solicitudes de comentarios desde esta IP, por favor intente nuevamente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
})

const PORT = process.env.PORT || 3000

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:4173'
    ].filter(Boolean)

    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

app.use((req, res, next) => {
    req.io = io
    next()
})

app.use('/api/countries', countriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/interactions', interactionsRouter)
app.use('/api/worldcup', worldcupRouter)
app.use('/api/comments', commentsRouter)
app.use(generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/comments', commentLimiter)

app.get('/', (req, res) => {
    res.json({ message: 'API Funcionando' })
})

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error conectando a la BD:', err);
    } else {
        console.log('DB Conectada ✅', res.rows[0].now);
    }
})

io.on('connection', (socket) => {
    socket.on('join_country', (code) => {
        socket.join(`country_${code}`)
    })
    socket.on('leave_country', (code) => {
        socket.leave(`country_${code}`)
    })
})

httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
})

