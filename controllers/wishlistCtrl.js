const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')
const Product=require('../model/productModel')

//ADD TO WISHLIST

const addToList = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user;
        const user = await User.findById(userId);

        if (user) {
            const productAlreadyExist = user.wishlist.some(item => item.productId === productId);

            if (productAlreadyExist) {
                res.json({ status: false, message: 'Product already exists in the wishlist.' });
            } else {
                user.wishlist.push({
                    productId: productId
                });
                const length = user.wishlist.length
                console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                console.log(length);

                const updatedUser = await user.save();
                res.json({ status: true,length:length, message: 'Product added to the wishlist successfully.' });
            }
        } else {
            res.status(404).json({ status: false, message: 'User not found.' });
        }
    } catch (error) {
        console.log('Error in the addToWishlist function', error);
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
});


//DELETE WISHLIST

const deleteWishlistItem=asyncHandler(async(req,res)=>{
    try {
        const productId=req.query.id
        const userId=req.session.user
        const user=await User.findById(userId)

        if(user){
            const productIndex=user.wishlist.findIndex(item=>item.productId===productId)

            if(productIndex!==-1){
                user.wishlist.splice(productIndex,1)
                await user.save()
                res.redirect('/Wishlist')
            }else{
                console.log("No Product Found In The Wishlist");
            }
        }else{
            console.log('User Not Found In the Wishlist');
        }
    } catch (error) {
        console.log('Error in the Deletewishlist Function',error);
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
        
    }
})

//WISHLIST PAGE

const Wishlist=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user
        const user=await User.findById(userId)
        const wishlist=user.wishlist
        const productId=wishlist.map(item=>item.productId)

        //USE $IN OPERATOR TO FIND PRODUCTS WITH MATCHING ID

        const products=await Product.find({_id: {$in:productId}})

        if(products){
            res.render('Wishlist',{products:products,user})
        }
    } catch (error) {
        console.log('Error in the wishlist function',error);
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
        
    }
})

module.exports={
    addToList,
    deleteWishlistItem,
    Wishlist

}