const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  query,
  getById,
  remove,
  update,
  add,
  addMsg,
};

async function query(filterBy) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection('vol');
    var vols = await collection.find(criteria).toArray();
    let filteredVols = JSON.parse(JSON.stringify(vols));
    if (filterBy.userId) {
      filteredVols = filteredVols.filter((vol) => {
        if (!vol.members) return false;
        return vol.members.some((member) => {
          return member._id === filterBy.userId;
        });
      });
    }
    if (filterBy.category !== 'all') {
      filteredVols = filteredVols.filter((vol) => {
        const tags = vol.tags;
        return tags.some((tag) => tag === filterBy.category);
      });
    }
    if (filterBy.skills !== 'all') {
      filteredVols = filteredVols.filter((vol) => {
        const skills = vol.reqSkills;
        return skills.some((skill) => skill === filterBy.skills);
      });
    }
    if (filterBy.isOnLine) {
      filteredVols = filteredVols.filter((vol) => !vol.loc.isOnsite);
    }
    if (filterBy.isOnSite) {
      filteredVols = filteredVols.filter((vol) => vol.loc.isOnsite);
    }
    if(filterBy.availability === 'avalible'){
      filteredVols = filteredVols.filter((vol) => {
        const freePlaces = vol.maxMembers - vol.members.length
        if(freePlaces){
          return vol
        }
      });
    }
    return filteredVols;
  } catch (err) {
    logger.error('cannot find vols', err);
    throw err;
  }
}

async function getById(volId) {
  try {
    const collection = await dbService.getCollection('vol');
    const vol = await collection.findOne({ _id: ObjectId(volId) });

    return vol;
  } catch (err) {
    logger.error(`while finding vol ${volId}`, err);
    throw err;
  }
}

async function remove(volId) {
  try {
    const collection = await dbService.getCollection('vol');
    await collection.deleteOne({ _id: ObjectId(volId) });
  } catch (err) {
    logger.error(`cannot remove vol ${volId}`, err);
    throw err;
  }
}

async function update(vol) {
  try {
    // peek only updatable fields!
    const volToSave = JSON.parse(JSON.stringify(vol));
    volToSave._id = ObjectId(vol._id);
    const collection = await dbService.getCollection('vol');
    await collection.updateOne({ _id: volToSave._id }, { $set: volToSave });
    return volToSave;
  } catch (err) {
    logger.error(`cannot update vol ${vol._id}`, err);
    throw err;
  }
}

async function add(vol) {
  try {
    // peek only updatable fields!
    const volToAdd = JSON.parse(JSON.stringify(vol));
    const collection = await dbService.getCollection('vol');
    await collection.insertOne(volToAdd);
    return volToAdd;
  } catch (err) {
    logger.error('cannot insert vol', err);
    throw err;
  }
}
async function addMsg(msg, volId) {
  try {
    msg.createdAt = Date.now();
    const vol = await getById(volId);
    if (!vol.msgs) vol.msgs = [];
    vol.msgs.push(msg);
    const collection = await dbService.getCollection('vol');
    await collection.updateOne({ _id: vol._id }, { $set: vol });
    return vol;
  } catch (err) {
    console.log("volService: couldn't add msg", err);
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
    criteria.$or = [
      {
        title: txtCriteria,
      },
      {
        loc: { country: txtCriteria },
      },
    ];
  }
  return criteria;
}
