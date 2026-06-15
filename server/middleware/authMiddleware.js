const jwt = require('jsonwebtoken');

// Middleware to protect routes by verifying JWT
const authMiddleware = (req, res, next) => {
  // Get token from header (Format: Bearer <token>)
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ucpian_default_secret_key_123');
    req.user = decoded; // Attach user payload to request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
