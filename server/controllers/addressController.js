const Address = require('../models/Address');

// @desc    Get all addresses for a user or session
// @route   GET /api/get-address
// @access  Public/Private
const getAddresses = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const query = req.user ? { user: req.user._id } : { sessionId: sessionId };
    
    if (!req.user && !sessionId) {
      return res.json({ addresses: [] });
    }

    const addresses = await Address.find(query).sort({ createdAt: -1 });
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a new address
// @route   POST /api/save-address
// @access  Public/Private
const saveAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      street,
      city,
      state,
      pinCode,
      landmark,
      type,
      isDefault,
      sessionId
    } = req.body;

    const query = req.user ? { user: req.user._id } : { sessionId: sessionId };

    // If isDefault is true, unset other defaults for this user/session
    if (isDefault) {
      await Address.updateMany(query, { isDefault: false });
    }

    const address = new Address({
      user: req.user?._id,
      sessionId: req.user ? undefined : sessionId,
      fullName,
      phone,
      street,
      city,
      state,
      pinCode,
      landmark,
      type,
      isDefault: isDefault
    });

    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Public/Private
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check ownership
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (req.user) {
      if (address.user?.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }
    } else if (address.sessionId !== sessionId) {
      return res.status(401).json({ message: 'Session not authorized' });
    }

    await address.deleteOne();
    res.json({ message: 'Address removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAddresses,
  saveAddress,
  deleteAddress
};
