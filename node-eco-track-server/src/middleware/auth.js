// Node middleware/auth.js — verifies Django's token, doesn't create its own
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // same secret Django uses
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = auth