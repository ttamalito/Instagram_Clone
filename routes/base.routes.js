const express = require('express');

const baseController = require('../controllers/base.controllers');

const router = express.Router();

// get for base
router.get('/', baseController.base);


module.exports = router;