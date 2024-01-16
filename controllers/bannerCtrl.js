const asyncHandler=require('express-async-handler')
const Banner=require('../model/bannerModel')

//LOAD BANNER

const banner=asyncHandler(async(req,res)=>{
    try {
        const banner=await Banner.find()

        const itemsperpage=2
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(banner.length/2)
        const currentproduct=banner.slice(startindex,endindex)
        res.render('banner',{banner:currentproduct,totalpages,currentpage})
    } catch (error) {
        console.log("Error from the banner ctrl in the function banner",error);
        res.status(500).send("Internal server Error")
        
    }
})

// ADDNEW BANNER

const addNewBanner=asyncHandler(async(req,res)=>{
    try {
        res.render('addBanner')
    } catch (error) {
        console.log("Error happens in the addNewBanner function");
        res.status(500).send("Internal server error")
    }
})

//CREATE BANNER

const createBanner=asyncHandler(async(req,res)=>{
    try {
        const {title,description,link}=req.body
        console.log('This is req.body',req.body);
        const allreadyExist=await Banner.findOne({title})
        if(!allreadyExist){
            const banner=new Banner({
                image:req.file.filename,
                title,
                description,
                date:Date.now(),
                link
            })
            const a=await banner.save()
            console.log('This is banner',a);
            res.redirect('/admin/banner')

        }
    } catch (error) {
        console.log('Error happens in the createbannerFunction',error);
        res.status(500).send("Internal server error")
        
    }
})

//  EDIT BANNER

const editBanner=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const banner=await Banner.findById(id)
        if(banner){
            res.render('editBanner',{banner})
        }
    } catch (error) {
        console.log('Error happens in the editBanner function');
        res.status(500).send("Internal server error")
        
    }
})

//UPDATE BANNER

const updateBanner=asyncHandler(async(req,res)=>{
    try {
        const {title,description,link,id}=req.body
        const img=req.file?req.filename:null
        if(img){
            const update=await Banner.findByIdAndUpdate(id,{
                title,
                description,
                link,
                image:req.file.filename
            })
            console.log("This is updated Banner",update);
            res.redirect('/admin/banner')
        }else{
            const update=await Banner.findByIdAndUpdate(id,{
                title,
                description,
                link
            })
            res.redirect('/admin/banner')
        }
    } catch (error) {
        console.log("Error happens in update Banner function");
        res.status(500).send('Internal server error')
        
    }
})

//  DELETE BANNER

const deleteBanner=asyncHandler(async(req,res)=>{
    try {
        const id =req.query.id

        const banner=await Banner.findByIdAndDelete(id)
        if(banner){
            res.redirect('/admin/banner')
        }
    } catch (error) {
        console.log('Error happens in deleteBanner function');
        res.status(500).send("internal server Error")
        
    }
})
module.exports={
    banner,
    addNewBanner,
    createBanner,
    editBanner,
    updateBanner,
    deleteBanner

}