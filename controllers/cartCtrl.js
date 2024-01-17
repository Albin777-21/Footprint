const asyncHandler = require('express-async-handler')
const User = require('../model/userModel')
const Product = require('../model/productModel')

// Get Cart Function

const getCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        if (user) {

            const ProductIds = user.cart.map(x => x.ProductId)
            const product = await Product.find({ _id: { $in: ProductIds } })

            let totalSubTotal = 0
            let quantity = 0
            for (const item of user.cart) {
                totalSubTotal += item.subTotal;
                quantity += item.quantity
            }
            res.render('cart', { product, cart: user.cart, quantity, totalSubTotal, user })
        }
    } catch (error) {
        console.log('Error in Get Cart function', error);

    }
})

//ADD TO CART

const addToCart = asyncHandler(async (req, res) => {
    try {
        const id =String(req.query.id)
        console.log('yeeoooooo',id);
        const user = req.session.user
        const product = await Product.findById(id)
        console.log('yeeoooooo',product);
        const userData = await User.findById(user)

        if (userData) {
            const cartItem = userData.cart.find(item => String(item.ProductId) === String(id))

            if(cartItem){
            if (cartItem.quantity < product.quantity ) {
               
                const updated = await User.updateOne(
                    { _id: user, 'cart.ProductId': id },
                    {
                        $inc: {
                            'cart.$.quantity': 1,
                            'cart.$.subTotal': product.price,
                        },
                    }
                )
            
            } else {
                // userData.cart.push({
                //     ProductId: id,
                //     quantity: 1,
                //     total: product.price,
                //     subTotal: product.price,
                // });
                // const a = await userData.save()
                res.json({ status: false })
            }
        }else{
            userData.cart.push({
                ProductId: id,
                quantity: 1,
                total: product.price,
                subTotal: product.price,
            });
            const a = await userData.save()
        }
        }
        res.json({ status: true })

    } catch (error) {
        console.log('Error occured in cart controll AddtoCart function', error);

    }
})

//Delete Cart item

const deleteCartItem = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.id
        const userId = req.session.user
        const user = await User.findById(userId)

        if (user) {
            //Find the index of the cart item
            const itemIndex = user.cart.findIndex(item => item.ProductId.toString() === productId)
            if (itemIndex !== -1) {
                //Remove the cart item using the index
                user.cart.splice(itemIndex, 1)
                const a = await user.save()
                console.log('Item Removed From Cart', a);
                return res.json({ status: true })
            } else {
                console.log('no cart item found');
                return res.json({ status: false, message: 'No Cart item Found' })
            }
        } else {
            console.log('No User Found');
            return res.json({ status: false, message: 'No User Found' })
        }
    } catch (error) {
        console.log("Error in Cart controll", error);
        return res.json({ status: false, message: 'Internal Server Error' })

    }
})

// Add and Substract product count in Cart


const modifyCartQuantity=asyncHandler(async(req,res)=>{
    try {
        
        const productId=req.body.productId;
       
    const userId=req.session.user;
    
    const count = req.body.count;
   


    const user=await User.findById(userId);
    
    const product=await Product.findById(productId);
    

    if(user)
    

    {
        const cartItem=user.cart.find(item=>item.ProductId==productId);
    
        if(cartItem)
    

        {
            let newQuantity;
            if(count=='1')

            {
               
                newQuantity = cartItem.quantity + 1;
            }
            else if(count=='-1')
            {
              
                newQuantity = cartItem.quantity - 1;
            }else{
    

               res.json({ status: false, error: "Invalid count" });
            }
            if (newQuantity > 0 && newQuantity <= product.quantity) {
   

                const updated = await User.updateOne(
                    { _id: userId, 'cart.ProductId': productId },
                    {
                        $set: {
                            'cart.$.quantity': newQuantity, // Update the quantity
                            'cart.$.subTotal': (product.price * newQuantity), // Update the subtotal
                        },
                    }
                );
                const updatedUser = await user.save();
                console.log("this is upsdated ",updatedUser);
                   
                    const totalAmount = product.price * newQuantity;
                   
                    res.json({ status: true, quantityInput: newQuantity, total: totalAmount });
                } else {
      

                    res.json({ status: false, error: 'out of stock' });
                }
        }
    }

    } catch (error) {
        console.error('ERROR hapence in cart ctrl in the funtion update crt',error);
        return res.status(500).json({ status: false, error: "Server error" });
    }

    

})
//Delete Cart

const deleteCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)

        user.cart = []
        const updateUser = await user.save()
        console.log('This is updated user', updateUser);
        res.json({ status: true })
    } catch (error) {
        console.log('Error Happens in the deleteCart function', error);

    }
})

module.exports={
    addToCart,
    getCart,
    deleteCartItem,
    modifyCartQuantity,
    deleteCart,
    
}