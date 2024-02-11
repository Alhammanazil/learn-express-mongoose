const mongoose = require('mongoose')

const garmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Garment name is required']
    },
    location: {
        type: String,
    },
    contact: {
        type: Number,
        required: [true, 'Contact is required']
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
})

const Garment = mongoose.model('Garment', garmentSchema)

module.exports = Garment