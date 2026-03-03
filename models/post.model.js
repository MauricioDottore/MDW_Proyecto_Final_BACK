import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, default: 'https://via.placeholder.com/400x500' },
    category: { type: String, default: 'uncategorized' },
    price: { type: Number, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;