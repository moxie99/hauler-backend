import { Response } from 'express'
import axios from 'axios'
import Booking, { IBooking } from '../models/booking.model'
import { AuthRequest } from '../middleware/auth.middleware'

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'user') {
      return res.status(403).json({ error: 'Only users can create bookings' })
    }
    const { loadDetails } = req.body
    const booking = new Booking({ userId: req.userId, loadDetails })
    await booking.save()
    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error creating booking' })
  }
}

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    let bookings
    if (req.role === 'user') {
      bookings = await Booking.find({ userId: req.userId })
    } else if (req.role === 'driver') {
      bookings = await Booking.find({ driverId: req.userId })
    } else if (req.role === 'admin') {
      bookings = await Booking.find()
    } else {
      return res.status(403).json({ error: 'Unauthorized to view bookings' })
    }
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching bookings' })
  }
}

export const assignDriver = async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign drivers' })
    }
    const { bookingId, driverId } = req.body
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    // Verify driver exists and is approved
    const driverResponse = await axios
      .get('http://localhost:3002/api/drivers/profile', {
        headers: { Authorization: req.header('Authorization') },
        params: { driverId },
      })
      .catch(() => null)
    if (!driverResponse || !driverResponse.data) {
      return res.status(404).json({ error: 'Driver not found' })
    }
    const driver = driverResponse.data
    if (driver.status !== 'approved') {
      return res.status(400).json({ error: 'Driver is not approved' })
    }
    booking.driverId = driverId
    booking.status = 'assigned'
    await booking.save()
    res.json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error assigning driver' })
  }
}

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, status } = req.body
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    if (
      req.role === 'driver' &&
      !['in-progress', 'completed'].includes(status)
    ) {
      return res
        .status(403)
        .json({ error: 'Drivers can only set in-progress or completed status' })
    }
    if (
      req.role === 'admin' ||
      (req.role === 'driver' && booking.driverId === req.userId)
    ) {
      booking.status = status
      await booking.save()
      res.json(booking)
    } else {
      return res
        .status(403)
        .json({ error: 'Unauthorized to update booking status' })
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error updating booking status' })
  }
}
