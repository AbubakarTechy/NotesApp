const cloudinary = require('cloudinary').v2;

const hasIndividualCreds = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL?.startsWith('cloudinary://'));

if (hasIndividualCreds) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else if (hasCloudinaryUrl) {
  cloudinary.config();
}

const isCloudinaryConfigured = hasIndividualCreds || hasCloudinaryUrl;

if (isCloudinaryConfigured) {
  console.log('Cloudinary configured successfully.');
} else {
  console.log('Cloudinary credentials missing. Server will fall back to local disk storage.');
}

module.exports = { cloudinary, isCloudinaryConfigured };
