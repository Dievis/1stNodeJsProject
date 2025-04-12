let mongoose = require('mongoose');

let favoriteSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('favorite', favoriteSchema);