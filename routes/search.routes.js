const express = require('express');

const searchController = require('../controllers/search.controller');

const router = express.Router();

// get route for a simple search of a user
router.get('/searchUser', searchController.getSearchUser);

module.exports = router;