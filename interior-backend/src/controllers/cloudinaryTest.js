const cloudinary = require("../config/cloudinary");

const testCloudinary = async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testCloudinary,
};