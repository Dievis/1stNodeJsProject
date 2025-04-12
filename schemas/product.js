let mongoose = require('mongoose');
const reviewSchema = require('./review').schema;


let productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },quantity:{
        type:Number,
        min:0,
        required:true
    },price:{
        type:Number,
        min:0,
        required:true
    },description:{
        type:String,
        default:""
    },reviews:[reviewSchema], // Array of review subdocuments
    rating:{
        type:Number,
        default:0
    },ratingCount:{
        type:Number,
        default:0
    },discount:{
        type:Number,
        min:0,
        max:100,
        default:0
    },imgURL:{
        type:String,
        default:""
    },category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    }
    ,isDeleted:{
        type:Boolean,
        default:false
    },
    slug:String
},{
    timestamps:true
})
module.exports = mongoose.model('product',productSchema)
// Tao 1 schema cho obj category gồm name,description, timestamp