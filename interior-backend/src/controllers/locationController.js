const { getLocationCatalog, searchLocations } = require("../utils/karnatakaRegions");

const getKarnatakaLocations = (req, res) => {
  res.json({
    success: true,
    data: getLocationCatalog(),
  });
};

const searchKarnatakaLocations = (req, res) => {
  const q = req.query.q || "";
  const region = req.query.region || "all";
  const results = searchLocations(q, region);

  res.json({
    success: true,
    data: results,
  });
};

module.exports = {
  getKarnatakaLocations,
  searchKarnatakaLocations,
};
