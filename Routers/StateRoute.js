const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const state = require('../Controllers/StateController');

router.get('/lawyer', auth, state.getLawyerStats);
router.get('/client', auth, state.getClientStats);
// router.get('/admin', auth, state.getAdminStats);

module.exports = router;
