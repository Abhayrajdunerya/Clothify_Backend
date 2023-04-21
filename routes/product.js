const express = require("express");
const router = express.Router();

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth');

// controllers
const {create, listAll, remove, read, update, list, productsCount, searchFilters, listRelated, productStar, getProducts, getProductWithVarients } = require('../controllers/product');

// routes
router.post('/product', authCheck, adminCheck, create);
router.get('/products/total', productsCount);
router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/product/:slug', read);
router.put('/product/:slug', authCheck, adminCheck, update);
router.post('/products', list); 

router.put('/product/star/:productId', authCheck, productStar);

router.get('/product/related/:productId', listRelated);

router.post('/search/filter', searchFilters);


router.get('/pro/getProducts', getProducts);
router.post('/pro/getProductWithVarients', getProductWithVarients);

module.exports = router;