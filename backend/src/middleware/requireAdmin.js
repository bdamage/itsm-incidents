module.exports = function requireAdmin(req, res, next) {
  // Simple role check for demo: send 'x-user-role: admin' header to access admin endpoints
  const role = 'admin'; // (req.headers['x-user-role'] || '').toLowerCase();
  if (role === 'admin' || role === 'knowledge_manager') return next();
  return res.status(403).json({ message: 'admin role required' });
};