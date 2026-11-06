require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDefaultAdmin } = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (Atlas or In-Memory fallback for zero-config evaluation)
    await connectDB();

    // 2. Ensure initial administrator is provisioned
    await seedDefaultAdmin();

    // 3. Listen on configured port
    const server = app.listen(PORT, () => {
      console.log(`🚀 [VoteSecure Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('🛑 Shutting down VoteSecure server...');
      server.close(() => {
        console.log('👋 Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
