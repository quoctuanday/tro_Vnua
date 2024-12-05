const Category = require('../models/Category');

class CategoryController {
    create(req, res) {
        const name = req.body.data;
        console.log(name);
        const data = {
            name: name,
        };
        Category.findOne({ name: name })
            .then((category) => {
                if (category)
                    res.status(400).json({
                        message: 'Category already exists',
                    });
                else {
                    const category = new Category(data);
                    category
                        .save()
                        .then(() => {
                            console.log('Created category successfully');
                            res.status(200).json({
                                message: 'Create category successfully',
                            });
                        })
                        .catch((error) => {
                            console.log('Create cate error: ', error);
                            res.status(500).json({
                                message: 'Interval server error',
                            });
                        });
                }
            })
            .catch((error) => {
                console.error('Error finding category: ', error);
                res.status(500).json({
                    message: 'Internal server error',
                });
            });
    }

    get(req, res) {
        Category.find()
            .then((category) => {
                res.status(200).json({ message: 'List category', category });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).json({ message: 'Internal server error' });
            });
    }
    update(req, res) {
        const categoryId = req.params.categoryId;
        const data = req.body.data.updatedCategory;
        console.log(data);
        Category.findByIdAndUpdate(categoryId, data)
            .then((category) => {
                if (!category)
                    return res
                        .status(404)
                        .json({ message: 'Category not found' });
                res.status(200).json({ message: 'Category updated' });
            })
            .catch((error) => {
                console.log('Error updating category', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    delete(req, res) {
        const categoryId = req.params.categoryId;
        Category.findByIdAndDelete(categoryId)
            .then(() => {
                res.status(200).json({ message: 'Category deleted' });
            })
            .catch((error) => {
                console.log('Error deleting category', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new CategoryController();
