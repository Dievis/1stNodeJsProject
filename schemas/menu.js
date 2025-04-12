let mongoose = require('mongoose')
let menuSchema = new mongoose.Schema({
    text:String,
    url:String,
    order:Number,
    parent:{
        type:mongoose.Types.ObjectId,
        ref:'menu'
    }
},{
    timestamps:true
})
module.exports = mongoose.model('menu',menuSchema)
