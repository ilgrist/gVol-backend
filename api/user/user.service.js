const dbService = require("../../services/db.service");
// const logger = require('../../services/logger.service')
// const reviewService = require('../review/review.service');
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  query,
  getById,
  login,
  remove,
  update,
  add,
  getByUsername,
};

async function query() {
  try {
    const collection = await dbService.getCollection("user");
    var users = await collection.find().toArray();
    users = users.map((user) => {
      delete user.password;
      return user;
    });
    return users;
  } catch (err) {
    throw err;
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection("user");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    delete user.password;
    return user;
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
}

async function login(userCred) {
  try{
    const collection = await dbService.getCollection("user");
    const user = await collection.findOne({$and: [{username: userCred.username},{password:userCred.password}] });
    return user;
  } catch(err) {
    throw err 
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user');
    const user = await collection.findOne({ username });
    return user;
  } catch (err) {
    logger.error(`while finding user ${username}`, err);
    throw err;
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection("user");
    await collection.deleteOne({ _id: ObjectId(userId) });
  } catch (err) {
    // logger.error(`cannot remove user ${userId}`, err);
    throw err;
  }
}

async function update(user) {
  try {
    // peek only updatable fields!
    const userToSave = {
      _id: ObjectId(user._id),
      username: user.username,
      fullname: user.fullname,
      // score: user.score
    };
    const collection = await dbService.getCollection("user");
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave });
    return userToSave;
  } catch (err) {
    // logger.error(`cannot update user ${user._id}`, err);
    throw err;
  }
}

async function add(user) {
  try {
    const collection = await dbService.getCollection("user");
    await collection.insertOne(user);
    // await collection.insertOne(userToAdd);
    // return userToAdd;
    return user;
  } catch (err) {
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" };
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ];
  }
  return criteria;
}
