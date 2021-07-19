const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const reviewService = require('../review/review.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  query,
  getById,
  getByToyname,
  remove,
  update,
  add,
};

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection('toy');
    var toys = await collection.find(criteria).toArray();
    return toys;
  } catch (err) {
    logger.error('cannot find toys', err);
    throw err;
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy');
    const toy = await collection.findOne({ _id: ObjectId(toyId) });

    // toy.givenReviews = await reviewService.query({ byToyId: ObjectId(toy._id) });
    // toy.givenReviews = toy.givenReviews.map((review) => {
    //   delete review.byToy;
    //   return review;
    // });

    return toy;
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err);
    throw err;
  }
}

async function getByToyname(toyname) {
  try {
    const collection = await dbService.getCollection('toy');
    const toy = await collection.findOne({ toyname });
    return toy;
  } catch (err) {
    logger.error(`while finding toy ${toyname}`, err);
    throw err;
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy');
    await collection.deleteOne({ _id: ObjectId(toyId) });
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err);
    throw err;
  }
}

async function update(toy) {
  console.log('toy:', toy);
  try {
    // peek only updatable fields!
    const toyToSave = {
      _id: ObjectId(toy._id),
      name: toy.name,
      price: toy.price,
      type: toy.type,
      createdAt: toy.createdAt,
      inStock: toy.inStock,
    };
    const collection = await dbService.getCollection('toy');
    await collection.updateOne({ _id: toyToSave._id }, { $set: toyToSave });
    return toyToSave;
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err);
    throw err;
  }
}

async function add(toy) {
  try {
    // peek only updatable fields!
    const toyToAdd = {
      name: toy.name,
      price: toy.price,
      type: toy.type,
      createdAt: Date.now(),
      inStock: true,
    };
    const collection = await dbService.getCollection('toy');
    await collection.insertOne(toyToAdd);
    return toyToAdd;
  } catch (err) {
    logger.error('cannot insert toy', err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
    criteria.$or = [
      {
        name: txtCriteria,
      },
    ];
  }
  if (filterBy.type) {
    const typeCriteria = { $regex: filterBy.type, $options: 'i' };
    criteria.$or = [
      {
        type: typeCriteria,
      },
    ];
  }
  // if (filterBy.price) {
  //     criteria.price = { $gte: filterBy.price }
  // }
  return criteria;
}
