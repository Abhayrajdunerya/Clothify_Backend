const express = require("express");
const router = express.Router();

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth');

// controllers
const {create, listAll, remove, read, update} = require('../controllers/brand');

// routes
router.post('/brand', authCheck, adminCheck, create);
router.get('/brands', listAll);
router.delete('/brand/:slug', authCheck, adminCheck, remove);
router.get('/brand/:_id', read);
router.put('/brand/:slug', authCheck, adminCheck, update);



module.exports = router;