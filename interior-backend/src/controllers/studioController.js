const Studio = require("../models/studioModel");

const getStudios = async (req, res) => {
  try {
    const studios = await Studio.findAll();

    res.json({
      success: true,
      studios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.json({
      success: true,
      studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createStudio = async (req, res) => {
  try {
    const studio = await Studio.upsertByCity(req.body);

    res.json({
      success: true,
      studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudio = async (req, res) => {
  try {
    const studio = await Studio.update(req.params.id, req.body);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.json({
      success: true,
      studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteStudio = async (req, res) => {
  try {
    const studio = await Studio.remove(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.json({
      success: true,
      studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudios,
  getStudio,
  createStudio,
  updateStudio,
  deleteStudio,
};
