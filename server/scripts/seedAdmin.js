const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing admin to ensure fresh credentials
    await Admin.deleteOne({ $or: [{ username: 'admin' }, { email: 'admin@palmberry.com' }] });
    console.log('Cleaned up existing admin records');

    const admin = new Admin({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@palmberry.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin seeded successfully!');
    console.log('---------------------------');
    console.log('Login URL: /admin/login');
    console.log('Username: admin (or admin@palmberry.com)');
    console.log('Password: adminpassword123');
    console.log('---------------------------');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
