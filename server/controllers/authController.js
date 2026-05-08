const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    let userExists = null;
    if (email) userExists = await User.findOne({ email });
    if (!userExists && phone) userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    let user = null;
    if (email) user = await User.findOne({ email });
    if (!user && phone) user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        password: Math.random().toString(36).slice(-8) // Random password since not used
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google login' });
  }
};

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized as an admin' });
            }
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate each product against Products table
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => item.product != null);

    if (user.cart.length !== initialLength) {
      await user.save();
    }

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.cart = req.body.cart;
      await user.save();
      res.json(user.cart);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  console.log(`Mock OTP 123456 sent to ${phone}`);
  res.json({ message: 'OTP sent successfully' });
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp, name } = req.body;
  if (otp === '123456') {
    try {
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({
          name: name || 'Phone User',
          phone,
          password: Math.random().toString(36).slice(-8)
        });
      }
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};
