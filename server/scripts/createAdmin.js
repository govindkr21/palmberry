const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palmberry', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@test.com' });

    if (adminExists) {
      // Update existing user to admin
      adminExists.role = 'admin';
      await adminExists.save();
      console.log('✅ User updated to admin role');
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('Email: admin@test.com');
    console.log('Password: password123');
    console.log('You can now log in at: http://localhost:3000/admin/login');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
