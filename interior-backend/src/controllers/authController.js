const Discipline = require("../models/disciplineModel");
const Project = require("../models/projectModel");
const SiteSettings = require("../models/siteSettingsModel");
const User = require("../models/userModel");
const District = require("../models/districtModel");

const {
  registerUser,
  loginUser,
} = require("../services/authService");

const initDatabase = async (req, res) => {
  try {
    await User.createTable();
    await Project.createTable();
    await Discipline.createTable();
    await SiteSettings.createTable();
    console.log("CREATING DISTRICTS TABLE...");

    await District.createTable();

    res.json({
      success: true,
      message: "Users table created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.updateProfile(
      req.user.id,
      name
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initDatabase,
  register,
  login,
  getProfile,
  updateProfile,
};