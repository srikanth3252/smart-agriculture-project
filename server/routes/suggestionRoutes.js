const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

// Public suggestion endpoint
router.post('/', suggestionController.getCropSuggestions);

module.exports = router;

