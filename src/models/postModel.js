import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  publishedAt: { 
    type: Date, 
    default: Date.now 
  },
  category: { 
    type: String, 
    enum: ['Announcement', 'News', 'Update', 'Event'], 
    default: 'Announcement' 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: String 
  }]
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post; 