"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Announcement', 'News', 'Update', 'Event'];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // Create URL with category filter if not 'All'
      let url = '/api/posts?limit=20';
      if (activeCategory !== 'All') {
        url += `&category=${activeCategory}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }

      // Split posts into featured and regular
      const featured = data.posts.filter(post => post.featured);
      const regular = data.posts.filter(post => !post.featured);
      
      setFeaturedPosts(featured);
      setPosts(regular);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-2xl font-bold">Welcome{session ? `, ${session.user.name}` : ''}!</h1>
        
        {session?.user?.role === 'admin' && (
          <Link
            href="/admin-dashboard/create-post"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Post
          </Link>
        )}
      </motion.div>
      
      {/* Category filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          />
        </div>
      ) : (
        <>
          {/* Featured posts */}
          {featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-xl font-semibold mb-4">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Regular posts */}
          {posts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-10 text-center"
            >
              <h3 className="text-lg font-medium text-gray-700 mb-2">No posts found</h3>
              <p className="text-gray-500">
                {activeCategory === 'All' 
                  ? 'There are no posts available at the moment.'
                  : `There are no ${activeCategory} posts available at the moment.`}
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// PostCard component for displaying individual posts
function PostCard({ post, index }) {
  const publishedDate = new Date(post.publishedAt);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
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