import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'

const router = Router()

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
  validateRequest,
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
)

router.get('/profile', authenticate, getProfile)

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone')
      .optional()
      .notEmpty()
      .withMessage('Phone number cannot be empty'),
  ],
  validateRequest,
  updateProfile
)

export default router
