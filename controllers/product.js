const Product = require('../models/product');
const User = require('../models/user');
const slugify = require('slugify');
const { query } = require('express');

exports.create =  async (req, res) => {
    try {
        let {title, size, color} = req.body;
        req.body.slug = slugify(title+'-'+size+'-'+color);
        const newProduct = await new Product(req.body).save();
        res.json(newProduct);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

exports.read =  async (req, res) => {
    const product = await Product.findOne({slug: req.params.slug})
    .populate('category')
    .populate('subs')
    .populate('brand')
    .exec();
    res.json(product);
}

exports.listAll =  async (req, res) => {
    try {
        let products = await Product.find({})
        .limit(parseInt(req.params.count))
        .populate('category')
        .populate('subs')
        .populate('brand')
        .sort([['createdAt', 'desc']])
        .exec()
        res.json(products);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

exports.remove =  async (req, res) => {
    try {
        let deletedProduct = await Product.findOneAndRemove({slug: req.params.slug}).exec();
        res.json(deletedProduct);
    } catch (err) {
        console.log(err);
        return res.status(400).send('Delete Product Failed');
    }
}

exports.update =  async (req, res) => {
    try {
        if (req.body.title) {
            let {title, size, color} = req.body;
            req.body.slug = slugify(title+'-'+size+'-'+color);
            // req.body.slug = slugify(req.body.title);
        }
        const updatedProduct = await Product.findOneAndUpdate({slug: req.params.slug}, req.body, {new: true}).exec();
        res.json(updatedProduct);
    } catch (err) {
        console.log(err);
        // return res.status(400).send('Update Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

// With Pagination
exports.list =  async (req, res) => {
    try {
        const {sort, order, page} = req.body;
        const currentPage = page || 1;
        const perPage = 10;

        const products = await Product.find({})
        .skip((currentPage-1) * perPage)
        .populate('category')
        .populate('subs')
        .populate('brand')
        .sort([[sort, order]])
        .limit(perPage)
        .exec();


        let products_ = {}

        for (let item of products) {
            if (item.title in products_) {
                if (!products_[item.title].color.includes(item.color) && item.quantity > 0) {
                    products_[item.title].color.push(item.color)
                }
                if (!products_[item.title].size.includes(item.size) && item.quantity > 0) {
                    products_[item.title].size.push(item.size)
                }
            } else {
                products_[item.title] = JSON.parse(JSON.stringify(item))
                if (item.quantity > 0) {
                    products_[item.title].color = [item.color]
                    products_[item.title].size = [item.size]
                }
            }
        }

        res.json(products_);

        
        // res.json(products);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

// Without Pagination
// exports.list =  async (req, res) => {
//     try {
//         const {sort, order, limit} = req.body;

//         const products = await Product.find({})
//         .populate('category')
//         .populate('subs')
//         .sort([[sort, order]])
//         .limit(limit)
//         .exec();
//         res.json(products);
//     } catch (err) {
//         console.log(err);
//         // res.status(400).send('Create Product Failed');
//         res.status(400).json({
//             err: err.message,
//         })
//     }
// }

exports.productsCount =  async (req, res) => {
    try {
        let total = await Product.find({}).estimatedDocumentCount().exec();
        res.json(total);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

exports.listRelated =  async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();
    const related = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
    })
    .limit(3)
    .populate('category')
    .populate('subs')
    // .populate('postedBy')
    .exec();

    res.json(related);

}

exports.productStar = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findOne({email: req.user.email}).exec();
    const {star} = req.body;

    // Who is updating?
    // Check if currently logged in user have already added rating to this product?
    let existingRatingObject = product.ratings.find(
        (ele) => ele.postedBy.toString() === user._id.toString()
    )

    // If user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id,
            {
                $push: {ratings: { star, postedBy: user._id }}
            },
            { new: true }
        ).exec();
        // console.log('ratingAdded', ratingAdded);
        res.json(ratingAdded);
    } else {
        // If user have already left rating, update it
        const ratingUpdated = await Product.updateOne(
            {
                ratings: { $elemMatch: existingRatingObject },
            },
            { $set: { 'ratings.$.star': star } },
            { new: true }
        ).exec();
        // console.log('ratingUpdated', ratingUpdated);
        res.json(ratingUpdated);
    }

}


// SEARCH FILTER

const handleQuery = async (req, res, query) => {
    const products = await Product.find({ $text: { $search: query } })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();
    res.json(products);
}

const handlePrice = async (req, res, price) => {
    try {
        let products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1],
            }
        })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

        res.json(products)

    } catch (err) {
        console.log(err);
    }
}

