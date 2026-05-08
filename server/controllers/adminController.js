const Admin = require('../models/Admin');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Support login via either username or email
    const admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.json({
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders with full details
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private/Admin
const logoutAdmin = async (req, res) => {
  // In JWT, logout is mostly handled client-side by deleting the token.
  // We can return a success message here.
  res.json({ message: 'Logged out successfully' });
};

// @desc    Update order delivery status
// @route   PUT /api/admin/orders/:id/delivery
// @access  Private/Admin
const updateDeliveryStatus = async (req, res) => {
  const { deliveryStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.deliveryStatus = deliveryStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginAdmin,
  getAdminOrders,
  logoutAdmin,
  updateDeliveryStatus
};
