const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getProductImage, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { auth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/:id/image', getProductImage);
router.get('/:id', getProductById);
router.post('/', auth, requireAdmin, upload.single('imageFile'), createProduct);
router.put('/:id', auth, requireAdmin, upload.single('imageFile'), updateProduct);
router.delete('/:id', auth, requireAdmin, deleteProduct);

module.exports = router;
