const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nexcontact",
        resource_type: "image",
        timeout: 30000,
        // Chhoti, optimized image => fast load
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Purani image delete (fail ho to request na toote)
const removeImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[cloudinary] could not delete ${publicId}: ${err.message}`);
  }
};

module.exports = { uploadImage, removeImage };
