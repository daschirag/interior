const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    "mysecretkey",
    {
      expiresIn: "1d",
    }
  );
};

module.exports = generateToken;