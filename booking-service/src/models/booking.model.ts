import mongoose, { Schema, Document } from 'mongoose'

export interface IBooking extends Document {
  userId: string
  driverId?: string
  loadDetails: {
    items: { name: string; quantity: number }[]
    origin: string
    destination: string
  }
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  createdAt: Date
}

const bookingSchema: Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  driverId: { type: String },
  loadDetails: {
    items: [{ name: String, quantity: Number }],
    origin: { type: String, required: true },
    destination: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IBooking>('Booking', bookingSchema)
