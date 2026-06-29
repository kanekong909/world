import { Router } from 'express'
import { getGroups, getMatches, createGroup, createTeam, createMatch, updateMatch, deleteGroup, deleteMatch, deleteTeam, getPredictions, getMyPrediction, savePrediction } from '../controllers/worldcup.js'
import { authenticate, isAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/groups', getGroups)
router.get('/matches', getMatches)
router.post('/groups', authenticate, isAdmin, createGroup)
router.post('/teams', authenticate, isAdmin, createTeam)
router.post('/matches', authenticate, isAdmin, createMatch)
router.put('/matches/:id', authenticate, isAdmin, updateMatch)
router.delete('/groups/:id', authenticate, isAdmin, deleteGroup)
router.delete('/matches/:id', authenticate, isAdmin, deleteMatch)
router.delete('/teams/:id', authenticate, isAdmin, deleteTeam)
router.get('/predictions', getPredictions)
router.get('/predictions/me', authenticate, getMyPrediction)
router.post('/predictions', authenticate, savePrediction)

export default router