"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, index }) {
  const publishedDate = new Date(post.publishedAt);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${post.featured ? 'border-l-4 border-blue-500' : ''}`}
    >
      <div className="relative">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
          }}
        />
        {post.featured && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded">
          {post.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {post.description}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>By {post.author}</span>
          <span>{timeAgo}</span>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 