const handleCategory = async (req, res, category) => {
    try {
        let products = await Product.find({ category })
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('brand', '_id name')
            .exec();
        res.json(products);
    } catch (err) {
        console.log(err);
    }
}

const handleSub = async (req, res, sub) => {
    const products = await Product.find({subs: sub})
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleShipping = async (req, res, shipping) => {
    const products = await Product.find({ shipping })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleBrand = async (req, res, brand) => {
    const products = await Product.find({ brand })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleColor = async (req, res, color) => {
    const products = await Product.find({ color })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleSize = async (req, res, size) => {
    const products = await Product.find({ size })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleGender = async (req, res, gender) => {
    const products = await Product.find({ gender })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('brand', '_id name')
        .exec();

    res.json(products);
}

const handleStar = async (req, res, stars) => {
    Product.aggregate([
        {
            $project: {
                document: "$$ROOT",
                floorAverage: {
                    $floor: { $avg: "$ratings.star" },
                },
            },
        },
        { $match: {floorAverage: stars} }
    ]).limit(12).exec((err, aggregates) => {
        if (err) {
            console.log('AGGREGATE ERROR', err);
        } else {
            Product.find({ _id: aggregates })
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('brand', '_id name')
            .exec((err, products) => {
                if (err) {
                    console.log('PRODUCT AGGREGATE ERROR', err);
                } else {
                    res.json(products);
                }
            });
        }
    })
};




exports.searchFilters = async (req, res) => {
    const { query, price, category, stars, sub, shipping, color, brand, size, gender } = req.body;

    if (query) {
        // console.log('query --> ', query);
        await handleQuery(req, res, query);
        return;
    }

    // price [20, 200]
    if (price !== undefined) {
        // console.log('price ---> ', price);
        await handlePrice(req, res, price);
        return;
    }

    if (category) {
        // console.log('category ---> ', category);
        await handleCategory(req, res, category);
        return;
    }

    if (stars) {
        // console.log('stars ---> ', stars);
        await handleStar(req, res, stars);
        return;
    }

    if (sub) {
        // console.log('sub ---> ', sub);
        await handleSub(req, res, sub);
        return;
    }

    if (shipping) {
        // console.log('shipping ---> ', shipping);
        await handleShipping(req, res, shipping);
        return;
    }

    if (color) {
        // console.log('color ---> ', color);
        await handleColor(req, res, color);
        return;
    }

    if (brand) {
        // console.log('brand ---> ', brand);
        await handleBrand(req, res, brand);
        return;
    }

    if (size) {
        // console.log('size ---> ', size);
        await handleSize(req, res, size);
        return;
    }

    if (gender) {
        // console.log('gender ---> ', gender);
        await handleGender(req, res, gender);
        return;
    }
}



exports.getProducts = async (req, res) => {

    try {
        let products = await Product.find({}).exec()
        let shirts = {}

        for (let item of products) {
            if (item.title in shirts) {
                if (!shirts[item.title].color.includes(item.color) && item.quantity > 0) {
                    shirts[item.title].color.push(item.color)
                }
                if (!shirts[item.title].size.includes(item.size) && item.quantity > 0) {
                    shirts[item.title].size.push(item.size)
                }
            } else {
                shirts[item.title] = JSON.parse(JSON.stringify(item))
                if (item.quantity > 0) {
                    shirts[item.title].color = [item.color]
                    shirts[item.title].size = [item.size]
                }
            }
        }

        res.json(shirts);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }

}

exports.getProductWithVarients = async (req, res) => {
    try {
        let product = await Product.findOne({slug: req.body.slug})
        let varients = await Product.find({title: product.title, category: product.category})
        let colorSizeSlug = {}
        for (let item of varients) {
            if (Object.keys(colorSizeSlug).includes(item.color)) {
                colorSizeSlug[item.color][item.size] = {slug: item.slug}
            } else {
                colorSizeSlug[item.color] = {}
                colorSizeSlug[item.color][item.size] = {slug: item.slug}
            }
        }

        res.json({product_: JSON.parse(JSON.stringify(product)), varients: JSON.parse(JSON.stringify(colorSizeSlug))})

    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}