import { Router } from 'express'
import { getComments, addComment, getVotes, vote } from '../controllers/interactions.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/:code/comments', getComments)
router.post('/:code/comments', authenticate, addComment)
router.get('/:code/votes', getVotes)
router.post('/:code/votes', authenticate, vote)

export default router