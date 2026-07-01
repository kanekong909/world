import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { getCountry, getAllCountries, createCountry, updateCountry, deleteCountry, getCountryPhotos, addCountryPhoto, deleteCountryPhoto, getStats } from '../controllers/countries.js'
import { authenticate, isAdmin } from '../middleware/auth.js'

const router = Router()

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }
  next()
}

const countryRules = [
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 3 }).withMessage('Código inválido')
    .toUpperCase(),
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Nombre demasiado largo'),
  body('population')
    .optional()
    .isInt({ min: 0 }).withMessage('Población inválida'),
  body('area')
    .optional()
    .isInt({ min: 0 }).withMessage('Área inválida'),
  body('flag_url')
    .optional()
    .isURL().withMessage('URL de bandera inválida'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Descripción demasiado larga')
]

router.get('/stats', getStats)
router.get('/', getAllCountries)
router.get('/:code', getCountry)
router.post('/', authenticate, isAdmin, countryRules, handleValidation, createCountry)
router.put('/:code', authenticate, isAdmin, countryRules, handleValidation, updateCountry)
router.delete('/:code', authenticate, isAdmin, deleteCountry)
router.get('/:code/photos', getCountryPhotos)
router.post('/:code/photos', authenticate, isAdmin, addCountryPhoto)
router.delete('/photos/:id', authenticate, isAdmin, deleteCountryPhoto)

export default router