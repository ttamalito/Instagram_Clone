const express = require('express');
const authController = require('../controllers/auth.controller');

// middleware to add a csrfToken
//const addCsrfToken = require('../middlewares/csrf-Token');
const router = express.Router()

// get login
router.get('/login', authController.getLogin);

// post login
router.post('/login', authController.postLogin);

// get signup
router.get('/signup', authController.getSignUp);

// post signup
router.post('/signup', authController.postSignUp);

// post logout
router.get('/logout', authController.getLogout);


module.exports = router;