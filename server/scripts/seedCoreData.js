const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

async function seedCoreData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        {
          name: 'Premium Palm Jaggery Powder',
          description: 'Natural palm jaggery powder for tea and desserts.',
          price: 299,
          imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80',
          inStock: true,
        },
        {
          name: 'Organic Palm Jaggery Crystals',
          description: 'Rich mineral jaggery crystals with authentic taste.',
          price: 349,
          imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80',
          inStock: true,
        }
      ]);
      console.log('Seeded products');
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        { code: 'WELCOME10', discount: 10, isActive: true },
        { code: 'SAVE20', discount: 20, isActive: true }
      ]);
      console.log('Seeded coupons');
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const firstProduct = await Product.findOne();
      if (firstProduct) {
        await Order.create({
          orderItems: [
            {
              name: firstProduct.name,
              qty: 1,
              image: firstProduct.imageUrl,
              price: firstProduct.price,
              product: firstProduct._id,
            },
          ],
          shippingAddress: {
            address: 'MG Road',
            city: 'Bengaluru',
            postalCode: '560001',
            country: 'India',
          },
          paymentMethod: 'cod',
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: firstProduct.price,
          totalPrice: firstProduct.price,
          status: 'Pending',
        });
        console.log('Seeded one sample order');
      }
    }

    console.log('Core data ready');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedCoreData();
