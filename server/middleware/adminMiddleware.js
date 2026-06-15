const isAdminUser = (user) => user?.role === 'admin' || user?.isAdmin === true;

const adminOnly = (req, res, next) => {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { isAdminUser, adminOnly };
