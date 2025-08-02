import { Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/user.model'
import { AuthRequest } from '../middleware/auth.middleware'

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 8)
    const user = new User({ name, email, password: hashedPassword, phone })
    await user.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error during user registration' })
  }
}

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid password' })
    }
    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    )
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login' })
  }
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching profile' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error updating profile' })
  }
}
