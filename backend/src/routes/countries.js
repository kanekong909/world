import { getCountry, getAllCountries, createCountry, updateCountry, deleteCountry, getCountryPhotos, addCountryPhoto, deleteCountryPhoto, getStats } from '../controllers/countries.js'
import { authenticate, isAdmin } from '../middleware/auth.js'
import { Router } from 'express'

const router = Router()

router.get('/stats', getStats)
router.get('/', getAllCountries)
router.get('/:code', getCountry)
router.post('/', authenticate, isAdmin, createCountry)
router.put('/:code', authenticate, isAdmin, updateCountry)
router.delete('/:code', authenticate, isAdmin, deleteCountry)
router.get('/:code/photos', getCountryPhotos)
router.post('/:code/photos', authenticate, isAdmin, addCountryPhoto)
router.delete('/photos/:id', authenticate, isAdmin, deleteCountryPhoto)

export default router