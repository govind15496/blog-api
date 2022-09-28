const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// POST request for creating Post
router.post('/create', postController.post_create_post);

// PUT request for updating Post
router.put('/:id', postController.post_update_put);

// GET request for one Post
router.get('/:id', postController.post_detail_get);

// DELETE request to delete Post
router.delete('/:id', postController.post_remove_delete);

// GET request for list of all Posts
router.get('/', postController.post_list_get);

module.exports = router;
