const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/add-to-cart
const addToCart = async (req, res) => {
  const { productId, qty, sessionId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const query = req.user ? { user: req.user._id } : { sessionId };
    let cart = await Cart.findOne(query);

    if (cart) {
      // Check if product exists in cart
      const itemIndex = cart.items.findIndex((p) => p.product.toString() === productId);

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].qty += (qty || 1);
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          name: product.name,
          image: product.image || product.imageUrl,
          price: product.price,
          qty: qty || 1
        });
      }
      cart = await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        user: req.user?._id,
        sessionId: req.user ? undefined : sessionId,
        items: [{
          product: productId,
          name: product.name,
          image: product.image || product.imageUrl,
          price: product.price,
          qty: qty || 1
        }]
      });
    }

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   POST /api/update-cart
const updateCart = async (req, res) => {
  const { productId, qty, sessionId } = req.body;

  try {
    const query = req.user ? { user: req.user._id } : { sessionId };
    let cart = await Cart.findOne(query);

    if (cart) {
      const itemIndex = cart.items.findIndex((p) => p.product.toString() === productId);

      if (itemIndex > -1) {
        if (qty <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].qty = qty;
        }
        cart = await cart.save();
        res.json(cart);
      } else {
        res.status(404).json({ message: 'Item not found in cart' });
      }
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/get-cart
const getCart = async (req, res) => {
  const { sessionId } = req.query;

  try {
    const query = req.user ? { user: req.user._id } : { sessionId };
    let cart = await Cart.findOne(query).populate('items.product');
    
    if (cart && cart.items.length > 0) {
      // Validate each product against Products table
      const initialLength = cart.items.length;
      cart.items = cart.items.filter(item => item.product != null);
      
      // If some products were deleted, update the cart in DB
      if (cart.items.length !== initialLength) {
        await cart.save();
      }
    }
    
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToCart,
  updateCart,
  getCart
};
