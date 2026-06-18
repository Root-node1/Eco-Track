const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
