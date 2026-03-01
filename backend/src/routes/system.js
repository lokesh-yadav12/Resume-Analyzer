const express = require('express');
const { healthCheck } = require('../services/cloudStorage');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Health check endpoint for storage
router.get('/health/storage', async (req, res) => {
  try {
    const result = await healthCheck();
    
    const statusCode = result.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: result.status === 'healthy',
      data: result
    });
    
  } catch (error) {
    console.error('Storage health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Storage health check failed',
      error: error.message
    });
  }
});

// System status endpoint (requires admin access)
router.get('/status', authenticate, authorize('Enterprise'), async (req, res) => {
  try {
    const storageHealth = await healthCheck();
    
    // Add more system checks here as needed
    const systemStatus = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      storage: storageHealth,
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      data: systemStatus
    });
    
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status'
    });
  }
});

module.exports = router;