const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');
const utilService = require('../../services/util.Service');
const logger = require('../../services/logger.service');

async function query(filterBy = {}) {
  if (filterBy.toyId) {
    filterBy.toyId = ObjectId(filterBy.toyId);
  } else if (filterBy.byUserId) {
    filterBy.byUserId = ObjectId(filterBy.byUserId);
  }
  try {
    // const criteria = _buildCriteria(filterBy)
    // const reviews = await collection.find(criteria).toArray()
    const collection = await dbService.getCollection('review');
    var reviews = await collection
      .aggregate([
        {
          $match: filterBy,
        },
        {
          $lookup: {
            from: 'user',
            localField: 'byUserId',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        {
          $unwind: '$byUser',
        },
        {
          $lookup: {
            from: 'toy',
            foreignField: '_id',
            localField: 'toyId',
            as: 'toy',
          },
        },
        {
          $unwind: '$toy',
        },
      ])
      .toArray();
    if (filterBy.toyId) {
      reviews = reviews.map((review) => {
        review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname };
        review.toy = { _id: review.toy._id, name: review.toy.name, price: review.toy.price };
        delete review.byUserId;
        delete review.toyId;
        return review;
      });
    }
    if (filterBy.byUserId) {
      reviews = reviews.map((review) => {
        review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname };
        review.toy = { _id: review.toy._id, name: review.toy.name, price: review.toy.price };
        delete review.byUserId;
        delete review.toyId;
        return review;
      });
    }

    return reviews;
  } catch (err) {
    logger.error('cannot find reviews', err);
    throw err;
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore();
    const { userId, isAdmin } = store;
    const collection = await dbService.getCollection('review');
    // remove only if user is owner/admin
    const query = { _id: ObjectId(reviewId) };
    if (!isAdmin) query.byUserId = ObjectId(userId);
    await collection.deleteOne(query);
    // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
  } catch (err) {
    // logger.error(`cannot remove review ${reviewId}`, err)
    throw err;
  }
}

async function add(review) {
  console.log('review:', review);
  try {
    // peek only updatable fields!
    const reviewToAdd = {
      byUserId: ObjectId(review.byUserId),
      toyId: ObjectId(review.toyId),
      txt: review.txt,
    };
    const collection = await dbService.getCollection('review');
    await collection.insertOne(reviewToAdd);
    return reviewToAdd;
  } catch (err) {
    // logger.error('cannot insert review', err)
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  return criteria;
}

module.exports = {
  query,
  remove,
  add,
};
