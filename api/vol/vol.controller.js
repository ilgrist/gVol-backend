const volService = require('./vol.service');
const socketService = require('../../services/socket.service');
const logger = require('../../services/logger.service');


module.exports = {
  getVol,
  getVols,
  addVol,
  deleteVol,
  updateVol,
};

async function getVol(req, res) {
  try {
    const vol = await volService.getById(req.params.id);
    res.send(vol);
  } catch (err) {
    logger.error('Failed to get vol', err);
    res.status(500).send({ err: 'Failed to get vol' });
  }
}

async function getVols(req, res) {
  try {
    // const {filterBy} = req.body

    // const vols = await volService.query(filter);

    const vols = await volService.query();
    res.send(vols);
  } catch (err) {
    logger.error('Failed to get vols', err);
    res.status(500).send({ err: 'Failed to get vols' });
  }
}

async function deleteVol(req, res) {
  try {
    await volService.remove(req.params.id);
    res.send({ msg: 'Deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete vol', err);
    res.status(500).send({ err: 'Failed to delete vol' });
  }
}

async function updateVol(req, res) {
  console.log('HELLO');
  try {
    const vol = req.body;
    console.log('vol:', vol)
    const updatedVol = await volService.update(vol);
    res.send(updatedVol);
    // socketService.broadcast({ type: 'vol-updated', data: review, to: savedVol._id });
  } catch (err) {
    logger.error('Failed to update vol', err);
    res.status(500).send({ err: 'Failed to update vol' });
  }
}

async function addVol(req, res) {
  try {
    const vol = req.body;
    const savedVol = await volService.add(vol);
    res.send(savedVol);
    // socketService.broadcast({ type: 'vol-updated', data: review, to: savedVol._id });
  } catch (err) {
    logger.error('Failed to update vol', err);
    res.status(500).send({ err: 'Failed to update vol' });
  }
}


