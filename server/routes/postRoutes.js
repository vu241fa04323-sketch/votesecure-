const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { postRules, validate } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.route('/')
  .post(isAdmin, postRules, validate, createPost)
  .get(getPosts);

router.route('/:id')
  .put(isAdmin, updatePost)
  .delete(isAdmin, deletePost);

module.exports = router;
