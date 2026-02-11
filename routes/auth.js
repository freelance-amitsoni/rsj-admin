const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = await authService.registerUser(username, password);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'User already exists') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = await authService.loginUser(username, password);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Invalid Credentials') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
