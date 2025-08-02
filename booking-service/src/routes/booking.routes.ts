import { Router } from 'express'
import { body } from 'express-validator'
import {
  createBooking,
  getBookings,
  assignDriver,
  updateBookingStatus,
} from '../controllers/booking.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'

const router = Router()

router.post(
  '/',
  authenticate,
  [
    body('loadDetails.items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('loadDetails.items.*.name')
      .notEmpty()
      .withMessage('Item name is required'),
    body('loadDetails.items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Item quantity must be a positive integer'),
    body('loadDetails.origin').notEmpty().withMessage('Origin is required'),
    body('loadDetails.destination')
      .notEmpty()
      .withMessage('Destination is required'),
  ],
  validateRequest,
  createBooking
)

router.get('/', authenticate, getBookings)

router.put(
  '/assign',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('driverId').notEmpty().withMessage('Driver ID is required'),
  ],
  validateRequest,
  assignDriver
)

router.put(
  '/status',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('status')
      .isIn(['pending', 'assigned', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  updateBookingStatus
)

export default router
