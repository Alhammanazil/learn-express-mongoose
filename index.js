const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();
const ErrorHandler = require('./ErrorHandler');

// Models
const Product = require('./models/products');
const Garment = require('./models/garment');

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

function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(err => next(err));
    }
}

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/garments', wrapAsync(async (req, res) => {
    const garments = await Garment.find({});
    res.render('garment/index', { garments });
}));

app.get('/garments/create', (req, res) => {
    res.render('garment/create');
});

app.post('/garments', wrapAsync(async (req, res) => {
    const garment = new Garment(req.body);
    await garment.save();
    res.redirect(`/garments`);
}));

app.get('/garments/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const garment = await Garment.findById(id).populate('products');
    res.render('garment/show', { garment });
}));

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

app.post('/products', wrapAsync(async (req, res) => {
        const product = new Product(req.body);
        await product.save();
        res.redirect(`/products/${product._id}`);
}));

app.get('/products/:id', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/show', { product });
}));

app.get('/products/:id/edit', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.render('products/edit', { product });
}));

app.put('/products/:id', wrapAsync(async (req, res) => {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true });
        res.redirect(`/products/${product._id}`);
}));

app.delete('/products/:id', wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.redirect('/products');
}));

const validatorHandler = err => {
    err.status = 400;
    err.message = Object.values(err.errors).map(item => item.message);
    return new ErrorHandler(err.message, err.status);
}

app.use((err, req, res, next) => {
    console.dir(err);
    if (err.name === 'ValidationError') err = validatorHandler(err);
    if (err.name === 'CastError') {
        err.status = 404;
        err.message = 'Product not found';
    }
    next(err);
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Internal Server Error' } = err;
    res.status(status).send(message);
});

app.listen(3000, () => {
    console.log('Shop App listening on http://127.0.0.1:3000')
});