import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  createdAt: Date
}

const userSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IUser>('User', userSchema)
