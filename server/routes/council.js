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

/**
 * @swagger
 * /api/council/posts:
 *   get:
 *     summary: Get all council posts
 *     description: Retrieve all council posts sorted by newest first (limited to 20 most recent)
 *     tags: [Council Posts]
 *     responses:
 *       200:
 *         description: List of council posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CouncilPost'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/council/posts:
 *   post:
 *     summary: Create a new council post
 *     description: Create a new post in the council board
 *     tags: [Council Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *           example:
 *             content: "Today I installed Linux on my school laptop"
 *             author: "username"
 *             isAnonymous: false
 *             taskType: "repair"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CouncilPost'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Post with this hash already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/council/posts/{id}/vote:
 *   put:
 *     summary: Vote on a council post
 *     description: Increment or decrement the vote count of a post
 *     tags: [Council Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteRequest'
 *           example:
 *             action: "increment"
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CouncilPost'
 *       400:
 *         description: Invalid action (must be 'increment' or 'decrement')
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/council/posts/{id}:
 *   delete:
 *     summary: Delete a council post
 *     description: Delete a post from the council board (for moderation)
 *     tags: [Council Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

