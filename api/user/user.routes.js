const express = require('express');
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware');
const { getUser, getUsers, addUser, deleteUser, updateUser, login } = require('./user.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers);
router.get('/:id', getUser);

router.post('/', addUser);
// router.post('/:id', requireAuth,  addUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)
// router.put('/:id', requireAuth,  updateUser)

module.exports = router;
