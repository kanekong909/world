import { Router } from 'express'
import { getFavorites, toggleFavorite, checkFavorite } from '../controllers/favorites.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getFavorites)
router.get('/:code', authenticate, checkFavorite)
router.post('/:code', authenticate, toggleFavorite)

export default router