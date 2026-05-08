const express = require('express');
const router = express.Router();
const { getAddresses, saveAddress, deleteAddress } = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

router.route('/')
  .get(auth, getAddresses)
  .post(auth, saveAddress);

router.route('/:id')
  .delete(auth, deleteAddress);

module.exports = router;
