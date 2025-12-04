import express from 'express';
import CouncilPost from '../models/CouncilPost.js';

const router = express.Router();

// Simple hash function (same as frontend)
const generateHash = (content, author) => {
  const str = `${content}_${author}_${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
};

// GET all posts - sorted by newest first
router.get('/posts', async (req, res) => {
  try {
    const posts = await CouncilPost.find()
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 most recent posts
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
});

// POST create new post
router.post('/posts', async (req, res) => {
  try {
    const { content, author, isAnonymous, taskType } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 500 characters'
      });
    }

    const finalAuthor = isAnonymous ? 'Anonymous' : (author || `Guest_${Math.floor(Math.random() * 1000)}`);
    const hash = generateHash(content, finalAuthor);

    // Check if hash already exists (very unlikely but check anyway)
    const existingPost = await CouncilPost.findOne({ hash });
    if (existingPost) {
      return res.status(409).json({
        success: false,
        message: 'Post with this hash already exists'
      });
    }

    const post = new CouncilPost({
      content: content.trim(),
      author: finalAuthor,
      isAnonymous: isAnonymous || false,
      taskType: taskType || 'general',
      hash,
      votes: 0
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
});

// PUT update vote count
router.put('/posts/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'increment' or 'decrement'

    if (!['increment', 'decrement'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "increment" or "decrement"'
      });
    }

    const post = await CouncilPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (action === 'increment') {
      post.votes += 1;
    } else {
      post.votes = Math.max(0, post.votes - 1);
    }

    const updatedPost = await post.save();

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vote',
      error: error.message
    });
  }
});

// DELETE post (for moderation)
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CouncilPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
});

export default router;

