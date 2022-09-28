const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// POST request for creating Comment
router.post('/:id', commentController.comment_create_post);

// DELETE request to delete Comment
router.delete('/:id', commentController.comment_remove_delete);

module.exports = router;
