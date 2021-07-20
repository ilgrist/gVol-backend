const bcrypt = require('bcrypt');
const userService = require('../user/user.service');
// const logger = require('../../services/logger.service');

async function login(username, password) {
  
  const user = await userService.getByUsername(username);
  if (!user) return Promise.reject('Invalid username or password');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return Promise.reject('Invalid username or password');

  delete user.password;
  return user;
}

async function signup(user) {
  const saltRounds = 10;
  if (!user.username || !user.password || !user.fullname) return Promise.reject('fullname, username and password are required!');
  const hash = await bcrypt.hash(user.password, saltRounds);
  user.password = hash
  return userService.add(user);
}

module.exports = {
  signup,
  login,
};
