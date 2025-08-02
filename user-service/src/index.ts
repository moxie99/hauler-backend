import express, { Express } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import userRoutes from './routes/user.routes'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()
mongoose.set('debug', true)
const app: Express = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI_USER ||
  'mongodb://localhost:27017/haulage-user-service'
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('User Service: Connected to MongoDB'))
  .catch((err) => console.error('User Service: MongoDB connection error:', err))

// Mount routes
app.use('/api/users', userRoutes)

const PORT = 3001
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`))
