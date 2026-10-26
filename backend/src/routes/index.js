const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const articleRoutes = require('./articleRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
