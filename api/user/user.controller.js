const userService = require("./user.service");
const socketService = require("../../services/socket.service");
// const logger = require('../../services/logger.service')

async function getUser(req, res) {
  try {
    const user = await userService.getById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(500).send({ err: "Failed to get user" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await userService.query();
    res.send(users);
  } catch (err) {
    res.status(500).send({ err: "Failed to get users" });
  }
}

async function login(req, res) {
  try{
    const userCred = req.body;
    const user = await userService.login(userCred);
    user = { ...user };
    delete user.password;
    req.session.loggedinUser = user;
    res.send(user);
  } catch(err) {
    res.status(500).send({ err: "Login failed " });
  }
}

async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    // logger.error('Failed to delete user', err)
    res.status(500).send({ err: "Failed to delete user" });
  }
}

async function addUser(req, res) {
  try {
    const user = req.body;
    const savedUser = await userService.add(user);
    res.send(savedUser);
    // socketService.broadcast({ type: 'user-created', data: review, to: savedUser._id });
  } catch (err) {
    res.status(500).send({ err: "Failed to create user" });
  }
}
async function updateUser(req, res) {
  try {
    const user = req.body;
    const savedUser = await userService.update(user);
    res.send(savedUser);
    // socketService.broadcast({ type: 'user-updated', data: review, to: savedUser._id });
  } catch (err) {
    // logger.error('Failed to update user', err)
    res.status(500).send({ err: "Failed to update user" });
  }
}

module.exports = {
  getUser,
  getUsers,
  login,
  addUser,
  deleteUser,
  updateUser,
};
