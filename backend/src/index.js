import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import countriesRouter from './routes/countries.js'
import authRouter from './routes/auth.js'
import favoritesRouter from './routes/favorites.js'
import interactionsRouter from './routes/interactions.js'
import worldcupRouter from './routes/worldcup.js'
import commentsRouter from './routes/comments.js'
import pool from './db.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
})

const PORT = process.env.PORT || 3000

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
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

