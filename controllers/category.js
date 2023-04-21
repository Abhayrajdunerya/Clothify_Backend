const Category = require('../models/category')
const Sub = require('../models/sub')
const slugify = require('slugify')

exports.list = async (req, res) => {
    res.json(await Category.find({}).sort({createdAt: -1}).exec());
};

exports.create = async (req, res) => {
    try {
        const {name, images} = req.body;
        const category = await new Category({name, slug: slugify(name).toLowerCase(), images}).save();
        res.json(category);
    } catch (err) {
        // console.log(err);
        res.status(400).send('Create category failed');
    }
}

exports.read = async (req, res) => {
    const category = await Category.findOne({slug: req.params.slug}).exec()
    res.json(category);
}

exports.readById = async (req, res) => {
    // console.log('_id ===> ', req.params._id);
    const category = await Category.findById(req.params._id).exec()
    res.json(category);
}

exports.update = async (req, res) => {
    const {name} = req.body;
    try {
        const updated = await Category.findOneAndUpdate({slug: req.params.slug}, {name, slug: slugify(name)}, {new: true}).exec();
        res.json(updated);
    } catch (err) {
        res.status(400).send('Update category failed');
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await Category.findOneAndDelete({slug: req.params.slug}).exec();
        res.json(deleted);
    } catch (err) {
        res.status(400).send('Delete category failed');
    }
};

exports.getSubs = async (req, res) => {
    Sub.find({parent: req.params._id}).exec((err, subs) => {
        if (err) {
            console.log(err);
        } else {
            res.json(subs);
        }
    })
};

