const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const registerUser = async ({
  name,
  email,
  password,
}) => {
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  return await User.create({
    name,
    email,
    password: hashedPassword,
  });
};

const loginUser = async ({
  email,
  password,
}) => {
  const user = await User.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid password");
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
  registerUser,
  loginUser,
};