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
const createBanner = asyncHandler(async (req, res) => {
    try {
        const { title, description, link } = req.body;

        // Validate request body fields
        if (!title || !description || !link) {
            return res.status(400).send("Title, description, and link are required.");
        }

        console.log('This is req.body', req.body);

        // Check if a file is present in the request
        if (!req.file) {
            return res.status(400).send("File is required.");
        }

        // Check if a banner with the same title already exists
        const alreadyExist = await Banner.findOne({ title });

        if (!alreadyExist) {
            const banner = new Banner({
                image: req.file.filename,
                title,
                description,
                date: Date.now(),
                link
            });

            // Save the banner to the database
            const savedBanner = await banner.save();

            console.log('This is banner', savedBanner);
            res.redirect('/admin/banner');
        } else {
            return res.status(400).send("Banner with the same title already exists.");
        }
    } catch (error) {
        console.log('Error happens in the createBanner function', error);
        res.status(500).send("Internal server error");
    }
});


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