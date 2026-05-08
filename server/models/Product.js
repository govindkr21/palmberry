const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  // Raw image binary stored here so the /api/products list response stays lean.
  // imageUrl points to /api/products/:id/image which streams this buffer.
  imageData: { type: Buffer },
  imageMimeType: { type: String },
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', ProductSchema);
