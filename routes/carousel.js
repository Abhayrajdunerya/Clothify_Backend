const express = require('express')
const router = express.Router()

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')

// controllers
const {create, read} = require('../controllers/carousel')

// routes
router.get('/carousel', read)
router.post('/carousel/create', authCheck, adminCheck, create)

module.exports = router;