const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

/** Expected auth failures carry an HTTP status; anything else is a real server error. */
function authError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const loginUser = async ({
  email,
  password,
} = {}) => {
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    throw authError(400, "Email and password are required");
  }

  const user = await User.findByEmail(email.trim().toLowerCase());

  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!user) {
    throw authError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw authError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

module.exports = {
  loginUser,
};