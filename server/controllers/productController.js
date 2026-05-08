const Product = require('../models/Product');
const { isConfigured, uploadToCloudinary } = require('../config/cloudinary');

// Helper: convert a legacy Base64 Data URI imageUrl to the lightweight image path.
// Only transforms in-memory for the API response; does NOT write back to MongoDB.
const toImagePath = (product) => {
  if (product.imageUrl && product.imageUrl.startsWith('data:')) {
    return { ...product, imageUrl: `/api/products/${product._id}/image` };
  }
  return product;
};

// Get all products — imageData binary is excluded so the response stays lean
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-imageData').lean();
    res.json(products.map(toImagePath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product — same lean treatment
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-imageData').lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(toImagePath(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Serve the product image with long-lived caching so the browser never re-fetches
exports.getProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('imageData imageMimeType imageUrl');
    if (!product) return res.status(404).send();

    // Preferred path: raw buffer stored in imageData
    if (product.imageData && product.imageData.length) {
      res.set('Content-Type', product.imageMimeType || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(product.imageData);
    }

    // Fallback: legacy Base64 Data URI still stored in imageUrl
    if (product.imageUrl && product.imageUrl.startsWith('data:')) {
      const match = product.imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        const buffer = Buffer.from(match[2], 'base64');
        res.set('Content-Type', match[1]);
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(buffer);
      }
    }

    res.status(404).send();
  } catch (error) {
    res.status(500).send();
  }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!req.file && !req.body.imageUrl && !req.body.image) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const product = new Product({
      name,
      description,
      price,
      stock: stock || 0,
      imageUrl: '', // set below
    });

    if (req.file) {
      if (isConfigured()) {
        try {
          // Upload directly to Cloudinary CDN — keeps MongoDB lean
          const { url } = await uploadToCloudinary(
            req.file.buffer,
            req.file.mimetype,
            String(product._id)
          );
          product.imageUrl = url;
        } catch (cloudinaryErr) {
          // Cloudinary failed — fall back to storing the buffer in MongoDB so
          // the product is still saved and the image is still served.
          console.error('Cloudinary upload failed, falling back to buffer storage:', cloudinaryErr.message);
          product.imageData = req.file.buffer;
          product.imageMimeType = req.file.mimetype;
          // Mongoose generates _id client-side on `new Product(...)`, so it is
          // available here before product.save() is called.
          product.imageUrl = `/api/products/${product._id}/image`;
        }
      } else {
        // Cloudinary not configured — use buffer-in-MongoDB path
        product.imageData = req.file.buffer;
        product.imageMimeType = req.file.mimetype;
        product.imageUrl = `/api/products/${product._id}/image`;
      }
    } else {
      product.imageUrl = req.body.imageUrl || req.body.image;
    }

    await product.save();

    // Return without the heavy binary field
    const doc = product.toObject();
    delete doc.imageData;
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Never let the client overwrite the binary fields directly
    delete updates.imageData;
    delete updates.imageMimeType;

    if (req.file) {
      if (isConfigured()) {
        try {
          const { url } = await uploadToCloudinary(
            req.file.buffer,
            req.file.mimetype,
            req.params.id
          );
          updates.imageUrl = url;
          // Clear any old buffer-in-MongoDB data since we now have a CDN URL
          updates.imageData = undefined;
          updates.imageMimeType = undefined;
        } catch (cloudinaryErr) {
          console.error('Cloudinary upload failed, falling back to buffer storage:', cloudinaryErr.message);
          updates.imageData = req.file.buffer;
          updates.imageMimeType = req.file.mimetype;
          updates.imageUrl = `/api/products/${req.params.id}/image`;
        }
      } else {
        updates.imageData = req.file.buffer;
        updates.imageMimeType = req.file.mimetype;
        updates.imageUrl = `/api/products/${req.params.id}/image`;
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-imageData');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(toImagePath(product.toObject()));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
