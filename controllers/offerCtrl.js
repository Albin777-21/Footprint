const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')
const Order=require('../model/orderModel')
const Product=require('../model/productModel')
const Category=require('../model/categoryModel')

//RENDER THE PRODUCTOFFER PAGE

const productOfferpage=asyncHandler(async(req,res)=>{
    try {
        const product=await Product.find()
        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)

        res.render('productOffer',{product:currentproduct,totalpages,currentpage})
    } catch (error) {
        console.log("Error in the offerCtrl productOfferpage",error);
        res.status(500).send("Internal Server Error")

        
    }
})

//UPDATING THE PRODUCT OFFER
//-----------------updating the product offer---------------
const updateOffer = asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
        const { id, offerPrice } = req.body;

        // Fetch the product before updating
        const product = await Product.findById(id);

        // Update the offerPrice and adjust the price accordingly
        product.offerPrice = offerPrice;
        product.price = product.price - offerPrice;
        console.log(product.price);

        // Save the updated product
        await product.save();

        console.log('Updated product:', product);

        res.redirect('/admin/productOfferpage');
    } catch (error) {
        console.log('Error happened in the offerctrl in the function updateOffer:', error);
        // Handle the error appropriately, e.g., send an error response to the client
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//OFFER FOR CATEGORY

const categoryOffer=asyncHandler(async(req,res)=>{
    try {
        const category=await Category.find()

        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(category.length/8)
        const currentproduct=category.slice(startindex,endindex)

        res.render('categoryOffer',{category:currentproduct,totalpages,currentpage})
    } catch (error) {
        console.log('Error happens in the categoryoffer in offerctrl',error);
        res.status(500).send("An error Occured")
        
    }
})

//UPDATE CATEGORY OFFER

const updateCategoryOffer=asyncHandler(async(req,res)=>{
    try {
        const {id,offerPercentage}=req.body

        const category=await Category.findById(id)

        const products=await Product.find({category:category.name})

        //UPDATE PRICE BASED ON THE  OFFERPERCENTAGE
        products.forEach(async (product) => {
            if (!product.offerPrice) {
                const newOfferPrice = (offerPercentage / 100) * product.price;
                const newPrice = product.price - newOfferPrice;

                // Update the product
                await Product.findByIdAndUpdate(product._id, {
                    offerPrice: newOfferPrice,
                    price: newPrice,
                });
            }
        });
        res.redirect('/admin/productOfferpage')

    } catch (error) {
        console.log('Error in the updateproduct offer in the offerctrl',error);
        res.status(500).send("An Error Occured")
        
    }
})


module.exports={
    productOfferpage,
    updateOffer,
    categoryOffer,
    updateCategoryOffer



}