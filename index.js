const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();
const ErrorHandler = require('./ErrorHandler');

// Models
const Product = require('./models/products');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/shop_db')
.then((result) => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB', err);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/products', async (req, res) => {
    try {
        const { category } = req.query;
        let products;
        if (category) {
            products = await Product.find({ category });
            return res.render('products/index', { products, category });
        } else {
            products = await Product.find({});
            return res.render('products/index', { products, category: 'All' });
        }
    } catch (err) {
        console.error('Error retrieving products', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/products/create', (req, res) => {
    res.render('products/create');
});

app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.redirect(`/products/${product._id}`);
    } catch (err) {
        throw new ErrorHandler('Product not found', 404);
    }
});

app.get('/products/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/show', { product });
    } catch (err) {
        next(new ErrorHandler('Product not found', 404));
    }
});

app.get('/products/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/edit', { product });
    } catch (err) {
        next(new ErrorHandler('Product not found', 404));
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true });
        res.redirect(`/products/${product._id}`);
    } catch (err) {
        console.error('Error updating product', err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.redirect('/products');
    } catch (err) {
        console.error('Error deleting product', err);
        res.status(500).send('Internal Server Error');
    }
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Internal Server Error' } = err;
    res.status(status).send(message);
});

app.listen(3000, () => {
    console.log('Shop App listening on http://127.0.0.1:3000')
});