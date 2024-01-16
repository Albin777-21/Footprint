const mongoose=require('mongoose')


var bannerSchema=new mongoose.Schema({
    image:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,

    },
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model('Banner',bannerSchema)