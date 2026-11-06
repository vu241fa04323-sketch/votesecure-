const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// @desc    Add post to an election
// @route   POST /api/posts
// @access  Private/Admin
const createPost = async (req, res, next) => {
  try {
    const { postName, description, electionId } = req.body;

    const post = await Post.create({
      postName,
      description: description || '',
      electionId,
    });

    res.status(201).json({
      success: true,
      message: 'Post / Position created successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts with candidate lists
// @route   GET /api/posts
// @access  Private (Admin or Voter)
const getPosts = async (req, res, next) => {
  try {
    const { electionId } = req.query;
    const query = {};
    if (electionId) query.electionId = electionId;

    const posts = await Post.find(query).populate('electionId', 'electionName status');

    const postsWithCandidates = await Promise.all(
      posts.map(async (post) => {
        const candidates = await Candidate.find({ postId: post._id });
        const voteCount = await Vote.countDocuments({ postId: post._id });
        return {
          ...post.toObject(),
          candidates,
          candidateCount: candidates.length,
          voteCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: postsWithCandidates.length,
      posts: postsWithCandidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = async (req, res, next) => {
  try {
    const { postName, description } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (postName) post.postName = postName;
    if (description !== undefined) post.description = description;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post before voting starts
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const voteCount = await Vote.countDocuments({ postId: post._id });
    if (voteCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete post: Votes have already been cast for this post.',
      });
    }

    // Delete associated candidates
    await Candidate.deleteMany({ postId: post._id });
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post and associated candidates deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  updatePost,
  deletePost,
};
