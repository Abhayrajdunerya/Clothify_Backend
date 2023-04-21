const express = require('express')
const router = express.Router()

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')

// controllers
const {create, read, update, remove, list, getSubs, readById} = require('../controllers/category')

// routes
router.post('/category', authCheck, adminCheck, create)
router.get('/category/:slug', read)
router.get('/categoryById/:_id', readById)
router.put('/category/:slug', authCheck, adminCheck, update)
router.delete('/category/:slug', authCheck, adminCheck, remove)

router.get('/categories', list)
router.get('/category/subs/:_id', getSubs)

module.exports = router;