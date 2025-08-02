import mongoose, { Schema } from 'mongoose'

export interface ICategory extends mongoose.Document {
  name: string
  description: string
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<ICategory>('Category', categorySchema)
