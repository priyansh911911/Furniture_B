const auth = (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: 'Admin access required' });
  }
};

module.exports = auth;