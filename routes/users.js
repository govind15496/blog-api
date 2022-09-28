const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST request for sign up User
router.post('/sign-up', userController.user_sign_up_post);

// POST request for sign in User
router.post('/sign-in', userController.user_sign_in_post);

// Get request to check jwt
router.get('/check-jwt', userController.check_jwt_get);

module.exports = router;
