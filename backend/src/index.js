import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import countriesRouter from './routes/countries.js'
import authRouter from './routes/auth.js'
import pool from './db.js'
import favoritesRouter from './routes/favorites.js'
import interactionsRouter from './routes/interactions.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))
app.use(express.json())

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

app.use('/api/countries', countriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/interactions', interactionsRouter)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
})

