import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { register, login, getMyComments, updateAvatar, getMe } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../cloudinary.js'

const router = Router()

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }
  next()
}

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
]

const loginRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
]

router.post('/register', registerRules, handleValidation, register)
router.post('/login', loginRules, handleValidation, login)
router.get('/me', authenticate, getMe)
router.get('/me/comments', authenticate, getMyComments)
router.put('/me/avatar', authenticate, upload.single('avatar'), updateAvatar)

export default router