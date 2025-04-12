let mongoose = require('mongoose')
let roleSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true,
    },description:{
        type:String,
        default:""
    }
},{
    timestamps:true
})
module.exports = mongoose.model('role',roleSchema)
