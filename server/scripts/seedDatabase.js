const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Admin = require('../models/Admin');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep data)
    // await User.deleteMany({});
    // await Admin.deleteMany({});
    // await Address.deleteMany({});
    // await Product.deleteMany({});
    // await Coupon.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create Super Admin User
    const existingAdmin = await Admin.findOne({ email: 'admin@palmberry.com' });
    if (!existingAdmin) {
      const adminUser = await Admin.create({
        name: 'PalmBerry Admin',
        email: 'admin@palmberry.com',
        password: 'Admin@123',
        accessLevel: 'super_admin',
        permissions: {
          canAddProduct: true,
          canEditProduct: true,
          canDeleteProduct: true,
          canManageCoupons: true,
          canViewOrders: true,
          canEditOrders: true,
          canManageAdmins: true
        },
        isActive: true
      });
      console.log('✅ Super Admin created: admin@palmberry.com / Admin@123');
    } else {
      console.log('⏭️  Super Admin already exists');
    }

    // Create Regular Customer User
    const existingUser = await User.findOne({ email: 'user@palmberry.com' });
    if (!existingUser) {
      const customerUser = await User.create({
        name: 'Test Customer',
        email: 'user@palmberry.com',
        password: 'User@123',
        phone: '9876543210',
        role: 'customer',
        authProviders: {
          email: true,
          google: null,
          phone: { verified: false }
        },
        preferences: {
          newsletter: true,
          notifications: true,
          smsAlerts: false
        },
        isVerified: true
      });

      // Create sample address for the customer
      const address = await Address.create({
        userId: customerUser._id,
        type: 'home',
        fullName: 'Test Customer',
        phone: '9876543210',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
        country: 'India',
        landmark: 'Near Park',
        isDefault: true
      });

      // Add address reference to user
      customerUser.addresses.push(address._id);
      await customerUser.save();

      console.log('✅ Customer user created: user@palmberry.com / User@123');
      console.log('   ├─ Address saved: Bangalore, Karnataka');
    } else {
      console.log('⏭️  Customer user already exists');
    }

    // Create Sample Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          name: 'Premium Palm Jaggery Powder',
          description: 'Pure, unrefined palm jaggery powder. Perfect for beverages, baking, and cooking. Rich in minerals and antioxidants.',
          price: 299,
          category: 'Jaggery',
          stock: 50,
          isInStock: true,
          benefits: ['Boosts immunity', 'Natural energy source', 'Rich in minerals'],
          sku: 'PPJ-001'
        },
        {
          name: 'Organic Palm Jaggery Crystals',
          description: 'Coarse palm jaggery crystals with pure and authentic taste. Ideal for traditional recipes.',
          price: 349,
          category: 'Jaggery',
          stock: 35,
          isInStock: true,
          benefits: ['Aids digestion', 'Energy booster', 'Organic certified'],
          sku: 'PPJ-002'
        },
        {
          name: 'Palm Jaggery for Tea & Coffee',
          description: 'Finely ground palm jaggery perfect as a sugar substitute in hot beverages.',
          price: 249,
          category: 'Jaggery',
          stock: 0,
          isInStock: false,
          benefits: ['Natural sweetener', 'Zero preservatives', 'Perfect for beverages'],
          sku: 'PPJ-003'
        },
        {
          name: 'Raw Palm Jaggery Blocks',
          description: 'Unprocessed palm jaggery blocks with authentic flavor. Best for traditional cooking.',
          price: 399,
          category: 'Jaggery',
          stock: 25,
          isInStock: true,
          benefits: ['Pure and natural', 'No additives', 'Traditional processing'],
          sku: 'PPJ-004'
        },
        {
          name: 'Palm Jaggery Wellness Mix',
          description: 'Blend of palm jaggery with turmeric and ginger. Perfect for immunity boost.',
          price: 449,
          category: 'Wellness',
          stock: 20,
          isInStock: true,
          benefits: ['Immunity booster', 'Anti-inflammatory', 'Complete wellness'],
          sku: 'PPJ-005'
        }
      ];

      await Product.insertMany(products);
      console.log('✅ Sample products created (5 products)');
    } else {
      console.log(`⏭️  ${productCount} products already exist`);
    }

    // Create Sample Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const coupons = [
        {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          minPurchase: 0,
          usageLimit: 100,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true
        },
        {
          code: 'SAVE50',
          discountType: 'fixed',
          discountValue: 50,
          minPurchase: 500,
          usageLimit: 50,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          isActive: true
        },
        {
          code: 'HEALTH20',
          discountType: 'percentage',
          discountValue: 20,
          minPurchase: 1000,
          usageLimit: 200,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          isActive: true
        }
      ];

      await Coupon.insertMany(coupons);
      console.log('✅ Sample coupons created (3 coupons)');
    } else {
      console.log(`⏭️  ${couponCount} coupons already exist`);
    }

    console.log('\n📊 Database Setup Complete!');
    console.log('═════════════════════════════════════');
    console.log('🔐 ADMIN LOGIN (Secret URL: /admin/login)');
    console.log('   Email: admin@palmberry.com');
    console.log('   Password: Admin@123');
    console.log('   Access Level: Super Admin');
    console.log('═════════════════════════════════════');
    console.log('👤 CUSTOMER LOGIN (Public URL: /)');
    console.log('   Email: user@palmberry.com');
    console.log('   Password: User@123');
    console.log('═════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the seed script
seedDatabase();
