const Brand = require('../models/brand');

exports.create =  async (req, res) => {
    try {
        // console.log(req.body);
        const newBrand = await new Brand(req.body).save();
        res.json(newBrand);
    } catch (err) {
        console.log(err);
        // res.status(400).send('Create Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}

exports.read =  async (req, res) => {
    const brand = await Brand.findById(req.params._id).exec();
    res.json(brand);
}

exports.listAll =  async (req, res) => {
    try {
        let brands = await Brand.find({}).exec()
        res.json(brands);
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
        let deletedBrand = await Brand.findOneAndRemove({name: req.params.slug}).exec();
        res.json(deletedBrand);
    } catch (err) {
        console.log(err);
        return res.status(400).send('Delete Brand Failed');
    }
}

exports.update =  async (req, res) => {
    try {
        const updatedBrand = await Brand.findOneAndUpdate({slug: req.params.slug}, req.body, {new: true}).exec();
        res.json(updatedBrand);
    } catch (err) {
        console.log(err);
        // return res.status(400).send('Update Product Failed');
        res.status(400).json({
            err: err.message,
        })
    }
}
