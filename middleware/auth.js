const auth = (req, res, next) => {
  // Check session-based auth
  if (req.session && req.session.adminId) {
    return next();
  }
  
  // Check Bearer token auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple token validation - in production use JWT
    if (token === 'admin-token') {
      return next();
    }
  }
  
  res.status(401).json({ message: 'Admin access required' });
};

module.exports = auth;