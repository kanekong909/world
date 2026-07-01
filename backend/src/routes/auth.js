import { Router } from 'express'
import { register, login, getMyComments, updateAvatar, getMe } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../cloudinary.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me/comments', authenticate, getMyComments)
router.get('/me', authenticate, getMe)
router.put('/me/avatar', authenticate, upload.single('avatar'), updateAvatar)

export default router