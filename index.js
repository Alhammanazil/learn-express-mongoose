const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();

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
        const products = await Product.find({});
        res.render('products/index', { products });
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
        console.error('Error creating product', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/show', { product });
    } catch (err) {
        console.error('Error retrieving product', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/products/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/edit', { product });
    } catch (err) {
        console.error('Error retrieving product for editing', err);
        res.status(500).send('Internal Server Error');
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


app.listen(3000, () => {
    console.log('Shop App listening on http://127.0.0.1:3000')
});