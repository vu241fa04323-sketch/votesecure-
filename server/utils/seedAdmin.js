const Admin = require('../models/Admin');

const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@votesecure.org';
      const password = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@Secure2026!';
      const name = process.env.ADMIN_DEFAULT_NAME || 'System Administrator';

      const admin = new Admin({
        name,
        email,
        password, // Pre-save hook will hash this with bcrypt
        role: 'admin',
      });

      await admin.save();
      console.log('---------------------------------------------------------');
      console.log('🔐 [VoteSecure Seed] Default Administrator account provisioned:');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
      console.log('   (Please change credentials after initial deployment)');
      console.log('---------------------------------------------------------');
    }
  } catch (error) {
    console.error('⚠️ [VoteSecure Seed] Error seeding default admin:', error.message);
  }
};

module.exports = { seedDefaultAdmin };
