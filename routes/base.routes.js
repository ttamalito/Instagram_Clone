const express = require('express');

const baseController = require('../controllers/base.controllers');

const router = express.Router();

// get for base
router.get('/', baseController.base);

// test route for server-sent events
router.get('/open-connection', baseController.saveConnection);


function send(res) {
    res.write('data: ' + 'hello!\n\n');

    setTimeout(() => {send(res)}, 10000);
}

module.exports = router;