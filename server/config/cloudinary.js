const cloudinary = require('cloudinary').v2;

// Configure only when all three env vars are present so the app continues
// working without Cloudinary credentials set.
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Returns true when all three Cloudinary env vars are present.
 * Used to gate uploads so the app keeps working without them configured.
 */
const isConfigured = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

/**
 * Upload an image buffer to Cloudinary.
 *
 * @param {Buffer} buffer    - Raw image binary (from multer memoryStorage)
 * @param {string} mimeType  - e.g. "image/jpeg"
 * @param {string} publicId  - Cloudinary public_id; use MongoDB _id for idempotent re-uploads
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (buffer, mimeType, publicId) =>
  new Promise((resolve, reject) => {
    const ext = mimeType.split('/')[1] || 'jpg';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        format: ext,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

module.exports = { isConfigured, uploadToCloudinary };
