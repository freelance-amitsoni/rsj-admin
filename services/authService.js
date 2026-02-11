const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (username, password) => {
  let user = await User.findOne({ username });

  if (user) {
    throw new Error('User already exists');
  }

  user = new User({
    username,
    password
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();

  return generateToken(user.id);
};

const loginUser = async (username, password) => {
  let user = await User.findOne({ username });

  if (!user) {
    throw new Error('Invalid Credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid Credentials');
  }

  return generateToken(user.id);
};

const getUserById = async (userId) => {
  return await User.findById(userId).select('-password');
};

const generateToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      user: {
        id: userId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
