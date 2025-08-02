import express, { Express } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bookingRoutes from './routes/booking.routes'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

mongoose.set('debug', true)
const app: Express = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI_BOOKING ||
  'mongodb://localhost:27017/haulage-booking-service'
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Booking Service: Connected to MongoDB'))
  .catch((err) =>
    console.error('Booking Service: MongoDB connection error:', err)
  )

// Mount routes
app.use('/api/bookings', bookingRoutes)

const PORT = 3003
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`))
