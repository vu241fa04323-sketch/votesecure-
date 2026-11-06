const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'votesecure_fallback_secret_key_2026';

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '24h') => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};
