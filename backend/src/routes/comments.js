import { Router } from 'express'
import { getComments, addComment, deleteComment, toggleReaction, editComment } from '../controllers/comments.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../cloudinary.js'

const router = Router()

router.get('/:code', getComments)
router.post('/:code', authenticate, upload.single('image'), addComment)
router.delete('/:id', authenticate, deleteComment)
router.post('/:id/reactions', authenticate, toggleReaction)
router.put('/:id', authenticate, editComment)

export default router