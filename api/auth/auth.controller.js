const authService = require('./auth.service');
// const logger = require('../../services/logger.service');

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await authService.login(username, password);
    req.session.user = user;
    res.json(user);
  } catch (err) {
    res.status(401).send({ err: 'Failed to Login' });
  }
}

async function signup(req, res) {
  try {
    const newUser = req.body;
    const copyNewUser = JSON.parse(JSON.stringify(newUser))
    const account = await authService.signup(copyNewUser);
    const user = await authService.login(newUser.username, newUser.password);
    req.session.user = user;
    res.json(user);
  } catch (err) {
    res.status(500).send({ err: 'Failed to signup' });
  }
}

async function logout(req, res) {
  try {
    req.session.destroy();
    res.send({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).send({ err: 'Failed to logout' });
  }
}

module.exports = {
  login,
  signup,
  logout,
};
