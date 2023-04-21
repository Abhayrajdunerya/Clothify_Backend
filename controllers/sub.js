const Sub = require('../models/sub');
const slugify = require('slugify');

exports.create = async (req, res) => {
    try {
        const {name, parent} = req.body;
        const sub = await new Sub({name, parent, slug: slugify(name).toLowerCase()}).save();
        res.json(sub);
    } catch (err) {
        console.log("SUB CREATE ERR ----> ", err);
        res.status(400).send('Create sub failed');
    }
};

exports.list = async (req, res) => {
    res.json(await Sub.find({}).sort({createdAt: -1}).exec());
};

exports.read = async (req, res) => {
    let sub = await Sub.findOne({slug: req.params.slug}).exec();
    res.json(sub);
};

exports.readSubByCategory = async (req, res) => {
    // console.log(req.params._id);
    let sub = await Sub.find({parent: req.params._id}).exec();
    res.json(sub);
};

exports.update = async (req, res) => {
    const {name, parent} = req.body;
    try {
        const updated = await Sub.findOneAndUpdate({slug: req.params.slug}, {name, parent, slug: slugify(name)}, {new: true}).exec();
        res.json(updated);
    } catch (err) {
        res.status(400).send('Update sub failed');
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await Sub.findOneAndDelete({slug: req.params.slug}).exec();
        res.json(deleted);
    } catch (err) {
        res.status(400).send('Delete sub failed');
    }
};
