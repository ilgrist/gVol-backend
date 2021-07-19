const express = require('express');
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware');
const { getVol, getVols, deleteVol, updateVol, addVol } = require('./vol.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getVols);
router.get('/:id', getVol);
router.post('/', addVol);
router.put('/', updateVol);
router.delete('/:id', deleteVol);
// router.put('/', requireAuth, updateVol);
// router.post('/', requireAuth, addVol);
// router.delete('/:id', requireAuth, requireAdmin, deleteVol);

module.exports = router;
